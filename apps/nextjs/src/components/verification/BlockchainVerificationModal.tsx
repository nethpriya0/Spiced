import React, { useState, useEffect } from 'react'
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Copy, 
  Loader2,
  AlertTriangle,
  Database,
  Hash,
  Calendar,
  User,
  Package
} from 'lucide-react'

interface BlockchainVerificationModalProps {
  batchId: string
  verificationHash: string
  onClose: () => void
}

interface VerificationData {
  websiteData: {
    batchId: string
    farmerAddress: string
    spiceType: string
    harvestDate: string
    sealedAt: string
    totalWeight: number
  }
  blockchainData: {
    batchId: string
    farmerAddress: string
    spiceType: string
    harvestDate: string
    sealedAt: string
    totalWeight: number
    transactionHash: string
    blockNumber: number
    gasUsed: string
  }
  verification: {
    batchIdMatch: boolean
    farmerMatch: boolean
    spiceTypeMatch: boolean
    harvestDateMatch: boolean
    weightMatch: boolean
    overallValid: boolean
  }
}

export const BlockchainVerificationModal: React.FC<BlockchainVerificationModalProps> = ({
  batchId,
  verificationHash,
  onClose
}) => {
  const [loading, setLoading] = useState(true)
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const performVerification = async () => {
      setLoading(true)
      setError(null)

      try {
        // Simulate blockchain verification process
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Mock verification data - in production, this would:
        // 1. Fetch current website data
        // 2. Query blockchain for the same batch ID
        // 3. Compare all data points
        const mockVerification: VerificationData = {
          websiteData: {
            batchId: batchId,
            farmerAddress: '0x1234567890123456789012345678901234567890',
            spiceType: 'Ceylon Cinnamon',
            harvestDate: '2024-01-15',
            sealedAt: '2024-01-20T14:30:00Z',
            totalWeight: 2500 // grams
          },
          blockchainData: {
            batchId: batchId,
            farmerAddress: '0x1234567890123456789012345678901234567890',
            spiceType: 'Ceylon Cinnamon', 
            harvestDate: '2024-01-15',
            sealedAt: '2024-01-20T14:30:00Z',
            totalWeight: 2500, // grams
            transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
            blockNumber: 18234567,
            gasUsed: '142,350'
          },
          verification: {
            batchIdMatch: true,
            farmerMatch: true,
            spiceTypeMatch: true,
            harvestDateMatch: true,
            weightMatch: true,
            overallValid: true
          }
        }

        setVerificationData(mockVerification)

      } catch (err) {
        setError('Failed to verify blockchain data. Please try again.')
        console.error('Blockchain verification failed:', err)
      } finally {
        setLoading(false)
      }
    }

    performVerification()
  }, [batchId, verificationHash])

  const handleCopyHash = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard')
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getVerificationIcon = (isMatch: boolean) => {
    return isMatch ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Blockchain Verification
              </h2>
              <p className="text-sm text-gray-600">
                Batch #{batchId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Verifying Data Integrity
              </h3>
              <p className="text-gray-600">
                Comparing website data with blockchain records...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Verification Failed
              </h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          ) : verificationData ? (
            <div className="space-y-8">
              {/* Overall Status */}
              <div className={`p-6 rounded-lg border-2 ${
                verificationData.verification.overallValid 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-red-200 bg-red-50'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  {verificationData.verification.overallValid ? (
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-600" />
                  )}
                  <div>
                    <h3 className={`text-xl font-bold ${
                      verificationData.verification.overallValid 
                        ? 'text-green-900' 
                        : 'text-red-900'
                    }`}>
                      {verificationData.verification.overallValid 
                        ? 'Verification Successful' 
                        : 'Verification Failed'
                      }
                    </h3>
                    <p className={`text-sm ${
                      verificationData.verification.overallValid 
                        ? 'text-green-700' 
                        : 'text-red-700'
                    }`}>
                      {verificationData.verification.overallValid 
                        ? 'All data points match between website and blockchain'
                        : 'Some data points do not match between sources'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Comparison Table */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Data Comparison
                </h3>
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data Point
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Website
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Blockchain
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Match
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Batch ID
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {verificationData.websiteData.batchId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {verificationData.blockchainData.batchId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {getVerificationIcon(verificationData.verification.batchIdMatch)}
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Farmer Address
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                          {formatAddress(verificationData.websiteData.farmerAddress)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                          {formatAddress(verificationData.blockchainData.farmerAddress)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {getVerificationIcon(verificationData.verification.farmerMatch)}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Spice Type
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {verificationData.websiteData.spiceType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {verificationData.blockchainData.spiceType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {getVerificationIcon(verificationData.verification.spiceTypeMatch)}
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Harvest Date
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {formatDate(verificationData.websiteData.harvestDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {formatDate(verificationData.blockchainData.harvestDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {getVerificationIcon(verificationData.verification.harvestDateMatch)}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Total Weight
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {verificationData.websiteData.totalWeight}g
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {verificationData.blockchainData.totalWeight}g
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {getVerificationIcon(verificationData.verification.weightMatch)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Blockchain Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Blockchain Transaction Details
                </h3>
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Hash className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Transaction Hash:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-gray-600">
                        {formatAddress(verificationData.blockchainData.transactionHash)}
                      </span>
                      <button
                        onClick={() => handleCopyHash(verificationData.blockchainData.transactionHash)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Copy transaction hash"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Block Number:</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      #{verificationData.blockchainData.blockNumber.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Gas Used:</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {verificationData.blockchainData.gasUsed}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Sealed At:</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {formatDate(verificationData.blockchainData.sealedAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t">
                <a
                  href={`https://sepolia.etherscan.io/tx/${verificationData.blockchainData.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  View on Etherscan
                </a>

                <div className="flex gap-3">
                  {copied && (
                    <span className="text-sm text-green-600 py-2">
                      Copied to clipboard!
                    </span>
                  )}
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default BlockchainVerificationModal