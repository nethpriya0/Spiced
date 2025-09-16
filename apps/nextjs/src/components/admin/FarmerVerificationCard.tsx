import { useState, useEffect } from 'react'
import { type Address } from 'viem'
import { useFarmerRegistry } from '@/hooks/useFarmerRegistry'
import { type UserProfile } from '@/lib/contracts/FarmerRegistryService'

interface FarmerVerificationCardProps {
  farmerAddress: Address
  onVerified: () => void
}

export function FarmerVerificationCard({ 
  farmerAddress, 
  onVerified 
}: FarmerVerificationCardProps) {
  const { verifyFarmer, getFarmerProfile, isLoading } = useFarmerRegistry()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  // Load farmer profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const farmerProfile = await getFarmerProfile(farmerAddress)
        setProfile(farmerProfile)
      } catch (error) {
        console.error('Failed to load farmer profile:', error)
        setError('Failed to load farmer profile')
      }
    }

    loadProfile()
  }, [farmerAddress, getFarmerProfile])

  const handleVerifyClick = () => {
    setShowConfirmModal(true)
  }

  const handleConfirmVerification = async () => {
    setIsVerifying(true)
    setError(null)
    setShowConfirmModal(false)

    try {
      const hash = await verifyFarmer(farmerAddress)
      
      if (hash) {
        onVerified()
      }
    } catch (error) {
      console.error('Verification failed:', error)
      setError('Failed to verify farmer')
    } finally {
      setIsVerifying(false)
    }
  }

  const formatAddress = (address: Address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString()
  }

  if (!profile) {
    return (
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            {/* Profile Picture */}
            <div className="w-12 h-12 bg-spice-green rounded-full flex items-center justify-center text-white font-semibold">
              {profile.name.charAt(0).toUpperCase()}
            </div>

            {/* Farmer Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {profile.name}
                </h3>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Pending
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-2">
                {profile.bio}
              </p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>
                  <strong>Address:</strong> {formatAddress(farmerAddress)}
                </span>
                <span>
                  <strong>Joined:</strong> {formatDate(profile.dateJoined)}
                </span>
                <span>
                  <strong>Reputation:</strong> {profile.reputationScore.toString()}
                </span>
              </div>

              {profile.profilePictureHash && (
                <div className="mt-2">
                  <a 
                    href={`${process.env.NEXT_PUBLIC_IPFS_GATEWAY}${profile.profilePictureHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View Profile Picture →
                  </a>
                </div>
              )}

              {error && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="ml-4">
            <button
              onClick={handleVerifyClick}
              disabled={isVerifying || isLoading}
              className={`
                px-4 py-2 rounded-lg font-semibold text-white
                ${isVerifying || isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
                }
              `}
            >
              {isVerifying ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : (
                'Verify Farmer'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Farmer Verification
            </h3>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to verify <strong>{profile.name}</strong>? 
              This action will mark them as a verified farmer and cannot be undone easily.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-3 mb-6">
              <div className="text-sm space-y-1">
                <div><strong>Name:</strong> {profile.name}</div>
                <div><strong>Address:</strong> {formatAddress(farmerAddress)}</div>
                <div><strong>Joined:</strong> {formatDate(profile.dateJoined)}</div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmVerification}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Confirm Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}