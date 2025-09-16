import { useState, useEffect, useMemo } from 'react'
import { type MarketplaceProduct } from '@/types/marketplace'
import { type Address } from 'viem'
import { SpicePassportService, type PassportData } from '@/lib/contracts/SpicePassportService'
import { createPublicClient, http, getContract } from 'viem'
import { localhost } from 'viem/chains'

interface UseMarketplaceProductsReturn {
  products: MarketplaceProduct[]
  loading: boolean
  error: string | null
  refetch: () => void
  stats: {
    totalProducts: number
    uniqueFarmers: number
    uniqueSpiceTypes: number
    averagePrice: number
  }
}

export const useMarketplaceProducts = (): UseMarketplaceProductsReturn => {
  const [products, setProducts] = useState<MarketplaceProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      // Check if we have contract address configured
      const contractAddress = process.env.NEXT_PUBLIC_SPICE_PASSPORT_CONTRACT as Address
      if (!contractAddress) {
        throw new Error('Smart contract address not configured. Please set NEXT_PUBLIC_SPICE_PASSPORT_CONTRACT in your environment variables.')
      }

      // Create public client for reading blockchain data
      const publicClient = createPublicClient({
        chain: localhost,
        transport: http(process.env.NEXT_PUBLIC_RPC_URL)
      })

      // Create a minimal wallet client for the service (read-only)
      const dummyWalletClient = {
        account: { address: '0x0000000000000000000000000000000000000000' as Address },
        chain: localhost,
        transport: http(process.env.NEXT_PUBLIC_RPC_URL)
      } as any

      const service = new SpicePassportService({
        contractAddress,
        walletClient: dummyWalletClient
      })

      // Get all locked passports (status = 1, ready for sale)
      const lockedPassportIds = await service.getPassportsByStatus(1)
      
      if (lockedPassportIds.length === 0) {
        console.log('No products available on blockchain yet')
        setProducts([])
        return
      }

      // Fetch passport details for all locked passports
      const passportDataList = await service.getPassportsBatch(lockedPassportIds)
      
      // Transform blockchain data to marketplace products
      const marketplaceProducts: MarketplaceProduct[] = passportDataList
        .filter((passport): passport is PassportData => passport !== null)
        .map((passport, index) => transformPassportToMarketplaceProduct(passport, index))

      setProducts(marketplaceProducts)
      
    } catch (err) {
      console.error('Error fetching marketplace products:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch products from blockchain')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const refetch = () => {
    fetchProducts()
  }

  // Calculate marketplace stats
  const stats = useMemo(() => {
    const uniqueFarmers = new Set(products.map(p => p.farmerAddress)).size
    const uniqueSpiceTypes = new Set(products.map(p => p.spiceType)).size
    const averagePrice = products.length > 0 
      ? products.reduce((sum, p) => sum + p.price, 0) / products.length 
      : 0

    return {
      totalProducts: products.length,
      uniqueFarmers,
      uniqueSpiceTypes,
      averagePrice
    }
  }, [products])

  return {
    products,
    loading,
    error,
    refetch,
    stats
  }
}

/**
 * Hook for fetching a single product by batch ID
 */
export function useMarketplaceProduct(batchId: string) {
  const { products, loading, error } = useMarketplaceProducts()
  
  const product = useMemo(() => {
    return products.find(p => p.batchId === batchId) || null
  }, [products, batchId])

  return {
    product,
    loading,
    error
  }
}

/**
 * Hook for getting products by farmer address
 */
export function useFarmerProducts(farmerAddress: string) {
  const { products, loading, error } = useMarketplaceProducts()
  
  const farmerProducts = useMemo(() => {
    return products.filter(p => p.farmerAddress.toLowerCase() === farmerAddress.toLowerCase())
  }, [products, farmerAddress])

  const farmerStats = useMemo(() => {
    return {
      totalProducts: farmerProducts.length,
      averagePrice: farmerProducts.length > 0 
        ? farmerProducts.reduce((sum, p) => sum + p.price, 0) / farmerProducts.length 
        : 0,
      spiceTypes: [...new Set(farmerProducts.map(p => p.spiceType))],
      totalWeight: farmerProducts.reduce((sum, p) => sum + p.weight, 0)
    }
  }, [farmerProducts])

  return {
    products: farmerProducts,
    loading,
    error,
    stats: farmerStats
  }
}

/**
 * Transform blockchain PassportData to MarketplaceProduct format
 */
