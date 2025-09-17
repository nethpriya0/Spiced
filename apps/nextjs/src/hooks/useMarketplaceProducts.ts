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

      // Try to load from blockchain first, fallback to mock data
      const contractAddress = process.env.NEXT_PUBLIC_SPICE_PASSPORT_CONTRACT as Address

      if (contractAddress) {
        try {
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

          if (lockedPassportIds.length > 0) {
            // Fetch passport details for all locked passports
            const passportDataList = await service.getPassportsBatch(lockedPassportIds)

            // Transform blockchain data to marketplace products
            const marketplaceProducts: MarketplaceProduct[] = passportDataList
              .filter((passport): passport is PassportData => passport !== null)
              .map((passport, index) => transformPassportToMarketplaceProduct(passport, index))

            setProducts(marketplaceProducts)
            return
          }
        } catch (blockchainError) {
          console.warn('Blockchain data unavailable, using mock data:', blockchainError)
        }
      }

      // Fallback to mock data for demo purposes
      console.log('Using mock data for marketplace products')
      const mockProducts = getMockProducts()
      setProducts(mockProducts)

    } catch (err) {
      console.error('Error fetching marketplace products:', err)
      // Even if everything fails, show some demo data
      const mockProducts = getMockProducts()
      setProducts(mockProducts)
      setError('Using demo data - blockchain integration will be available when contracts are deployed')
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

/**
 * Mock data for demo purposes when blockchain is unavailable
 */
function getMockProducts(): MarketplaceProduct[] {
  return [
    {
      batchId: 'DEMO001',
      farmerAddress: '0x1234567890123456789012345678901234567890' as Address,
      spiceType: 'Ceylon Cinnamon',
      farmerName: 'Ranjan Perera',
      price: 32.50,
      weight: 1.0,
      unit: 'kg',
      description: 'Premium Ceylon True Cinnamon from the highlands of Kandy. Hand-harvested using traditional methods and verified on blockchain.',
      qualityGrade: 'AAA' as const,
      region: 'Kandy',
      processingMethod: 'Traditional Sun-Dried',
      harvestDate: '2024-09-01',
      sealedAt: '2024-09-02',
      verificationHash: '0x1a2b3c4d5e6f7890...',
      status: 'sealed' as const,
      sustainabilityScore: 9,
      reputationScore: 4.9,
      carbonFootprint: '3.2kg CO2e',
      moistureContent: '10.5%',
      harvestHash: '0x1a2b3c4d...',
      processingHashes: ['0x2b3c4d5e...', '0x3c4d5e6f...'],
      certifications: ['Organic Certified', 'Fair Trade', 'Blockchain Verified'],
      badges: [
        {
          id: 'verified',
          name: 'Blockchain Verified',
          description: 'Product authenticity verified on blockchain',
          icon: 'shield',
          earnedDate: new Date('2024-09-02')
        }
      ]
    },
    {
      batchId: 'DEMO002',
      farmerAddress: '0x2345678901234567890123456789012345678901' as Address,
      spiceType: 'Black Pepper',
      farmerName: 'Kamala Wickramasinghe',
      price: 28.75,
      weight: 1.5,
      unit: 'kg',
      description: 'Bold and aromatic Malabar black pepper with high piperine content. Perfect for culinary excellence.',
      qualityGrade: 'AA' as const,
      region: 'Matale',
      processingMethod: 'Controlled Drying',
      harvestDate: '2024-08-25',
      sealedAt: '2024-08-26',
      verificationHash: '0x2b3c4d5e6f7890...',
      status: 'sealed' as const,
      sustainabilityScore: 8,
      reputationScore: 4.8,
      carbonFootprint: '2.8kg CO2e',
      moistureContent: '9.2%',
      harvestHash: '0x2b3c4d5e...',
      processingHashes: ['0x3c4d5e6f...'],
      certifications: ['Organic Certified', 'Single Estate'],
      badges: [
        {
          id: 'verified',
          name: 'Blockchain Verified',
          description: 'Product authenticity verified on blockchain',
          icon: 'shield',
          earnedDate: new Date('2024-08-26')
        }
      ]
    },
    {
      batchId: 'DEMO003',
      farmerAddress: '0x3456789012345678901234567890123456789012' as Address,
      spiceType: 'Green Cardamom',
      farmerName: 'Mahesh Silva',
      price: 85.00,
      weight: 0.5,
      unit: 'kg',
      description: 'Aromatic green cardamom pods with intense flavor profile. Hand-picked from mountain plantations.',
      qualityGrade: 'AAA' as const,
      region: 'Ella',
      processingMethod: 'Hand-Sorted',
      harvestDate: '2024-08-20',
      sealedAt: '2024-08-21',
      verificationHash: '0x3c4d5e6f7890...',
      status: 'sealed' as const,
      sustainabilityScore: 10,
      reputationScore: 4.7,
      carbonFootprint: '1.9kg CO2e',
      moistureContent: '8.8%',
      harvestHash: '0x3c4d5e6f...',
      processingHashes: ['0x4d5e6f70...', '0x5e6f7081...'],
      certifications: ['Organic Certified', 'Fair Trade', 'Mountain Grown'],
      badges: [
        {
          id: 'verified',
          name: 'Blockchain Verified',
          description: 'Product authenticity verified on blockchain',
          icon: 'shield',
          earnedDate: new Date('2024-08-21')
        },
        {
          id: 'premium',
          name: 'Premium Quality',
          description: 'Highest grade available',
          icon: 'award',
          earnedDate: new Date('2024-08-21')
        }
      ]
    }
  ]
}

export default useMarketplaceProducts