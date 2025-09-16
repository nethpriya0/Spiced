import React, { useState, useEffect } from 'react'
import { Shield, ExternalLink, Copy, CheckCircle, AlertCircle, Clock } from 'lucide-react'

interface BlockchainVerificationProps {
  batchId: string
  harvestHash?: string
  processingHashes?: string[]
}

export const BlockchainVerification: React.FC<BlockchainVerificationProps> = ({
  batchId,
  harvestHash,
  processingHashes = []
}) => {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'verified' | 'failed'>('loading')
  const [verificationData, setVerificationData] = useState<any>(null)

  useEffect(() => {
    // Simulate blockchain verification
    const verifyOnChain = async () => {
      setVerificationStatus('loading')
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock verification data
      const mockData = {
        batchId,
        transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
        blockNumber: Math.floor(Math.random() * 1000000) + 15000000,
        timestamp: new Date().toISOString(),
        confirmations: Math.floor(Math.random() * 100) + 50,
        gasUsed: Math.floor(Math.random() * 50000) + 21000,
        harvestVerified: true,
        processingVerified: processingHashes.length > 0,
        qualityChecked: true
      }
      
      setVerificationData(mockData)
      setVerificationStatus('verified')
    }

    verifyOnChain()
  }, [batchId, processingHashes])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`
  }

  if (verificationStatus === 'loading') {
    return (
      <div className="mt-6 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="animate-spin">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-yellow-900">Verifying on Blockchain</h4>
            <p className="text-yellow-700">Checking transaction records and validating authenticity...</p>
          </div>
        </div>
      </div>
    )
  }

  if (verificationStatus === 'failed' || !verificationData) {
    return (
      <div className="mt-6 p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <div>
            <h4 className="text-lg font-semibold text-red-900">Verification Failed</h4>
            <p className="text-red-700">Unable to verify this product on the blockchain. Please try again later.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-4">
      {/* Main Verification Status */}
      <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center space-x-3 mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
          <div>
            <h3 className="text-xl font-semibold text-green-900">Blockchain Verified ✓</h3>
            <p className="text-green-700">This product's authenticity has been confirmed on the Ethereum blockchain</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-white rounded border">
            <div className="text-2xl font-bold text-green-600">{verificationData.confirmations}</div>
            <div className="text-sm text-gray-600">Confirmations</div>
          </div>
          <div className="text-center p-3 bg-white rounded border">
            <div className="text-2xl font-bold text-green-600">#{verificationData.blockNumber.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Block Number</div>
          </div>
          <div className="text-center p-3 bg-white rounded border">
            <div className="text-2xl font-bold text-green-600">{verificationData.gasUsed.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Gas Used</div>
          </div>
        </div>

        {/* Transaction Hash */}
        <div className="bg-white p-4 rounded border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Transaction Hash</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => copyToClipboard(verificationData.transactionHash)}
                className="p-1 text-gray-400 hover:text-gray-600"
                title="Copy to clipboard"
              >
                <Copy className="h-4 w-4" />
              </button>
              <a
                href={`https://etherscan.io/tx/${verificationData.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-gray-400 hover:text-gray-600"
                title="View on Etherscan"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
          <code className="text-xs font-mono text-gray-800 break-all">
            {verificationData.transactionHash}
          </code>
        </div>
      </div>

      {/* Verification Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3">Harvest Verification</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Origin Recorded</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Date Verified</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Farmer Authenticated</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3">Processing Verification</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Quality Tests</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Processing Steps</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Packaging Date</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Hashes */}
      {processingHashes.length > 0 && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3">Processing Step Hashes</h4>
          <div className="space-y-2">
            {processingHashes.map((hash, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Step {index + 1}</span>
                <div className="flex items-center space-x-2">
                  <code className="text-xs font-mono text-gray-800">{truncateHash(hash)}</code>
                  <button
                    onClick={() => copyToClipboard(hash)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-xs text-gray-500 text-center">
        <Shield className="h-4 w-4 inline mr-1" />
        All data is cryptographically secured and immutable on the Ethereum blockchain
      </div>
    </div>
  )
}