function transformPassportToMarketplaceProduct(passport: PassportData, index: number): MarketplaceProduct {
  const formatPrice = (weight: bigint) => {
    // Calculate price based on weight and spice type
    const weightInKg = Number(weight) / 1000
    let basePricePerKg = 25 // Default $25/kg
    
    // Premium pricing for different spice types
    const spiceType = passport.spiceType.toLowerCase()
    if (spiceType.includes('cinnamon') || spiceType.includes('ceylon')) {
      basePricePerKg = 35
    } else if (spiceType.includes('cardamom')) {
      basePricePerKg = 80
    } else if (spiceType.includes('vanilla')) {
      basePricePerKg = 120
    } else if (spiceType.includes('pepper') || spiceType.includes('black pepper')) {
      basePricePerKg = 15
    } else if (spiceType.includes('turmeric')) {
      basePricePerKg = 12
    }
    
    return weightInKg * basePricePerKg
  }

  const generateDemoData = (spiceType: string, index: number) => {
    // Generate consistent demo data based on spice type and index
    const spiceLower = spiceType.toLowerCase()
    const hash = (str: string) => {
      let h = 0
      for (let i = 0; i < str.length; i++) {
        h = (h << 5) - h + str.charCodeAt(i)
        h = h & h // Convert to 32-bit integer
      }
      return Math.abs(h)
    }
    
    const seed = hash(spiceType + index.toString())
    const random = (min: number, max: number) => ((seed % (max - min + 1)) + min)
    
    const regions = ['Kandy', 'Matale', 'Galle', 'Ratnapura', 'Nuwara Eliya']
    const qualityGrades: Array<'AAA' | 'AA' | 'A+' | 'A' | 'B+' | 'B'> = ['AAA', 'AA', 'A+', 'A', 'B+', 'B']
    const processingMethods = ['Traditional Sun-Dried', 'Controlled Drying', 'Steam Distilled', 'Hand-Sorted']
    
    return {
      region: regions[random(0, regions.length - 1)]!,
      qualityGrade: qualityGrades[random(0, qualityGrades.length - 1)]!,
      processingMethod: processingMethods[random(0, processingMethods.length - 1)]!,
      sustainabilityScore: random(7, 10),
      reputationScore: random(4, 5),
      carbonFootprint: `${random(2, 8)}.${random(1, 9)}kg CO2e`,
      moistureContent: `${random(8, 12)}.${random(1, 9)}%`
    }
  }

  const demoData = generateDemoData(passport.spiceType, index)
  const price = formatPrice(passport.totalWeight)
  const weightInKg = Number(passport.totalWeight) / 1000

  return {
    batchId: passport.batchId.toString(),
    farmerAddress: passport.owner,
    spiceType: passport.spiceType,
    farmerName: `Farmer ${passport.owner.slice(2, 8).toUpperCase()}`, // Generate farmer name from address
    price: Math.round(price * 100) / 100, // Round to 2 decimal places
    weight: Math.round(weightInKg * 100) / 100, // Round to 2 decimal places  
    unit: 'kg',
    description: `Premium ${passport.spiceType} harvested with traditional methods and sealed with blockchain verification. ${
      passport.processingHashes.length > 0 
        ? `Includes ${passport.processingHashes.length} documented processing steps.`
        : 'Direct from harvest with minimal processing.'
    }`,
    qualityGrade: demoData.qualityGrade,
    region: demoData.region,
    processingMethod: demoData.processingMethod,
    harvestDate: new Date(Number(passport.dateCreated) * 1000).toISOString().split('T')[0]!,
    sealedAt: new Date(Number(passport.dateCreated) * 1000).toISOString().split('T')[0]!,
    verificationHash: passport.harvestHash,
    status: 'sealed' as const,
    sustainabilityScore: demoData.sustainabilityScore,
    reputationScore: demoData.reputationScore,
    carbonFootprint: demoData.carbonFootprint,
    moistureContent: demoData.moistureContent,
    harvestHash: passport.harvestHash,
    processingHashes: passport.processingHashes,
    certifications: ['Organic Certified', 'Fair Trade', 'Blockchain Verified'],
    badges: [
      {
        id: 'verified',
        name: 'Blockchain Verified',
        description: 'Product authenticity verified on blockchain',
        icon: 'shield',
        earnedDate: new Date(Number(passport.dateCreated) * 1000)
      },
      {
        id: 'quality',
        name: `${demoData.qualityGrade} Quality`,
        description: `Premium ${demoData.qualityGrade} grade spice`,
        icon: 'award',
        earnedDate: new Date(Number(passport.dateCreated) * 1000)
      }
    ]
  }
}

export default useMarketplaceProducts