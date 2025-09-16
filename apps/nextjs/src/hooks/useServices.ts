// Hook for accessing blockchain and IPFS services
import { useMemo } from 'react'
import { useAuth } from './useAuth'
import { ipfsService, createContractServices, type ContractServices } from '@/lib/services'

interface ServiceState {
  ipfs: typeof ipfsService
  contracts: ContractServices | null
  isReady: boolean
}

/**
 * Hook that provides access to all platform services
 * Automatically connects to blockchain services when user is authenticated
 */
export function useServices(): ServiceState {
  const { walletClient, isAuthenticated } = useAuth()

  const contracts = useMemo(() => {
    if (!walletClient || !isAuthenticated) {
      return null
    }

    try {
      return createContractServices(walletClient)
    } catch (error) {
      console.error('Failed to create contract services:', error)
      return null
    }
  }, [walletClient, isAuthenticated])

  return {
    ipfs: ipfsService,
    contracts,
    isReady: isAuthenticated && !!contracts
  }
}

/**
 * Hook specifically for IPFS operations (always available)
 */
export function useIPFS() {
  return ipfsService
}

/**
 * Hook specifically for contract operations (requires authentication)
 */
export function useContracts() {
  const { contracts, isReady } = useServices()
  
  return {
    farmerRegistry: contracts?.farmerRegistry || null,
    spicePassport: contracts?.spicePassport || null,
    escrow: contracts?.escrow || null,
    isReady
  }
}