import { useState } from 'react'
import { User, Calendar, Award, ExternalLink } from 'lucide-react'
import { type Address } from 'viem'

interface FarmerData {
  address: Address
  name: string
  bio: string
  profilePictureHash: string
  reputationScore: number
  isVerified: boolean
  dateJoined: number
  verifiedBadges: string[]
  batchesCreated: number[]
}

interface VerifiedFarmersTableProps {
  farmers: FarmerData[]
  onAddBadge: (address: Address, badgeName: string) => Promise<void>
  onRefresh: () => Promise<void>
}

export function VerifiedFarmersTable({ 
  farmers, 
  onAddBadge, 
  onRefresh 
}: VerifiedFarmersTableProps) {
  const [selectedFarmer, setSelectedFarmer] = useState<FarmerData | null>(null)
  const [showBadgeModal, setShowBadgeModal] = useState(false)
  const [newBadgeName, setNewBadgeName] = useState('')

  const handleAddBadge = async () => {
    if (!selectedFarmer || !newBadgeName.trim()) return

    try {
      await onAddBadge(selectedFarmer.address, newBadgeName.trim())
      setShowBadgeModal(false)
      setNewBadgeName('')
      setSelectedFarmer(null)
    } catch (error) {
      console.error('Failed to add badge:', error)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (farmers.length === 0) {
    return (
      <div className="text-center py-12">
        <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Verified Farmers</h3>
        <p className="text-gray-600">No farmers have been verified yet.</p>
        <button
          onClick={onRefresh}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Farmer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Verified Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reputation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Badges
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Products
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {farmers.map((farmer) => (
              <tr key={farmer.address} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {farmer.profilePictureHash ? (
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={`https://gateway.pinata.cloud/ipfs/${farmer.profilePictureHash.replace('ipfs://', '')}`}
                          alt={farmer.name}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            target.nextElementSibling!.classList.remove('hidden')
                          }}
                        />
                      ) : null}
                      <div className={`h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center ${farmer.profilePictureHash ? 'hidden' : ''}`}>
                        <User className="h-6 w-6 text-gray-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 flex items-center">
                        {farmer.name}
                        <div className="ml-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatAddress(farmer.address)}
                      </div>
                      {farmer.bio && (
                        <div className="text-xs text-gray-400 max-w-xs truncate">
                          {farmer.bio}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    {formatDate(farmer.dateJoined)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">
                      {farmer.reputationScore}
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        farmer.reputationScore >= 80
                          ? 'bg-green-100 text-green-800'
                          : farmer.reputationScore >= 60
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {farmer.reputationScore >= 80 ? 'Good' : farmer.reputationScore >= 60 ? 'Fair' : 'Poor'}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1">
                    {farmer.verifiedBadges.length > 0 ? (
                      farmer.verifiedBadges.map((badge, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                        >
                          <Award className="h-3 w-3 mr-1" />
                          {badge}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No badges</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                    {farmer.batchesCreated.length} products
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => {
                        setSelectedFarmer(farmer)
                        setShowBadgeModal(true)
                      }}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <Award className="h-4 w-4 mr-1" />
                      Add Badge
                    </button>
                    <a
                      href={`/marketplace/farmer/${farmer.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Profile
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Badge Modal */}
      {showBadgeModal && selectedFarmer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Add Badge to {selectedFarmer.name}
              </h3>
              
              {/* Current Badges */}
              {selectedFarmer.verifiedBadges.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Current Badges:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedFarmer.verifiedBadges.map((badge, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                      >
                        <Award className="h-3 w-3 mr-1" />
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Badge Name
                </label>
                <input
                  type="text"
                  value={newBadgeName}
                  onChange={(e) => setNewBadgeName(e.target.value)}
                  placeholder="e.g., Organic Certified, Premium Quality, Top Seller"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Common badges: Organic Certified, Premium Quality, Top Seller, Reliable Supplier
                </p>
              </div>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowBadgeModal(false)
                    setNewBadgeName('')
                    setSelectedFarmer(null)
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBadge}
                  disabled={!newBadgeName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Add Badge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}