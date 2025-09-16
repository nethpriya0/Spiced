import { useState, useEffect, useCallback } from 'react'
import { SpicePassportService, type PassportData } from '@/lib/contracts/SpicePassportService'
import { useWallet } from './useWallet'

type FormattedPassport = Omit<PassportData, 'batchId' | 'totalWeight' | 'dateCreated'> & {
  batchId: number
  totalWeight: number
  dateCreated: number
  statusText: string
  weightInKg: number
  createdDate: Date
  processingStepCount: number
}

interface UseMyProductsReturn {
  passports: FormattedPassport[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useMyProducts(): UseMyProductsReturn {
  const { address, walletClient } = useWallet()
  const [passports, setPassports] = useState<FormattedPassport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPassports = useCallback(async () => {
    if (!address || !walletClient) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // For development, create some mock data
      // In production, this would use the actual SpicePassportService
      const mockPassports: FormattedPassport[] = [
        {
          batchId: 1,
          owner: address,
          spiceType: 'Ceylon Cinnamon',
          totalWeight: 5000, // 5kg in grams
          dateCreated: Math.floor(Date.now() / 1000) - 86400 * 7, // 7 days ago
          isLocked: false,
          harvestHash: 'ipfs://QmTest1...',
          processingHashes: ['ipfs://QmProcess1...'],
          packageHash: '',
          status: 0, // IN_PROGRESS
          statusText: 'In Progress',
          weightInKg: 5.0,
          createdDate: new Date(Date.now() - 86400 * 7 * 1000),
          processingStepCount: 1
        },
        {
          batchId: 2,
          owner: address,
          spiceType: 'Ceylon Cardamom',
          totalWeight: 2500,
          dateCreated: Math.floor(Date.now() / 1000) - 86400 * 14,
          isLocked: true,
          harvestHash: 'ipfs://QmTest2...',
          processingHashes: ['ipfs://QmProcess2...', 'ipfs://QmProcess3...'],
          packageHash: 'ipfs://QmPackage1...',
          status: 1, // LOCKED
          statusText: 'Locked',
          weightInKg: 2.5,
          createdDate: new Date(Date.now() - 86400 * 14 * 1000),
          processingStepCount: 2
        },
        {
          batchId: 3,
          owner: address,
          spiceType: 'Ceylon Pepper',
          totalWeight: 7500,
          dateCreated: Math.floor(Date.now() / 1000) - 86400 * 3,
          isLocked: false,
          harvestHash: 'ipfs://QmTest3...',
          processingHashes: [],
          packageHash: '',
          status: 0, // IN_PROGRESS
          statusText: 'In Progress',
          weightInKg: 7.5,
          createdDate: new Date(Date.now() - 86400 * 3 * 1000),
          processingStepCount: 0
        }
      ]

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setPassports(mockPassports)

      // TODO: Replace with actual implementation
      // const service = new SpicePassportService({
      //   contractAddress: process.env.NEXT_PUBLIC_SPICE_PASSPORT_CONTRACT_ADDRESS as `0x${string}`,
      //   walletClient
      // })
      // 
      // const passportIds = await service.getPassportsByOwner(address)
      // const passportData = await service.getPassportsBatch(passportIds)
      // 
      // const formatted = passportData
      //   .filter(passport => passport !== null)
      //   .map(passport => SpicePassportService.formatPassportForDisplay(passport!))
      // 
      // setPassports(formatted)

    } catch (err) {
      console.error('Error fetching passports:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }, [address, walletClient])

  useEffect(() => {
    fetchPassports()
  }, [fetchPassports])

  return {
    passports,
    loading,
    error,
    refetch: fetchPassports
  }
}