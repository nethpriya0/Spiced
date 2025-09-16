import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Shield, Users, CheckCircle, XCircle, Clock, Search } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { PendingFarmersTable } from '@/components/admin/PendingFarmersTable'
import { VerifiedFarmersTable } from '@/components/admin/VerifiedFarmersTable'
import { AdminStats } from '@/components/admin/AdminStats'
import { farmerRegistryService } from '@/lib/contracts/FarmerRegistryService'
import type { Address } from 'viem'

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

export default function AdminDashboardPage() {
  const { user, walletClient, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'pending' | 'verified'>('pending')
  const [pendingFarmers, setPendingFarmers] = useState<FarmerData[]>([])
  const [verifiedFarmers, setVerifiedFarmers] = useState<FarmerData[]>([])
  const [stats, setStats] = useState({
    totalFarmers: 0,
    verifiedFarmers: 0,
    pendingFarmers: 0
  })
  const [loadingFarmers, setLoadingFarmers] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Check admin access
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user)) {
      router.push('/login?role=farmer')
      return
    }

    // TODO: In production, check if user has admin role from smart contract
    // For now, allow any authenticated user to access admin dashboard
    if (isAuthenticated && user && walletClient) {
      initializeFarmerRegistry()
    }
  }, [isAuthenticated, isLoading, user, walletClient, router])

  const initializeFarmerRegistry = async () => {
    if (!user?.address || !walletClient) return

    try {
      if (!process.env.NEXT_PUBLIC_DIAMOND_PROXY_ADDRESS) {
        throw new Error('Diamond proxy contract address not configured')
      }

      farmerRegistryService.initialize({
        contractAddress: process.env.NEXT_PUBLIC_DIAMOND_PROXY_ADDRESS as Address,
        walletClient
      })

      await loadFarmersData()
    } catch (err) {
      console.error('Failed to initialize farmer registry:', err)
      setError('Failed to initialize admin interface. Please check your connection.')
      setLoadingFarmers(false)
    }
  }

  const loadFarmersData = async () => {
    setLoadingFarmers(true)
    setError(null)

    try {
      // Get farmer counts
      const totalCount = await farmerRegistryService.getFarmerCount()
      const verifiedCount = await farmerRegistryService.getVerifiedFarmerCount()
      
      setStats({
        totalFarmers: Number(totalCount),
        verifiedFarmers: Number(verifiedCount),
        pendingFarmers: Number(totalCount) - Number(verifiedCount)
      })

      // Get pending farmers
      const pendingAddresses = await farmerRegistryService.getPendingFarmers()
      const pendingData: FarmerData[] = []
      
      for (const address of pendingAddresses) {
        try {
          const profile = await farmerRegistryService.getUserProfile(address)
          const batches = await farmerRegistryService.getFarmerBatches(address)
          
          pendingData.push({
            address,
            name: profile.name,
            bio: profile.bio,
            profilePictureHash: profile.profilePictureHash,
            reputationScore: Number(profile.reputationScore),
            isVerified: profile.isVerified,
            dateJoined: Number(profile.dateJoined),
            verifiedBadges: profile.verifiedBadges,
            batchesCreated: batches.map(id => Number(id))
          })
        } catch (profileError) {
          console.warn(`Failed to load profile for ${address}:`, profileError)
        }
      }
      
      setPendingFarmers(pendingData)

      // Get verified farmers  
      const verifiedAddresses = await farmerRegistryService.getVerifiedFarmers()
      const verifiedData: FarmerData[] = []
      
      for (const address of verifiedAddresses) {
        try {
          const profile = await farmerRegistryService.getUserProfile(address)
          const batches = await farmerRegistryService.getFarmerBatches(address)
          
          verifiedData.push({
            address,
            name: profile.name,
            bio: profile.bio,
            profilePictureHash: profile.profilePictureHash,
            reputationScore: Number(profile.reputationScore),
            isVerified: profile.isVerified,
            dateJoined: Number(profile.dateJoined),
            verifiedBadges: profile.verifiedBadges,
            batchesCreated: batches.map(id => Number(id))
          })
        } catch (profileError) {
          console.warn(`Failed to load profile for ${address}:`, profileError)
        }
      }
      
      setVerifiedFarmers(verifiedData)
      
    } catch (err) {
      console.error('Failed to load farmers data:', err)
      setError('Failed to load farmers data. Please try again.')
    } finally {
      setLoadingFarmers(false)
    }
  }

  const handleVerifyFarmer = async (farmerAddress: Address) => {
    try {
      setError(null)
      await farmerRegistryService.verifyFarmer(farmerAddress)
      
      // Refresh data after verification
      await loadFarmersData()
      
      console.log(`Farmer ${farmerAddress} verified successfully`)
    } catch (err) {
      console.error('Failed to verify farmer:', err)
      setError(`Failed to verify farmer. ${err instanceof Error ? err.message : 'Please try again.'}`)
    }
  }

  const handleAddBadge = async (farmerAddress: Address, badgeName: string) => {
    try {
      setError(null)
      await farmerRegistryService.addVerificationBadge(farmerAddress, badgeName)
      
      // Refresh data after adding badge
      await loadFarmersData()
      
      console.log(`Badge "${badgeName}" added to farmer ${farmerAddress}`)
    } catch (err) {
      console.error('Failed to add badge:', err)
      setError(`Failed to add badge. ${err instanceof Error ? err.message : 'Please try again.'}`)
    }
  }

  // Filter farmers based on search term
  const filteredPendingFarmers = pendingFarmers.filter(farmer =>
    farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredVerifiedFarmers = verifiedFarmers.filter(farmer =>
    farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Loading state
  if (isLoading || loadingFarmers) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard - Spice Platform</title>
        <meta name="description" content="Admin dashboard for farmer verification" />
      </Head>

      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="h-6 w-6 text-blue-600" />
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage farmer verification and platform administration
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Logged in as</p>
                <p className="font-semibold text-gray-900">{user?.name || 'Admin'}</p>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Stats */}
          <AdminStats stats={stats} />

          {/* Search and Tabs */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'pending'
                      ? 'bg-orange-100 text-orange-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Clock className="h-4 w-4 inline-block mr-2" />
                  Pending ({stats.pendingFarmers})
                </button>
                <button
                  onClick={() => setActiveTab('verified')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'verified'
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <CheckCircle className="h-4 w-4 inline-block mr-2" />
                  Verified ({stats.verifiedFarmers})
                </button>
              </div>

              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search farmers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Farmers Table */}
            {activeTab === 'pending' ? (
              <PendingFarmersTable
                farmers={filteredPendingFarmers}
                onVerifyFarmer={handleVerifyFarmer}
                onAddBadge={handleAddBadge}
                onRefresh={loadFarmersData}
              />
            ) : (
              <VerifiedFarmersTable
                farmers={filteredVerifiedFarmers}
                onAddBadge={handleAddBadge}
                onRefresh={loadFarmersData}
              />
            )}
          </div>
        </div>
      </AdminLayout>
    </>
  )
}