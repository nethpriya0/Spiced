import { useState, useEffect, useCallback } from 'react'
import { type Address, type Hash } from 'viem'
import { useAuth } from '@/hooks/useAuth'
import { farmerRegistryService, type UserProfile, FarmerRegistryError } from '@/lib/contracts/FarmerRegistryService'

interface FarmerRegistryState {
  isInitialized: boolean
  isLoading: boolean
  error: string | null
  pendingFarmers: Address[]
  verifiedFarmers: Address[]
  farmerCount: number
  verifiedCount: number
  isVerifier: boolean
}

export function useFarmerRegistry() {
  const { walletClient, user } = useAuth()
  
  const [state, setState] = useState<FarmerRegistryState>({
    isInitialized: false,
    isLoading: false,
    error: null,
    pendingFarmers: [],
    verifiedFarmers: [],
    farmerCount: 0,
    verifiedCount: 0,
    isVerifier: false
  })

  // Initialize the service when wallet client is available
  useEffect(() => {
    const initialize = async () => {
      if (!walletClient || state.isInitialized) return

      try {
        const contractAddress = process.env.NEXT_PUBLIC_FARMER_REGISTRY_ADDRESS as Address
        if (!contractAddress) {
          throw new Error('NEXT_PUBLIC_FARMER_REGISTRY_ADDRESS not configured')
        }

        farmerRegistryService.initialize({
          contractAddress,
          walletClient
        })

        setState(prev => ({ ...prev, isInitialized: true }))
      } catch (error) {
        console.error('Failed to initialize FarmerRegistry service:', error)
        setState(prev => ({ 
          ...prev, 
          error: 'Failed to initialize FarmerRegistry service'
        }))
      }
    }

    initialize()
  }, [walletClient, state.isInitialized])

  // Check if current user is a verifier
  useEffect(() => {
    const checkVerifierRole = async () => {
      if (!state.isInitialized || !user?.address) return

      try {
        const isVerifier = await farmerRegistryService.hasVerifierRole(user.address)
        setState(prev => ({ ...prev, isVerifier }))
      } catch (error) {
        console.error('Failed to check verifier role:', error)
      }
    }

    checkVerifierRole()
  }, [state.isInitialized, user?.address])

  const setLoading = (isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }))
  }

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }))
  }

  // Register a new farmer
  const registerFarmer = useCallback(async (
    name: string,
    bio: string,
    profilePictureHash: string
  ): Promise<Hash | null> => {
    if (!state.isInitialized) {
      setError('Service not initialized')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const hash = await farmerRegistryService.registerFarmer(name, bio, profilePictureHash)
      
      // Refresh data after registration
      await refreshData()
      
      return hash
    } catch (error) {
      const message = error instanceof FarmerRegistryError ? error.message : 'Failed to register farmer'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [state.isInitialized])

  // Verify a farmer (admin only)
  const verifyFarmer = useCallback(async (farmerAddress: Address): Promise<Hash | null> => {
    if (!state.isInitialized) {
      setError('Service not initialized')
      return null
    }

    if (!state.isVerifier) {
      setError('Only verifiers can verify farmers')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const hash = await farmerRegistryService.verifyFarmer(farmerAddress)
      
      // Refresh data after verification
      await refreshData()
      
      return hash
    } catch (error) {
      const message = error instanceof FarmerRegistryError ? error.message : 'Failed to verify farmer'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [state.isInitialized, state.isVerifier])

  // Update farmer profile
  const updateProfile = useCallback(async (
    name: string,
    bio: string,
    profilePictureHash: string
  ): Promise<Hash | null> => {
    if (!state.isInitialized) {
      setError('Service not initialized')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const hash = await farmerRegistryService.updateProfile(name, bio, profilePictureHash)
      return hash
    } catch (error) {
      const message = error instanceof FarmerRegistryError ? error.message : 'Failed to update profile'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [state.isInitialized])

  // Award verification badge
  const addVerificationBadge = useCallback(async (
    farmerAddress: Address,
    badgeName: string
  ): Promise<Hash | null> => {
    if (!state.isInitialized) {
      setError('Service not initialized')
      return null
    }

    if (!state.isVerifier) {
      setError('Only verifiers can award badges')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const hash = await farmerRegistryService.addVerificationBadge(farmerAddress, badgeName)
      return hash
    } catch (error) {
      const message = error instanceof FarmerRegistryError ? error.message : 'Failed to add verification badge'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [state.isInitialized, state.isVerifier])

  // Get farmer profile
  const getFarmerProfile = useCallback(async (
    farmerAddress: Address
  ): Promise<UserProfile | null> => {
    if (!state.isInitialized) {
      setError('Service not initialized')
      return null
    }

    try {
      return await farmerRegistryService.getUserProfile(farmerAddress)
    } catch (error) {
      const message = error instanceof FarmerRegistryError ? error.message : 'Failed to get farmer profile'
      setError(message)
      return null
    }
  }, [state.isInitialized])

  // Check if farmer is verified
  const isVerifiedFarmer = useCallback(async (
    farmerAddress: Address
  ): Promise<boolean> => {
    if (!state.isInitialized) return false

    try {
      return await farmerRegistryService.isVerified(farmerAddress)
    } catch (error) {
      console.error('Failed to check verification status:', error)
      return false
    }
  }, [state.isInitialized])

  // Check if farmer is registered
  const isRegisteredFarmer = useCallback(async (
    farmerAddress: Address
  ): Promise<boolean> => {
    if (!state.isInitialized) return false

    try {
      return await farmerRegistryService.isRegisteredFarmer(farmerAddress)
    } catch (error) {
      console.error('Failed to check registration status:', error)
      return false
    }
  }, [state.isInitialized])

  // Refresh all data
  const refreshData = useCallback(async () => {
    if (!state.isInitialized) return

    try {
      const [pendingFarmers, verifiedFarmers, farmerCount, verifiedCount] = await Promise.all([
        farmerRegistryService.getPendingFarmers(),
        farmerRegistryService.getVerifiedFarmers(), 
        farmerRegistryService.getFarmerCount(),
        farmerRegistryService.getVerifiedFarmerCount()
      ])

      setState(prev => ({
        ...prev,
        pendingFarmers,
        verifiedFarmers,
        farmerCount,
        verifiedCount
      }))
    } catch (error) {
      console.error('Failed to refresh data:', error)
    }
  }, [state.isInitialized])

  // Refresh data when initialized
  useEffect(() => {
    if (state.isInitialized) {
      refreshData()
    }
  }, [state.isInitialized, refreshData])

  return {
    // State
    isInitialized: state.isInitialized,
    isLoading: state.isLoading,
    error: state.error,
    pendingFarmers: state.pendingFarmers,
    verifiedFarmers: state.verifiedFarmers,
    farmerCount: state.farmerCount,
    verifiedCount: state.verifiedCount,
    isVerifier: state.isVerifier,
    
    // Actions
    registerFarmer,
    verifyFarmer,
    updateProfile,
    addVerificationBadge,
    getFarmerProfile,
    isVerifiedFarmer,
    isRegisteredFarmer,
    refreshData
  }
}