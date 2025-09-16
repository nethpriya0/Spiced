import React from 'react'
import { Lock, Shield, CheckCircle, ExternalLink } from 'lucide-react'
import { type PassportData } from '@/lib/contracts/SpicePassportService'

interface LockedPassportBadgeProps {
  passport: PassportData
  transactionHash?: string
  variant?: 'default' | 'compact' | 'banner'
  className?: string
}

export function LockedPassportBadge({ 
  passport, 
  transactionHash,
  variant = 'default',
  className = '' 
}: LockedPassportBadgeProps) {
  
  const openTransaction = () => {
    if (transactionHash) {
      const explorerUrl = `https://sepolia.etherscan.io/tx/${transactionHash}`
      window.open(explorerUrl, '_blank')
    }
  }
  
  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 bg-green-100 border border-green-200 rounded-full ${className}`}>
        <Lock className="h-3 w-3 text-green-600" />
        <span className="text-xs font-medium text-green-700">Sealed</span>
      </div>
    )
  }
  
  if (variant === 'banner') {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-green-900">
                Passport Sealed Successfully
              </h3>
              <p className="text-xs text-green-700 mt-1">
                This passport is now immutable and blockchain-secured
              </p>
            </div>
          </div>
          
          {transactionHash && (
            <button
              onClick={openTransaction}
              className="text-xs text-green-600 hover:text-green-800 flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              View Transaction
            </button>
          )}
        </div>
      </div>
    )
  }
  
  return (
    <div className={`bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-green-600" />
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-green-900">
              Digital Passport Sealed
            </h3>
          </div>
          
          <p className="text-green-700 text-sm mb-3">
            Batch #{passport.batchId} has been permanently sealed on the blockchain. 
            This passport is now immutable and ready for marketplace listing.
          </p>
          
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-green-600">
              <Lock className="h-4 w-4" />
              <span>Immutable Record</span>
            </div>
            
            <div className="flex items-center gap-1 text-green-600">
              <Shield className="h-4 w-4" />
              <span>Blockchain Secured</span>
            </div>
            
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Market Ready</span>
            </div>
            
            {transactionHash && (
              <button
                onClick={openTransaction}
                className="flex items-center gap-1 text-green-600 hover:text-green-800 hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                <span>View on Explorer</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LockedPassportBadge