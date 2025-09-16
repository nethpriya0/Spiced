import { useState } from 'react'
import { CheckCircle, XCircle, User, Calendar, Award } from 'lucide-react'
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

interface PendingFarmersTableProps {
  farmers: FarmerData[]
  onVerifyFarmer: (address: Address) => Promise<void>
  onAddBadge: (address: Address, badgeName: string) => Promise<void>
  onRefresh: () => Promise<void>
}

export function PendingFarmersTable({ 
  farmers, 
  onVerifyFarmer, 
  onAddBadge, 
  onRefresh 
}: PendingFarmersTableProps) {
  const [verifyingFarmer, setVerifyingFarmer] = useState<Address | null>(null)
  const [selectedFarmer, setSelectedFarmer] = useState<FarmerData | null>(null)
  const [showBadgeModal, setShowBadgeModal] = useState(false)
  const [newBadgeName, setNewBadgeName] = useState('')

  const handleVerifyFarmer = async (farmer: FarmerData) => {
    setVerifyingFarmer(farmer.address)
    try {
      await onVerifyFarmer(farmer.address)
    } finally {
      setVerifyingFarmer(null)
    }
  }

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
        <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Farmers</h3>
        <p className="text-gray-600">All farmers have been verified or there are no registrations.</p>
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
                Joined Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reputation
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
                      <div className="text-sm font-medium text-gray-900">
                        {farmer.name}
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
                      Badge
                    </button>
                    <button
                      onClick={() => handleVerifyFarmer(farmer)}
                      disabled={verifyingFarmer === farmer.address}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {verifyingFarmer === farmer.address ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Verify
                        </>
                      )}
                    </button>
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
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Badge Name
                </label>
                <input
                  type="text"
                  value={newBadgeName}
                  onChange={(e) => setNewBadgeName(e.target.value)}
                  placeholder="e.g., Organic Certified, Premium Quality"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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