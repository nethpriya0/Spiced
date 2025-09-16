import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Address, WalletClient } from 'viem'

export interface User {
  address: Address
  email?: string
  name?: string
  profilePicture?: string
  isVerified: boolean
  profileComplete: boolean
  userInfo?: Record<string, unknown>
}

interface AuthState {
  user: User | null
  walletClient: WalletClient | null
  isLoading: boolean
  isInitialized: boolean
  error: string | null
}

interface AuthActions {
  setUser: (user: User | null) => void
  setWalletClient: (client: WalletClient | null) => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void
  setError: (error: string | null) => void
  logout: () => void
  reset: () => void
}

export type AuthStore = AuthState & AuthActions

const initialState: AuthState = {
  user: null,
  walletClient: null,
  isLoading: false,
  isInitialized: false,
  error: null
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,
      
      setUser: (user) => set({ user, error: null }),
      
      setWalletClient: (walletClient) => set({ walletClient }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setInitialized: (isInitialized) => set({ isInitialized }),
      
      setError: (error) => set({ error, isLoading: false }),
      
      logout: () => set({
        user: null,
        walletClient: null,
        error: null,
        isLoading: false
      }),
      
      reset: () => set(initialState)
    }),
    {
      name: 'spice-auth-storage',
      partialize: (state) => ({
        user: state.user,
        isInitialized: state.isInitialized
      })
    }
  )
)