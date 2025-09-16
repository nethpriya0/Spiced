import React, { useState, useEffect } from 'react'
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Package, 
  Calendar,
  User,
  Hash,
  CreditCard,
  Shield,
  Timer,
  Gavel
} from 'lucide-react'
import { EscrowService, type EscrowTransaction } from '@/lib/contracts/EscrowService'
import { DisputeModal } from './DisputeModal'
import { type Address, type Hash as TxHash } from 'viem'

interface EscrowManagementProps {
  userAddress: Address
  walletClient?: any
  role: 'buyer' | 'seller'
}

interface EscrowActionResult {
  success: boolean
  transactionHash?: TxHash
  error?: string
}

export const EscrowManagement: React.FC<EscrowManagementProps> = ({
  userAddress,
  walletClient,
  role
}) => {
  const [escrows, setEscrows] = useState<EscrowTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [escrowService, setEscrowService] = useState<EscrowService | null>(null)
  const [showDisputeModal, setShowDisputeModal] = useState(false)
  const [selectedEscrow, setSelectedEscrow] = useState<EscrowTransaction | null>(null)

  // Initialize escrow service
  useEffect(() => {
    if (walletClient && !escrowService) {
      try {
        const service = new EscrowService({
          contractAddress: process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS as Address,
          walletClient
        })
        setEscrowService(service)
      } catch (err) {
        setError('Failed to initialize escrow service')
        console.error('Escrow service initialization failed:', err)
      }
    }
  }, [walletClient, escrowService])

  // Load user's escrows
  useEffect(() => {
    if (escrowService && userAddress) {
      loadEscrows()
    }
  }, [escrowService, userAddress])

  const loadEscrows = async () => {
    if (!escrowService) return

    try {
      setLoading(true)
      setError(null)

      let escrowIds: number[] = []
      
      if (role === 'buyer') {
        escrowIds = await escrowService.getEscrowsByBuyer(userAddress)
      } else {
        escrowIds = await escrowService.getEscrowsBySeller(userAddress)
      }

      // Fetch detailed data for each escrow
      const escrowPromises = escrowIds.map(id => escrowService.getEscrow(id))
      const escrowResults = await Promise.all(escrowPromises)
      
      // Filter out null results and sort by creation date
      const validEscrows = escrowResults
        .filter((escrow): escrow is EscrowTransaction => escrow !== null)
        .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))

      setEscrows(validEscrows)
    } catch (err) {
      console.error('Failed to load escrows:', err)
      setError('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmDelivery = async (escrowId: bigint): Promise<EscrowActionResult> => {
    if (!escrowService) {
      return { success: false, error: 'Service not available' }
    }

    try {
      setActionLoading(`confirm-${escrowId}`)
      const hash = await escrowService.confirmDelivery(Number(escrowId))
      await loadEscrows() // Refresh the list
      return { success: true, transactionHash: hash }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Confirmation failed'
      return { success: false, error }
    } finally {
      setActionLoading(null)
    }
  }

  const handleInitiateDispute = async (escrowId: bigint, evidence: string): Promise<EscrowActionResult> => {
    if (!escrowService) {
      return { success: false, error: 'Service not available' }
    }

    try {
      setActionLoading(`dispute-${escrowId}`)
      const hash = await escrowService.initiateDispute(Number(escrowId), evidence)
      await loadEscrows() // Refresh the list
      return { success: true, transactionHash: hash }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Dispute initiation failed'
      return { success: false, error }
    } finally {
      setActionLoading(null)
    }
  }

  const handleClaimExpired = async (escrowId: bigint): Promise<EscrowActionResult> => {
    if (!escrowService) {
      return { success: false, error: 'Service not available' }
    }

    try {
      setActionLoading(`claim-${escrowId}`)
      const hash = await escrowService.claimExpiredFunds(Number(escrowId))
      await loadEscrows() // Refresh the list
      return { success: true, transactionHash: hash }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Claim failed'
      return { success: false, error }
    } finally {
      setActionLoading(null)
    }
  }

  const formatAddress = (address: Address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDaysUntilExpiry = (confirmDeadline: bigint) => {
    const now = Date.now()
    const deadline = Number(confirmDeadline) * 1000
    const diffMs = deadline - now
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED': return 'bg-green-100 text-green-800'
      case 'DISPUTED': return 'bg-red-100 text-red-800'
      case 'RESOLVED': return 'bg-blue-100 text-blue-800'
      case 'REFUNDED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />
      case 'CONFIRMED': return <CheckCircle className="h-4 w-4" />
      case 'DISPUTED': return <AlertTriangle className="h-4 w-4" />
      case 'RESOLVED': return <Gavel className="h-4 w-4" />
      case 'REFUNDED': return <CreditCard className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  const renderEscrowCard = (escrow: EscrowTransaction) => {
    const daysLeft = getDaysUntilExpiry(escrow.confirmDeadline)
    const isExpired = daysLeft === 0
    const canConfirm = role === 'buyer' && escrow.status === 'PENDING' && !isExpired
    const canDispute = escrow.status === 'PENDING' && !isExpired
    const canClaim = escrow.status === 'PENDING' && isExpired

    return (
      <div key={escrow.escrowId.toString()} className="border border-gray-200 rounded-lg p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-5 w-5 text-gray-400" />
              <span className="font-medium text-gray-900">
                Batch #{escrow.batchId}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Hash className="h-4 w-4" />
                <span>Escrow #{Number(escrow.escrowId)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(escrow.createdAt)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(escrow.status)}`}>
              {getStatusIcon(escrow.status)}
              {escrow.status}
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">
                {EscrowService.formatEscrowForDisplay(escrow).amount} ETH
              </p>
            </div>
          </div>
        </div>

        {/* Participants */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Buyer</span>
            </div>
            <p className="text-sm font-mono text-gray-600">{formatAddress(escrow.buyer)}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Seller</span>
            </div>
            <p className="text-sm font-mono text-gray-600">{formatAddress(escrow.seller)}</p>
          </div>
        </div>

        {/* Timeline Info */}
        {escrow.status === 'PENDING' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Timer className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                {isExpired ? 'Confirmation Period Expired' : 'Confirmation Period'}
              </span>
            </div>
            <p className="text-sm text-blue-800">
              {isExpired 
                ? 'Seller can now claim funds automatically'
                : `${daysLeft} day(s) remaining for buyer confirmation`
              }
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          {canConfirm && (
            <button
              onClick={() => handleConfirmDelivery(escrow.escrowId)}
              disabled={actionLoading === `confirm-${escrow.escrowId}`}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {actionLoading === `confirm-${escrow.escrowId}` ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Confirming...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Confirm Delivery
                </>
              )}
            </button>
          )}

          {canDispute && (
            <button
              onClick={() => {
                setSelectedEscrow(escrow)
                setShowDisputeModal(true)
              }}
              disabled={actionLoading === `dispute-${escrow.escrowId}`}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Manage Dispute
            </button>
          )}

          {escrow.status === 'DISPUTED' && (
            <button
              onClick={() => {
                setSelectedEscrow(escrow)
                setShowDisputeModal(true)
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Gavel className="h-4 w-4" />
              View Dispute
            </button>
          )}

          {canClaim && role === 'seller' && (
            <button
              onClick={() => handleClaimExpired(escrow.escrowId)}
              disabled={actionLoading === `claim-${escrow.escrowId}`}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {actionLoading === `claim-${escrow.escrowId}` ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Claiming...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Claim Funds
                </>
              )}
            </button>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-orange-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            My {role === 'buyer' ? 'Purchases' : 'Sales'}
          </h2>
        </div>
        
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading transactions...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-orange-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            My {role === 'buyer' ? 'Purchases' : 'Sales'}
          </h2>
        </div>
        
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Transactions</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadEscrows}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-orange-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            My {role === 'buyer' ? 'Purchases' : 'Sales'}
          </h2>
        </div>
        
        <button
          onClick={loadEscrows}
          className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          title="Refresh"
        >
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"></div>
        </button>
      </div>

      {/* Transactions List */}
      {escrows.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No transactions found
          </h3>
          <p className="text-gray-600">
            {role === 'buyer' 
              ? "You haven't made any purchases yet."
              : "You haven't made any sales yet."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {escrows.map(renderEscrowCard)}
        </div>
      )}

      {/* Dispute Modal */}
      {showDisputeModal && selectedEscrow && (
        <DisputeModal
          escrow={selectedEscrow}
          userAddress={userAddress}
          walletClient={walletClient}
          onClose={() => {
            setShowDisputeModal(false)
            setSelectedEscrow(null)
          }}
          onDisputeAction={() => {
            loadEscrows() // Refresh the list
          }}
        />
      )}
    </div>
  )
}

export default EscrowManagement