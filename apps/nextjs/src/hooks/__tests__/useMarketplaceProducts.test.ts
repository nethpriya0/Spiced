import { renderHook, waitFor } from '@testing-library/react'
import { useMarketplaceProducts } from '../useMarketplaceProducts'
import { SpicePassportService } from '@/lib/contracts/SpicePassportService'
import { DEMO_PRODUCTS } from '@/data/demoData'

// Mock the SpicePassportService
jest.mock('@/lib/contracts/SpicePassportService')
const MockedSpicePassportService = SpicePassportService as jest.MockedClass<typeof SpicePassportService>

// Mock environment variables
const originalEnv = process.env

const mockPassportData = {
  batchId: BigInt(1),
  owner: '0x1234567890123456789012345678901234567890' as const,
  spiceType: 'Ceylon Cinnamon',
  totalWeight: BigInt(5000), // 5kg in grams
  dateCreated: BigInt(Math.floor(Date.now() / 1000)),
  isLocked: true,
  harvestHash: 'ipfs://QmTest123',
  processingHashes: ['ipfs://QmProcess1', 'ipfs://QmProcess2'],
  packageHash: 'ipfs://QmPackage1',
  status: 1 // LOCKED status
}

beforeEach(() => {
  process.env = { ...originalEnv }
})

afterEach(() => {
  process.env = originalEnv
  jest.clearAllMocks()
})

describe('useMarketplaceProducts', () => {
  it('should use demo data when contract address is not configured', async () => {
    delete process.env.NEXT_PUBLIC_SPICE_PASSPORT_CONTRACT

    const { result } = renderHook(() => useMarketplaceProducts())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.products).toEqual(DEMO_PRODUCTS)
    expect(result.current.error).toBe(null)
  })

  it('should fetch blockchain data when contract address is configured', async () => {
    process.env.NEXT_PUBLIC_SPICE_PASSPORT_CONTRACT = '0xabcdef1234567890'
    process.env.NEXT_PUBLIC_RPC_URL = 'https://sepolia.infura.io/v3/test'

    const mockService = {
      getPassportsByStatus: jest.fn().mockResolvedValue([1, 2, 3]),
      getPassportsBatch: jest.fn().mockResolvedValue([
        mockPassportData,
        { ...mockPassportData, batchId: BigInt(2), spiceType: 'Black Pepper' },
        { ...mockPassportData, batchId: BigInt(3), spiceType: 'Cardamom' }
      ])
    }

    MockedSpicePassportService.mockImplementation(() => mockService as any)

    const { result } = renderHook(() => useMarketplaceProducts())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockService.getPassportsByStatus).toHaveBeenCalledWith(1)
    expect(mockService.getPassportsBatch).toHaveBeenCalledWith([1, 2, 3])
    expect(result.current.products).toHaveLength(3)
    expect(result.current.products[0].spiceType).toBe('Ceylon Cinnamon')
    expect(result.current.products[0].batchId).toBe('1')
    expect(result.current.error).toBe(null)
  })

  it('should fallback to demo data when blockchain fetch fails', async () => {
    process.env.NEXT_PUBLIC_SPICE_PASSPORT_CONTRACT = '0xabcdef1234567890'
    process.env.NEXT_PUBLIC_RPC_URL = 'https://sepolia.infura.io/v3/test'

    const mockService = {
      getPassportsByStatus: jest.fn().mockRejectedValue(new Error('Network error')),
      getPassportsBatch: jest.fn()
    }

    MockedSpicePassportService.mockImplementation(() => mockService as any)

    const { result } = renderHook(() => useMarketplaceProducts())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.products).toEqual(DEMO_PRODUCTS)
    expect(result.current.error).toBe(null) // Should not show error, just fallback
  })

  it('should use demo data when no locked passports are found', async () => {
    process.env.NEXT_PUBLIC_SPICE_PASSPORT_CONTRACT = '0xabcdef1234567890'
    process.env.NEXT_PUBLIC_RPC_URL = 'https://sepolia.infura.io/v3/test'

    const mockService = {
      getPassportsByStatus: jest.fn().mockResolvedValue([]), // No locked passports
      getPassportsBatch: jest.fn()
    }

    MockedSpicePassportService.mockImplementation(() => mockService as any)

    const { result } = renderHook(() => useMarketplaceProducts())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockService.getPassportsByStatus).toHaveBeenCalledWith(1)
    expect(mockService.getPassportsBatch).not.toHaveBeenCalled()
    expect(result.current.products).toEqual(DEMO_PRODUCTS)
    expect(result.current.error).toBe(null)
  })

  it('should calculate correct stats', async () => {
    const { result } = renderHook(() => useMarketplaceProducts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const { stats } = result.current

    expect(stats.totalProducts).toBe(DEMO_PRODUCTS.length)
    expect(stats.uniqueFarmers).toBeGreaterThan(0)
    expect(stats.uniqueSpiceTypes).toBeGreaterThan(0)
    expect(stats.averagePrice).toBeGreaterThan(0)
  })

  it('should refetch products when refetch is called', async () => {
    const { result } = renderHook(() => useMarketplaceProducts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const initialProducts = result.current.products

    // Call refetch - Note: refetch is async so we don't check loading immediately
    result.current.refetch()

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.products).toEqual(initialProducts)
  })
})

