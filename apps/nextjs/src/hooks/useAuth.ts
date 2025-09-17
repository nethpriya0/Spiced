import { useEffect, useCallback } from 'react'
import { authService, AuthError } from '@/lib/auth/AuthService'
import { useAuthStore } from '@/lib/auth/authStore'
import { simpleEmailAuthService } from '@/lib/auth/SimpleEmailAuthService'
import type { User } from '@/lib/auth/authStore'

export type { User as AuthUser }

export function useAuth() {
  const {
    user,
    walletClient,
    isLoading,
    isInitialized,
    error,
    setUser,
    setWalletClient,
    setLoading,
    setInitialized,
    setError,
    logout: storeLogout
  } = useAuthStore()

  // Initialize Web3Auth on mount
  useEffect(() => {
    const initializeAuth = async () => {
      if (isInitialized) {
        console.log('📋 [useAuth] Already initialized, skipping')
        return
      }

      console.log('🔧 [useAuth] Starting authentication initialization...')
      setLoading(true)
      setError(null)

      try {
        console.log('🔧 [useAuth] Calling authService.initialize()...')
        await authService.initialize()
        console.log('✅ [useAuth] Auth service initialization completed')
        setInitialized(true)
        
        // Check if user is already connected from previous session
        const isConnected = await authService.isConnected()
        console.log('📋 [useAuth] Checking connection status:', isConnected)
        
        if (isConnected) {
          console.log('📋 [useAuth] User appears to be connected, restoring session...')

          // Check if we have persisted user data
          if (user) {
            console.log('📋 [useAuth] Found persisted user data, recreating wallet client...')
            try {
              // Try to recreate the wallet client for the existing user
              const loginResult = await authService.loginWithEmail(user.email || '')
              setWalletClient(loginResult.walletClient)
              console.log('✅ [useAuth] Wallet client restored for existing user')
            } catch (restoreError) {
              console.warn('❌ [useAuth] Failed to restore wallet client:', restoreError)
              // Clear invalid session
              setUser(null)
              setWalletClient(null)
            }
          } else {
            // Try to get user info and restore full session
            const userInfo = await authService.getUserInfo()
            console.log('📋 [useAuth] Retrieved user info:', !!userInfo)

            if (userInfo) {
              try {
                const loginResult = await authService.login()
                console.log('📋 [useAuth] Session restoration successful')

                const userData: User = {
                  address: loginResult.address,
                  email: userInfo.email as string,
                  name: userInfo.name as string,
                  profilePicture: userInfo.profileImage as string,
                  isVerified: true, // TODO: Fetch from FarmerRegistry contract
                  profileComplete: typeof window !== 'undefined' ? localStorage.getItem('user_profile_complete') === 'true' : false,
                  userInfo: userInfo
                }

                setUser(userData)
                setWalletClient(loginResult.walletClient)
                console.log('✅ [useAuth] User session restored successfully')
              } catch (loginError) {
                console.warn('❌ [useAuth] Failed to restore existing session:', loginError)
                setUser(null)
                setWalletClient(null)
              }
            } else {
              console.log('📋 [useAuth] No user info available, skipping session restoration')
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setError(error instanceof AuthError ? error.message : 'Failed to initialize Web3Auth. Please refresh the page.')
        setInitialized(false) // Set to false so user knows initialization failed
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [isInitialized, setLoading, setInitialized, setUser, setWalletClient, setError])

  const login = useCallback(async () => {
    console.log('🔑 [useAuth] Starting login process...')
    console.log('📋 [useAuth] Is initialized:', isInitialized)
    
    if (!isInitialized) {
      const errorMsg = 'Authentication not initialized. Please wait a moment and try again.'
      console.error('❌ [useAuth]', errorMsg)
      setError(errorMsg)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Try to re-initialize if needed (should be quick since it's already initialized)
      try {
        console.log('🔧 [useAuth] Re-initializing auth service...')
        await authService.initialize()
        console.log('✅ [useAuth] Auth service re-initialization completed')
      } catch (initError) {
        console.error('❌ [useAuth] Re-initialization failed:', initError)
        throw new Error('Authentication service failed to initialize. Please refresh the page and try again.')
      }

      console.log('🔑 [useAuth] Calling auth service login...')
      const result = await authService.login()
      console.log('✅ [useAuth] Login successful, creating user data...')
      
      const userData: User = {
        address: result.address,
        email: result.userInfo?.email as string || 'user@example.com',
        name: result.userInfo?.name as string || 'User',
        profilePicture: result.userInfo?.profileImage as string,
        isVerified: true, // TODO: Fetch from FarmerRegistry contract
        profileComplete: typeof window !== 'undefined' ? localStorage.getItem('user_profile_complete') === 'true' : false, // Check localStorage for profile completion
        userInfo: result.userInfo
      }

      setUser(userData)
      setWalletClient(result.walletClient)
      console.log('✅ [useAuth] User data and wallet client set successfully')
    } catch (error) {
      console.error('❌ [useAuth] Login error:', error)
      const errorMessage = error instanceof AuthError ? error.message : 
                          error instanceof Error ? error.message : 
                          'Failed to login. Please try again.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [isInitialized, setLoading, setError, setUser, setWalletClient])

  // New function for email-based authentication
  const loginWithEmail = useCallback(async (email: string) => {
    console.log('🔑 [useAuth] Starting email login for:', email)
    
    if (!isInitialized) {
      const errorMsg = 'Authentication not initialized. Please wait a moment and try again.'
      console.error('❌ [useAuth]', errorMsg)
      setError(errorMsg)
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('🔑 [useAuth] Calling email login...')
      const result = await authService.loginWithEmail(email)
      console.log('✅ [useAuth] Email login successful, creating user data...')
      
      const userData: User = {
        address: result.address,
        email: result.userInfo?.email as string || email,
        name: result.userInfo?.name as string || 'User',
        profilePicture: result.userInfo?.profileImage as string,
        isVerified: true,
        profileComplete: typeof window !== 'undefined' ? localStorage.getItem('user_profile_complete') === 'true' : false,
        userInfo: result.userInfo
      }

      setUser(userData)
      setWalletClient(result.walletClient)
      console.log('✅ [useAuth] Email login completed successfully')
    } catch (error) {
      console.error('❌ [useAuth] Email login error:', error)
      const errorMessage = error instanceof AuthError ? error.message : 
                          error instanceof Error ? error.message : 
                          'Failed to login with email. Please try again.'
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }, [isInitialized, setLoading, setError, setUser, setWalletClient])

  // New function for email registration
  const registerWithEmail = useCallback(async (email: string, name?: string) => {
    console.log('🔑 [useAuth] Starting email registration for:', email)
    
    if (!isInitialized) {
      const errorMsg = 'Authentication not initialized. Please wait a moment and try again.'
      console.error('❌ [useAuth]', errorMsg)
      setError(errorMsg)
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('🔑 [useAuth] Calling email registration...')
      const result = await authService.registerWithEmail(email, name)
      console.log('✅ [useAuth] Email registration successful, creating user data...')
      
      const userData: User = {
        address: result.address,
        email: result.userInfo?.email as string || email,
        name: result.userInfo?.name as string || name || 'User',
        profilePicture: result.userInfo?.profileImage as string,
        isVerified: true,
        profileComplete: false, // New registration, profile not complete
        userInfo: result.userInfo
      }

      setUser(userData)
      setWalletClient(result.walletClient)
      console.log('✅ [useAuth] Email registration completed successfully')
    } catch (error) {
      console.error('❌ [useAuth] Email registration error:', error)
      const errorMessage = error instanceof AuthError ? error.message : 
                          error instanceof Error ? error.message : 
                          'Failed to register with email. Please try again.'
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }, [isInitialized, setLoading, setError, setUser, setWalletClient])

  const logout = useCallback(async () => {
    setLoading(true)
    try {
      await authService.logout()
      storeLogout()
    } catch (error) {
      console.error('Logout error:', error)
      setError(error instanceof AuthError ? error.message : 'Failed to logout')
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, storeLogout])

  return {
    user,
    walletClient,
    isAuthenticated: !!user,
    isLoading,
    isInitialized,
    error,
    login,
    loginWithEmail,
    registerWithEmail,
    logout
  }
}