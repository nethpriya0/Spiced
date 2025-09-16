import React, { useState, useEffect } from 'react'
import { 
  AlertTriangle, 
  Upload, 
  FileText, 
  X, 
  Send,
  Clock,
  Users,
  Gavel,
  Shield,
  CheckCircle
} from 'lucide-react'
import { EscrowService, type EscrowTransaction, type DisputeVote } from '@/lib/contracts/EscrowService'
import { type Hash, type Address } from 'viem'

interface DisputeModalProps {
  escrow: EscrowTransaction
  userAddress: Address
  walletClient?: any
  onClose: () => void
  onDisputeAction: () => void
}

type DisputeStep = 'initiate' | 'active' | 'voting' | 'resolved'

interface DisputeData {
  evidence: string
  votes: DisputeVote[]
  isArbitrator: boolean
  hasVoted: boolean
  userVote?: 'BUYER' | 'SELLER'
}

export const DisputeModal: React.FC<DisputeModalProps> = ({
  escrow,
  userAddress,
  walletClient,
  onClose,
  onDisputeAction
}) => {
  const [step, setStep] = useState<DisputeStep>('initiate')
  const [evidence, setEvidence] = useState('')
  const [disputeData, setDisputeData] = useState<DisputeData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [escrowService, setEscrowService] = useState<EscrowService | null>(null)

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
      }
    }
  }, [walletClient, escrowService])

  // Determine initial step based on escrow status
  useEffect(() => {
    if (escrow.status === 'DISPUTED') {
      setStep('active')
      loadDisputeData()
    } else if (escrow.status === 'RESOLVED') {
      setStep('resolved')
      loadDisputeData()
    } else {
      setStep('initiate')
    }
  }, [escrow.status])

  const loadDisputeData = async () => {
    if (!escrowService) return

    try {
      const votes = await escrowService.getDisputeVotes(Number(escrow.escrowId))
      const isArbitrator = escrow.arbitrators.includes(userAddress)
      const hasVoted = votes.some(vote => vote.arbitrator.toLowerCase() === userAddress.toLowerCase())
      const userVote = votes.find(vote => vote.arbitrator.toLowerCase() === userAddress.toLowerCase())?.vote

      setDisputeData({
        evidence: 'Product did not match description and quality expectations.',
        votes,
        isArbitrator,
        hasVoted,
        userVote
      })
    } catch (err) {
      console.error('Failed to load dispute data:', err)
      setError('Failed to load dispute information')
    }
  }

  const handleInitiateDispute = async () => {
    if (!escrowService || !evidence.trim()) {
      setError('Please provide evidence for the dispute')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await escrowService.initiateDispute(Number(escrow.escrowId), evidence)
      onDisputeAction()
      setStep('active')
      await loadDisputeData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate dispute')
    } finally {
      setLoading(false)
    }
  }

  const handleVoteOnDispute = async (vote: 'BUYER' | 'SELLER') => {
    if (!escrowService) {
      setError('Service not available')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await escrowService.voteOnDispute(Number(escrow.escrowId), vote)
      onDisputeAction()
      await loadDisputeData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote')
    } finally {
      setLoading(false)
    }
  }

  const handleResolveDispute = async () => {
    if (!escrowService) {
      setError('Service not available')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await escrowService.resolveDispute(Number(escrow.escrowId))
      onDisputeAction()
      setStep('resolved')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve dispute')
    } finally {
      setLoading(false)
    }
  }

  const renderInitiateStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <AlertTriangle className="h-16 w-16 text-amber-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Initiate Dispute
        </h3>
        <p className="text-gray-600">
          If there's an issue with this transaction, you can initiate a dispute for community resolution.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">Important Notes:</p>
            <ul className="space-y-1">
              <li>• Disputes can only be initiated within the 30-day confirmation period</li>
              <li>• A small arbitration fee will be deducted from the escrow</li>
              <li>• Community arbitrators will review your evidence</li>
              <li>• The losing party's reputation will be affected</li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Evidence Description *
        </label>
        <textarea
          value={evidence}
          onChange={(e) => setEvidence(e.target.value)}
          placeholder="Describe the issue in detail. What went wrong? How does the product/service differ from what was promised?"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
          rows={6}
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleInitiateDispute}
          disabled={loading || !evidence.trim()}
          className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Initiating...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Initiate Dispute
            </>
          )}
        </button>
      </div>
    </div>
  )

  const renderActiveStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Gavel className="h-16 w-16 text-blue-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Dispute Active
        </h3>
        <p className="text-gray-600">
          Community arbitrators are reviewing this dispute and will cast their votes.
        </p>
      </div>

      {/* Dispute Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Dispute Evidence</h4>
        <p className="text-sm text-blue-800">
          {disputeData?.evidence || 'Evidence provided by the disputing party.'}
        </p>
      </div>

      {/* Arbitrators */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-5 w-5 text-gray-400" />
          <h4 className="font-medium text-gray-900">Selected Arbitrators</h4>
        </div>
        
        <div className="space-y-2">
          {escrow.arbitrators.map((arbitrator, index) => {
            const hasVoted = disputeData?.votes.some(vote => vote.arbitrator === arbitrator)
            return (
              <div key={arbitrator} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="font-mono text-sm text-gray-600">
                  {arbitrator.slice(0, 6)}...{arbitrator.slice(-4)}
                </span>
                <span className={`text-sm ${hasVoted ? 'text-green-600' : 'text-yellow-600'}`}>
                  {hasVoted ? 'Voted' : 'Pending'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Voting Interface for Arbitrators */}
      {disputeData?.isArbitrator && !disputeData?.hasVoted && (
        <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
          <h4 className="font-medium text-orange-900 mb-3">Cast Your Vote</h4>
          <p className="text-sm text-orange-800 mb-4">
            As a selected arbitrator, please review the evidence and cast your vote.
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={() => handleVoteOnDispute('BUYER')}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              Vote for Buyer
            </button>
            <button
              onClick={() => handleVoteOnDispute('SELLER')}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Vote for Seller
            </button>
          </div>
        </div>
      )}

      {/* User's Vote Display */}
      {disputeData?.hasVoted && disputeData?.userVote && (
        <div className="border border-green-200 bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-900">
              You voted for: {disputeData.userVote === 'BUYER' ? 'Buyer' : 'Seller'}
            </span>
          </div>
        </div>
      )}

      {/* Resolve Button (for anyone when voting is complete) */}
      {disputeData && disputeData.votes.length >= escrow.arbitrators.length && (
        <button
          onClick={handleResolveDispute}
          disabled={loading}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Resolving...
            </>
          ) : (
            <>
              <Gavel className="h-4 w-4" />
              Resolve Dispute
            </>
          )}
        </button>
      )}

      <button
        onClick={onClose}
        className="w-full px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        Close
      </button>
    </div>
  )

  const renderResolvedStep = () => {
    if (!disputeData) return null

    const buyerVotes = disputeData.votes.filter(vote => vote.vote === 'BUYER').length
    const sellerVotes = disputeData.votes.filter(vote => vote.vote === 'SELLER').length
    const winner = buyerVotes > sellerVotes ? 'BUYER' : 'SELLER'

    return (
      <div className="space-y-6">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Dispute Resolved
          </h3>
          <p className="text-gray-600">
            The community has resolved this dispute through arbitration.
          </p>
        </div>

        <div className={`border-2 rounded-lg p-6 text-center ${
          winner === 'BUYER' ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'
        }`}>
          <h4 className={`text-xl font-bold mb-2 ${
            winner === 'BUYER' ? 'text-green-900' : 'text-blue-900'
          }`}>
            {winner === 'BUYER' ? 'Buyer' : 'Seller'} Won
          </h4>
          <p className={`text-sm ${
            winner === 'BUYER' ? 'text-green-800' : 'text-blue-800'
          }`}>
            Arbitrator Votes: {winner === 'BUYER' ? buyerVotes : sellerVotes} out of {disputeData.votes.length}
          </p>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Vote Breakdown</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Votes for Buyer:</span>
              <span className="font-medium">{buyerVotes}</span>
            </div>
            <div className="flex justify-between">
              <span>Votes for Seller:</span>
              <span className="font-medium">{sellerVotes}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Close
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Dispute Resolution
              </h2>
              <p className="text-sm text-gray-600">
                Escrow #{Number(escrow.escrowId)} - Batch #{escrow.batchId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {step === 'initiate' && renderInitiateStep()}
          {step === 'active' && renderActiveStep()}
          {step === 'resolved' && renderResolvedStep()}
        </div>
      </div>
    </div>
  )
}

export default DisputeModal