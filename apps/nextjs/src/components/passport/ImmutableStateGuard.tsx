import React, { useState } from 'react'
import { Lock, Shield, AlertTriangle, ExternalLink, Eye, EyeOff, Info } from 'lucide-react'
import { type PassportData } from '@/lib/contracts/SpicePassportService'
import { useAuth } from '@/hooks/useAuth'

interface ImmutableStateGuardProps {
  passport: PassportData | null
  loading?: boolean
  children: React.ReactNode
  redirectUrl?: string
  allowView?: boolean // Allow viewing locked content without editing
  onEditAttempt?: () => void // Callback when user tries to edit locked content
  showBlockchainProof?: boolean // Show blockchain verification info
}

export function ImmutableStateGuard({ 
  passport, 
  loading = false, 
  children,
  redirectUrl = '/products',
  allowView = true,
  onEditAttempt,
  showBlockchainProof = true
}: ImmutableStateGuardProps) {
  const { user } = useAuth()
  const currentAddress = user?.address
  const [isViewing, setIsViewing] = useState(allowView)
  const [editAttemptCount, setEditAttemptCount] = useState(0)
  
  // Handle edit attempts on locked passport
  const handleEditAttempt = React.useCallback(() => {
    setEditAttemptCount(prev => prev + 1)
    if (onEditAttempt) {
      onEditAttempt()
    }
  }, [onEditAttempt])

  // Add click listeners to detect edit attempts for locked passports
  React.useEffect(() => {
    if (passport && (passport.isLocked || passport.status === 1)) {
      const handleClick = (e: Event) => {
        const target = e.target as HTMLElement
        if (target.closest('input, textarea, button, select, [contenteditable]')) {
          e.preventDefault()
          e.stopPropagation()
          handleEditAttempt()
        }
      }

      document.addEventListener('click', handleClick, true)
      return () => document.removeEventListener('click', handleClick, true)
    }
  }, [passport?.isLocked, passport?.status, handleEditAttempt])
  
  // Show loading state while passport data loads
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }
  
  // Show error if passport not found
  if (!passport) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-900 mb-2">
            Passport Not Found
          </h2>
          <p className="text-red-700 mb-4">
            The requested passport could not be found or you don&apos;t have permission to access it.
          </p>
          <a
            href={redirectUrl}
            className="inline-block px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Back to Products
          </a>
        </div>
      </div>
    )
  }

  // Show locked state warning if passport is locked
  if (passport.isLocked || passport.status === 1) {
    const isOwner = currentAddress && passport.owner.toLowerCase() === currentAddress.toLowerCase()
    
    return (
      <div className="max-w-4xl mx-auto">
        {/* Locked State Warning */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-semibold text-green-900">
                  This Passport is Sealed
                </h2>
                {allowView && (
                  <button
                    onClick={() => setIsViewing(!isViewing)}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    {isViewing ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {isViewing ? 'Hide Details' : 'Show Details'}
                  </button>
                )}
              </div>
              <p className="text-green-700 text-sm mb-3">
                This digital passport has been permanently sealed and is now immutable. 
                No further modifications can be made to preserve the integrity of the provenance record.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-green-600">
                <div className="flex items-center gap-1">
                  <Lock className="h-4 w-4" />
                  <span>Blockchain Secured</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  <span>Tamper Proof</span>
                </div>
                <div>
                  Status: <span className="font-medium">Ready for Sale</span>
                </div>
                <div>
                  Owner: <span className="font-medium">{isOwner ? 'You' : 'Farmer'}</span>
                </div>
              </div>
              
              {showBlockchainProof && (
                <div className="mt-3 p-3 bg-green-100 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-green-800 mb-2">
                    <Info className="h-4 w-4" />
                    <span className="font-medium">Blockchain Verification</span>
                  </div>
                  <div className="text-xs text-green-700">
                    Batch #{Number(passport.batchId)} • Created: {new Date(Number(passport.dateCreated) * 1000).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {editAttemptCount > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Edit Attempt Detected ({editAttemptCount} time{editAttemptCount > 1 ? 's' : ''})
                </span>
              </div>
              <p className="text-xs text-yellow-700 mt-1">
                This passport is permanently sealed. All modification attempts are logged for security.
              </p>
            </div>
          )}
        </div>
        
        {/* Conditional content rendering */}
        {isViewing ? (
          <div className={`relative ${!allowView ? 'opacity-60 pointer-events-none select-none' : ''}`}>
            {!allowView && (
              <div className="absolute inset-0 bg-white bg-opacity-50 z-10 flex items-center justify-center">
                <div className="bg-white p-4 rounded-lg shadow-lg border">
                  <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm text-center">Content hidden for sealed passport</p>
                </div>
              </div>
            )}
            <div className="passport-content-locked">
              {children}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Lock className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p>Passport details hidden. Click &quot;Show Details&quot; to view.</p>
          </div>
        )}
        
        {/* Enhanced action buttons */}
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <a
            href={redirectUrl}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Back to Products
          </a>
          {isOwner && (
            <a
              href={`/products/view/${passport.batchId}`}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View Full Details
            </a>
          )}
          <a
            href={`/marketplace/list/${passport.batchId}`}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            List on Marketplace
          </a>
        </div>
      </div>
    )
  }
  
  // Show children for editable passports
  return (
    <div className="passport-content-editable">
      {children}
    </div>
  )
}

// Custom hook for immutable state checking
export function useImmutableCheck(passport: PassportData | null) {
  const isLocked = passport?.isLocked || passport?.status === 1
  const canEdit = passport && !isLocked
  const canView = !!passport
  
  return {
    isLocked,
    canEdit,
    canView,
    status: passport?.status,
    lockDate: isLocked && passport ? new Date(Number(passport.dateCreated) * 1000) : null
  }
}

export default ImmutableStateGuard