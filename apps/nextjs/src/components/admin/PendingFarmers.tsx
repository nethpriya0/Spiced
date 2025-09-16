import { useState } from 'react'
import { type Address } from 'viem'
import { useFarmerRegistry } from '@/hooks/useFarmerRegistry'
import { FarmerVerificationCard } from './FarmerVerificationCard'

export function PendingFarmers() {
  const { 
    pendingFarmers,
    isLoading,
    error,
    refreshData 
  } = useFarmerRegistry()
  
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    await refreshData()
    setRefreshing(false)
  }

  const handleFarmerVerified = () => {
    // Refresh the list after verification
    refreshData()
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-spice-green border-t-transparent rounded-full animate-spin mr-3" />
          <span className="text-gray-600">Loading pending farmers...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Pending Farmers</h2>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-spice-green text-white rounded-lg hover:bg-spice-green-dark disabled:opacity-50"
          >
            {refreshing ? 'Refreshing...' : 'Retry'}
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-semibold">Error loading farmers</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Pending Farmers</h2>
          <p className="text-sm text-gray-600 mt-1">
            {pendingFarmers.length} farmer{pendingFarmers.length !== 1 ? 's' : ''} awaiting verification
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing || isLoading}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 flex items-center space-x-2"
        >
          <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      <div className="p-6">
        {pendingFarmers.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              All Caught Up!
            </h3>
            <p className="text-gray-600">
              No farmers are currently pending verification.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingFarmers.map((farmerAddress: Address) => (
              <FarmerVerificationCard
                key={farmerAddress}
                farmerAddress={farmerAddress}
                onVerified={handleFarmerVerified}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}