describe('transformPassportToMarketplaceProduct', () => {
  it('should transform passport data correctly', async () => {
    process.env.NEXT_PUBLIC_SPICE_PASSPORT_CONTRACT = '0xabcdef1234567890'
    process.env.NEXT_PUBLIC_RPC_URL = 'https://sepolia.infura.io/v3/test'

    const mockService = {
      getPassportsByStatus: jest.fn().mockResolvedValue([1]),
      getPassportsBatch: jest.fn().mockResolvedValue([mockPassportData])
    }

    MockedSpicePassportService.mockImplementation(() => mockService as any)

    const { result } = renderHook(() => useMarketplaceProducts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const product = result.current.products[0]

    expect(product.batchId).toBe('1')
    expect(product.farmerAddress).toBe(mockPassportData.owner)
    expect(product.spiceType).toBe('Ceylon Cinnamon')
    expect(product.weight).toBe(5) // 5000 grams = 5 kg
    expect(product.price).toBeGreaterThan(0) // Should calculate price based on weight
    expect(product.status).toBe('sealed')
    expect(product.certifications).toContain('Blockchain Verified')
    expect(product.badges).toHaveLength(2)
  })

  it('should calculate different prices for different spice types', async () => {
    process.env.NEXT_PUBLIC_SPICE_PASSPORT_CONTRACT = '0xabcdef1234567890'
    process.env.NEXT_PUBLIC_RPC_URL = 'https://sepolia.infura.io/v3/test'

    const cinnamonPassport = { ...mockPassportData, spiceType: 'Ceylon Cinnamon' }
    const cardamomPassport = { ...mockPassportData, batchId: BigInt(2), spiceType: 'Cardamom' }
    const pepperPassport = { ...mockPassportData, batchId: BigInt(3), spiceType: 'Black Pepper' }

    const mockService = {
      getPassportsByStatus: jest.fn().mockResolvedValue([1, 2, 3]),
      getPassportsBatch: jest.fn().mockResolvedValue([
        cinnamonPassport,
        cardamomPassport,
        pepperPassport
      ])
    }

    MockedSpicePassportService.mockImplementation(() => mockService as any)

    const { result } = renderHook(() => useMarketplaceProducts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const [cinnamon, cardamom, pepper] = result.current.products

    // Cardamom should be most expensive, pepper cheapest
    expect(cardamom.price).toBeGreaterThan(cinnamon.price)
    expect(cinnamon.price).toBeGreaterThan(pepper.price)
  })
})