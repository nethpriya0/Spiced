import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { farmerRegistryService } from '@/lib/contracts/FarmerRegistryService'
import { mockFarmerRegistryService } from '@/lib/contracts/MockFarmerRegistryService'
import { type Address } from 'viem'

interface FirstTimeUserState {
  isFirstTime: boolean | null // null = loading, true = needs setup, false = profile exists
  isVerified: boolean | null  // null = loading, true = verified, false = not verified
  isLoading: boolean
  error: string | null
}

export function useFirstTimeUser() {
  const { user, walletClient, isAuthenticated } = useAuth()
  const [state, setState] = useState<FirstTimeUserState>({
    isFirstTime: null,
    isVerified: null,
    isLoading: true,
    error: null
  })

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!isAuthenticated || !user?.address || !walletClient) {
        setState({
          isFirstTime: null,
          isVerified: null,
          isLoading: false,
          error: null
        })
        return
      }

      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }))

        // Check if we're in development mode
        if (process.env.NODE_ENV === 'development' ||
            !process.env.NEXT_PUBLIC_DIAMOND_PROXY_ADDRESS ||
            process.env.NEXT_PUBLIC_DIAMOND_PROXY_ADDRESS === '0x5FbDB2315678afecb367f032d93F642f64180aa3') {

          // Development mode - check localStorage
          console.log('🔧 Development mode: Checking user status from localStorage')

          const profileComplete = localStorage.getItem('user_profile_complete') === 'true'
          const farmerRegistered = localStorage.getItem('farmer_registered') === 'true'

          setState({
            isFirstTime: !profileComplete,
            isVerified: farmerRegistered,
            isLoading: false,
            error: null
          })

          return
        }

        // Production mode - check smart contract
        if (!process.env.NEXT_PUBLIC_DIAMOND_PROXY_ADDRESS) {
          throw new Error('Diamond proxy contract address not configured')
        }

        farmerRegistryService.initialize({
          contractAddress: process.env.NEXT_PUBLIC_DIAMOND_PROXY_ADDRESS as Address,
          walletClient
        })

        // Check if user is verified
        const isVerified = await farmerRegistryService.isVerified(user.address)

        let isFirstTime = true

        if (isVerified) {
          // If verified, check if profile exists
          try {
            await farmerRegistryService.getUserProfile(user.address)
            // Profile exists
            isFirstTime = false
          } catch {
            // Profile doesn't exist - first time user
            isFirstTime = true
          }
        }

        setState({
          isFirstTime,
          isVerified,
          isLoading: false,
          error: null
        })

      } catch (error) {
        console.error('Failed to check user status:', error)
        setState({
          isFirstTime: null,
          isVerified: null,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to check user status'
        })
      }
    }

    checkUserStatus()
  }, [isAuthenticated, user?.address, walletClient])

  return {
    isFirstTime: state.isFirstTime,
    isVerified: state.isVerified,
    isLoading: state.isLoading,
    error: state.error,
    needsVerification: state.isVerified === false,
    needsProfileSetup: state.isVerified === true && state.isFirstTime === true,
    isReady: state.isVerified === true && state.isFirstTime === false
  }
}