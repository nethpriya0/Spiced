import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'

export interface FarmerProfile {
  name: string
  bio: string
  profilePictureHash: string
  reputationScore: number
  isVerified: boolean
  verifiedBadges: string[]
  dateJoined: number
}

export interface DashboardStats {
  productsListed: number
  totalSales: number
  reputationScore: number
  communityRank: string
}

interface FarmerDashboardData {
  profile: FarmerProfile | null
  stats: DashboardStats | null
  isLoading: boolean
  error: string | null
}

export function useFarmerDashboard() {
  const { user, isAuthenticated } = useAuth()
  const [dashboardData, setDashboardData] = useState<FarmerDashboardData>({
    profile: null,
    stats: null,
    isLoading: true,
    error: null
  })

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setDashboardData({
        profile: null,
        stats: null,
        isLoading: false,
        error: 'User not authenticated'
      })
      return
    }

    const fetchDashboardData = async () => {
      try {
        setDashboardData(prev => ({ ...prev, isLoading: true, error: null }))
        
        // In a real implementation, this would fetch from:
        // 1. FarmerRegistry contract for profile data
        // 2. Dashboard service for statistics
        // 3. IPFS for profile picture
        
        // Mock data for now
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
        
        const mockProfile: FarmerProfile = {
          name: 'John Farmer',
          bio: 'Organic spice farmer from Kerala, India. Specializing in cardamom, cinnamon, and black pepper for over 15 years.',
          profilePictureHash: '', // Empty for fallback avatar
          reputationScore: 4.8,
          isVerified: true,
          verifiedBadges: ['Organic Certified', 'Fair Trade'],
          dateJoined: Date.now() - (365 * 24 * 60 * 60 * 1000) // 1 year ago
        }

        const mockStats: DashboardStats = {
          productsListed: 0, // Will be updated in Epic 2
          totalSales: 0,
          reputationScore: 4.8,
          communityRank: 'Trusted Farmer'
        }

        setDashboardData({
          profile: mockProfile,
          stats: mockStats,
          isLoading: false,
          error: null
        })
      } catch (error) {
        setDashboardData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load dashboard data'
        }))
      }
    }

    fetchDashboardData()
  }, [user, isAuthenticated])

  const refreshDashboard = () => {
    // Trigger a refresh of dashboard data
    if (isAuthenticated && user) {
      setDashboardData(prev => ({ ...prev, isLoading: true }))
      // Re-run the effect by changing a dependency or calling fetchDashboardData directly
    }
  }

  return {
    profile: dashboardData.profile,
    stats: dashboardData.stats,
    isLoading: dashboardData.isLoading,
    error: dashboardData.error,
    refreshDashboard
  }
}