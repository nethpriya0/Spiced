import { useMemo } from 'react'
import { SpicePassportService } from '@/lib/contracts/SpicePassportService'
import { useWallet } from './useWallet'

export function useSpicePassportService() {
  const { walletClient } = useWallet()

  const service = useMemo(() => {
    if (!walletClient) {
      return null
    }

    const contractAddress = process.env.NEXT_PUBLIC_SPICE_PASSPORT_CONTRACT_ADDRESS as `0x${string}`
    if (!contractAddress) {
      console.warn('NEXT_PUBLIC_SPICE_PASSPORT_CONTRACT_ADDRESS not configured')
      return null
    }

    try {
      return new SpicePassportService({
        contractAddress,
        walletClient
      })
    } catch (error) {
      console.error('Failed to initialize SpicePassportService:', error)
      return null
    }
  }, [walletClient])

  return service
}