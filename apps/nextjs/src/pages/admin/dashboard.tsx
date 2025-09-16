import Head from 'next/head'
import { withAdminAuth } from '@/middleware/withAdminAuth'
import { PendingFarmers } from '@/components/admin/PendingFarmers'
import { useFarmerRegistry } from '@/hooks/useFarmerRegistry'
import { useAuth } from '@/hooks/useAuth'

function AdminDashboard() {
  const { user } = useAuth()
  const { 
    farmerCount, 
    verifiedCount, 
    pendingFarmers,
    isLoading 
  } = useFarmerRegistry()

  const pendingCount = pendingFarmers.length

  return (
    <>
      <Head>
        <title>Admin Dashboard - Spice Platform</title>
        <meta name="description" content="Admin dashboard for farmer verification" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Farmer verification and platform management
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.name || 'Admin User'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user?.address ? `${user.address.slice(0, 8)}...` : 'Unknown'}
                  </div>
                </div>
                <div className="w-8 h-8 bg-spice-green rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0) || 'A'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Total Farmers
                  </h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {isLoading ? '...' : farmerCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Verified Farmers
                  </h3>
                  <p className="text-3xl font-bold text-green-600">
                    {isLoading ? '...' : verifiedCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <span className="text-2xl">⏳</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Pending Verification
                  </h3>
                  <p className="text-3xl font-bold text-yellow-600">
                    {isLoading ? '...' : pendingCount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button className="border-b-2 border-spice-green py-2 px-1 text-sm font-medium text-spice-green">
                Pending Farmers
              </button>
              <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                Verified Farmers
              </button>
              <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                Badge Management
              </button>
            </nav>
          </div>

          {/* Pending Farmers Section */}
          <PendingFarmers />
        </div>
      </div>
    </>
  )
}

// Protect the admin dashboard with verifier role requirement
export default withAdminAuth(AdminDashboard, { requiredRole: 'verifier' })