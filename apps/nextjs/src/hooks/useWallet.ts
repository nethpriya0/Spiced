import { useState, useEffect } from 'react'
import { type Address, type WalletClient } from 'viem'

interface WalletState {
  address: Address | null
  walletClient: WalletClient | null
  isConnected: boolean
  isConnecting: boolean
  error: string | null
}

export function useWallet(): WalletState {
  const [state, setState] = useState<WalletState>({
    address: null,
    walletClient: null,
    isConnected: false,
    isConnecting: false,
    error: null
  })

  useEffect(() => {
    // Mock wallet for development
    // In production, this would integrate with wagmi or similar
    const mockAddress = '0x742F35Cc6Aa3f7A29d5aE28b1b1df0e8B4561234' as Address
    
    setState({
      address: mockAddress,
      walletClient: null, // Would be actual wallet client in production
      isConnected: true,
      isConnecting: false,
      error: null
    })
  }, [])

  return state
}