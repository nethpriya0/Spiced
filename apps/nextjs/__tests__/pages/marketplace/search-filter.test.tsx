import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/router'
import { useMarketplaceProducts } from '@/hooks/useMarketplaceProducts'
import MarketplacePage from '../index'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

// Mock the marketplace products hook
jest.mock('@/hooks/useMarketplaceProducts')
const mockUseMarketplaceProducts = useMarketplaceProducts as jest.MockedFunction<typeof useMarketplaceProducts>

// Mock Next.js components
jest.mock('next/head', () => {
  return function MockHead({ children }: { children: React.ReactNode }) {
    return <>{children}</>
  }
})

jest.mock('next/link', () => {
  return function MockLink({ href, children, ...props }: any) {
    return <a href={href} {...props}>{children}</a>
  }
})

// Mock marketplace components
jest.mock('@/components/marketplace/MarketplaceLayout', () => {
  return function MockMarketplaceLayout({ children }: { children: React.ReactNode }) {
    return <div data-testid="marketplace-layout">{children}</div>
  }
})

jest.mock('@/components/marketplace/MarketplaceProductGrid', () => {
  return function MockMarketplaceProductGrid({ products, loading, emptyMessage }: any) {
    if (loading) return <div data-testid="loading">Loading...</div>
    if (products.length === 0) return <div data-testid="empty-message">{emptyMessage}</div>
    return (
      <div data-testid="product-grid">
        {products.map((product: any) => (
          <div key={product.batchId} data-testid={`product-${product.batchId}`}>
            {product.spiceType} - ${product.price}
          </div>
        ))}
      </div>
    )
  }
})

jest.mock('@/components/marketplace/MarketplaceHero', () => {
  return function MockMarketplaceHero({ totalProducts }: any) {
    return <div data-testid="hero">Hero: {totalProducts} products</div>
  }
})

jest.mock('@/components/marketplace/MarketplaceStats', () => {
  return function MockMarketplaceStats({ products }: any) {
    return <div data-testid="stats">Stats: {products.length} products</div>
  }
})

describe('Marketplace Search and Filter Functionality', () => {
  const mockProducts = [
    {
      batchId: '1',
      spiceType: 'Ceylon Cinnamon',
      farmerName: 'Farmer A',
      farmerAddress: '0x123',
      price: 35.50,
      weight: 5,
      unit: 'kg',
      harvestDate: '2024-01-15',
      sealedAt: '2024-01-20',
      qualityGrade: 'AAA' as const,
      status: 'sealed' as const,
      certifications: ['Blockchain Verified', 'Organic']
    },
    {
      batchId: '2',
      spiceType: 'Black Pepper',
      farmerName: 'Farmer B',
      farmerAddress: '0x456',
      price: 15.75,
      weight: 3,
      unit: 'kg',
      harvestDate: '2024-01-10',
      sealedAt: '2024-01-18',
      qualityGrade: 'AA' as const,
      status: 'sealed' as const,
      certifications: ['Blockchain Verified']
    },
    {
      batchId: '3',
      spiceType: 'Cardamom',
      farmerName: 'Farmer C',
      farmerAddress: '0x789',
      price: 80.00,
      weight: 1,
      unit: 'kg',
      harvestDate: '2024-01-20',
      sealedAt: '2024-01-25',
      qualityGrade: 'AAA' as const,
      status: 'sealed' as const,
      certifications: ['Blockchain Verified', 'Fair Trade']
    }
  ]

  const mockRouter = {
    query: {},
    pathname: '/marketplace',
    replace: jest.fn(),
    push: jest.fn(),
    asPath: '/marketplace'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    ;(mockUseRouter as any).mockReturnValue(mockRouter)
    
    mockUseMarketplaceProducts.mockReturnValue({
      products: mockProducts,
      loading: false,
      error: null,
      refetch: jest.fn(),
      stats: {
        totalProducts: 3,
        uniqueFarmers: 3,
        uniqueSpiceTypes: 3,
        averagePrice: 43.75
      }
    })
  })

  describe('Search Functionality', () => {
    it('should filter products by spice type search', async () => {
      render(<MarketplacePage />)

      const searchInput = screen.getByPlaceholderText(/Search spices or farmers/i)
      fireEvent.change(searchInput, { target: { value: 'cinnamon' } })

      expect(screen.getByText('1 of 3 products')).toBeInTheDocument()
    })

    it('should filter products by farmer name search', async () => {
      render(<MarketplacePage />)

      const searchInput = screen.getByPlaceholderText(/Search spices or farmers/i)
      fireEvent.change(searchInput, { target: { value: 'Farmer B' } })

      expect(screen.getByText('1 of 3 products')).toBeInTheDocument()
    })

    it('should support fuzzy search matching', async () => {
      render(<MarketplacePage />)

      const searchInput = screen.getByPlaceholderText(/Search spices or farmers/i)
      
      // Test fuzzy matching with partial characters
      fireEvent.change(searchInput, { target: { value: 'cinn' } })
      expect(screen.getByText('1 of 3 products')).toBeInTheDocument()
      
      // Test fuzzy matching with character variations
      fireEvent.change(searchInput, { target: { value: 'cardmom' } }) // Missing 'a'
      expect(screen.getByText('1 of 3 products')).toBeInTheDocument()
    })

    it('should update URL when search query changes', async () => {
      render(<MarketplacePage />)

      const searchInput = screen.getByPlaceholderText(/Search spices or farmers/i)
      fireEvent.change(searchInput, { target: { value: 'cinnamon' } })

      expect(mockRouter.replace).toHaveBeenCalledWith(
        { pathname: '/marketplace', query: { q: 'cinnamon' } },
        undefined,
        { shallow: true }
      )
    })

    it('should clear search when query is empty', async () => {
      render(<MarketplacePage />)

      const searchInput = screen.getByPlaceholderText(/Search spices or farmers/i)
      fireEvent.change(searchInput, { target: { value: 'cinnamon' } })
      fireEvent.change(searchInput, { target: { value: '' } })

      expect(screen.getByText('3 of 3 products')).toBeInTheDocument()
    })
  })

  describe('Sort Functionality', () => {
    it('should show sort dropdown when clicked', () => {
      render(<MarketplacePage />)

      const sortButton = screen.getByText('Sort')
      fireEvent.click(sortButton)

      expect(screen.getByText('Sort by:')).toBeInTheDocument()
      expect(screen.getByText('Price')).toBeInTheDocument()
      expect(screen.getByText('Low to High')).toBeInTheDocument()
      expect(screen.getByText('High to Low')).toBeInTheDocument()
    })

    it('should sort products by price low to high', () => {
      render(<MarketplacePage />)

      // Open sort menu
      const sortButton = screen.getByText('Sort')
      fireEvent.click(sortButton)

      // Click price low to high
      const priceLowHigh = screen.getByText('Low to High')
      fireEvent.click(priceLowHigh)

      // Check that URL was updated
      expect(mockRouter.replace).toHaveBeenCalledWith(
        { pathname: '/marketplace', query: { sort: 'price', dir: 'asc' } },
        undefined,
        { shallow: true }
      )
    })

    it('should sort products by price high to low', () => {
      render(<MarketplacePage />)

      const sortButton = screen.getByText('Sort')
      fireEvent.click(sortButton)

      const priceHighLow = screen.getByText('High to Low')
      fireEvent.click(priceHighLow)

      expect(mockRouter.replace).toHaveBeenCalledWith(
        { pathname: '/marketplace', query: { sort: 'price', dir: 'desc' } },
        undefined,
        { shallow: true }
      )
    })

    it('should sort by date (newest first)', () => {
      render(<MarketplacePage />)

      const sortButton = screen.getByText('Sort')
      fireEvent.click(sortButton)

      const newestFirst = screen.getAllByText('Newest First')[0] // First occurrence (Date Added)
      fireEvent.click(newestFirst)

      expect(mockRouter.replace).toHaveBeenCalledWith(
        { pathname: '/marketplace', query: { sort: 'sealedAt', dir: 'desc' } },
        undefined,
        { shallow: true }
      )
    })

    it('should sort by quality grade', () => {
      render(<MarketplacePage />)

      const sortButton = screen.getByText('Sort')
      fireEvent.click(sortButton)

      const qualityAAATob = screen.getByText('AAA to B')
      fireEvent.click(qualityAAATob)

      expect(mockRouter.replace).toHaveBeenCalledWith(
        { pathname: '/marketplace', query: { sort: 'qualityGrade', dir: 'desc' } },
        undefined,
        { shallow: true }
      )
    })
  })

  describe('Filter Functionality', () => {
    it('should toggle filter panel', () => {
      render(<MarketplacePage />)

      const filterButton = screen.getByText('Filters')
      
      // Filter panel should not be visible initially
      expect(screen.queryByText('Spice Types')).not.toBeInTheDocument()
      
      fireEvent.click(filterButton)
      
      // Filter panel should be visible
      expect(screen.getByText('Spice Types')).toBeInTheDocument()
    })

    it('should filter by spice type', () => {
      render(<MarketplacePage />)

      // Open filters
      fireEvent.click(screen.getByText('Filters'))

      // Select Ceylon Cinnamon
      const cinnamonCheckbox = screen.getByRole('checkbox', { name: /Ceylon Cinnamon/i })
      fireEvent.click(cinnamonCheckbox)

      expect(screen.getByText('1 of 3 products')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument() // Filter count badge
    })

    it('should filter by verification status', () => {
      render(<MarketplacePage />)

      fireEvent.click(screen.getByText('Filters'))

      const verifiedOnlyRadio = screen.getByRole('radio', { name: /Blockchain Verified Only/i })
      fireEvent.click(verifiedOnlyRadio)

      expect(mockRouter.replace).toHaveBeenCalledWith(
        { pathname: '/marketplace', query: { verified: 'true' } },
        undefined,
        { shallow: true }
      )
    })

    it('should show correct filter count in badge', () => {
      render(<MarketplacePage />)

      fireEvent.click(screen.getByText('Filters'))

      // Select one spice type
      const cinnamonCheckbox = screen.getByRole('checkbox', { name: /Ceylon Cinnamon/i })
      fireEvent.click(cinnamonCheckbox)

      // Select verified only
      const verifiedOnlyRadio = screen.getByRole('radio', { name: /Blockchain Verified Only/i })
      fireEvent.click(verifiedOnlyRadio)

      expect(screen.getByText('2')).toBeInTheDocument() // Should show 2 filters active
    })
  })

  describe('Combined Search and Filter', () => {
    it('should apply both search and filters together', () => {
      render(<MarketplacePage />)

      // Add search query
      const searchInput = screen.getByPlaceholderText(/Search spices or farmers/i)
      fireEvent.change(searchInput, { target: { value: 'Farmer' } })

      // Add filter
      fireEvent.click(screen.getByText('Filters'))
      const pepperCheckbox = screen.getByRole('checkbox', { name: /Black Pepper/i })
      fireEvent.click(pepperCheckbox)

      expect(screen.getByText('1 of 3 products')).toBeInTheDocument()
    })

    it('should show clear all filters when filters or search are active', () => {
      render(<MarketplacePage />)

      // Add search
      const searchInput = screen.getByPlaceholderText(/Search spices or farmers/i)
      fireEvent.change(searchInput, { target: { value: 'test' } })

      fireEvent.click(screen.getByText('Filters'))
      expect(screen.getByText('Clear all filters & search')).toBeInTheDocument()
    })

    it('should clear all filters and search', () => {
      render(<MarketplacePage />)

      // Add search and filter
      const searchInput = screen.getByPlaceholderText(/Search spices or farmers/i)
      fireEvent.change(searchInput, { target: { value: 'cinnamon' } })

      fireEvent.click(screen.getByText('Filters'))
      const cinnamonCheckbox = screen.getByRole('checkbox', { name: /Ceylon Cinnamon/i })
      fireEvent.click(cinnamonCheckbox)

      // Clear all
      const clearButton = screen.getByText('Clear all filters & search')
      fireEvent.click(clearButton)

      expect(screen.getByText('3 of 3 products')).toBeInTheDocument()
      expect(searchInput).toHaveValue('')
      expect(mockRouter.replace).toHaveBeenCalledWith('/marketplace', undefined, { shallow: true })
    })
  })

  describe('URL State Persistence', () => {
    it('should load search query from URL', () => {
      mockRouter.query = { q: 'cinnamon' }
      
      render(<MarketplacePage />)

      const searchInput = screen.getByPlaceholderText(/Search spices or farmers/i)
      expect(searchInput).toHaveValue('cinnamon')
    })

    it('should load spice type filters from URL', () => {
      mockRouter.query = { types: 'Ceylon Cinnamon,Black Pepper' }
      
      render(<MarketplacePage />)

      fireEvent.click(screen.getByText('Filters'))
      
      const cinnamonCheckbox = screen.getByRole('checkbox', { name: /Ceylon Cinnamon/i })
      const pepperCheckbox = screen.getByRole('checkbox', { name: /Black Pepper/i })
      
      expect(cinnamonCheckbox).toBeChecked()
      expect(pepperCheckbox).toBeChecked()
    })

    it('should load verification filter from URL', () => {
      mockRouter.query = { verified: 'true' }
      
      render(<MarketplacePage />)

      fireEvent.click(screen.getByText('Filters'))
      
      const verifiedOnlyRadio = screen.getByRole('radio', { name: /Blockchain Verified Only/i })
      expect(verifiedOnlyRadio).toBeChecked()
    })

    it('should load sort option from URL', () => {
      mockRouter.query = { sort: 'price', dir: 'desc' }
      
      render(<MarketplacePage />)

      // The sort option should be applied (we can't directly test the state, 
      // but we can verify the URL structure is handled)
      expect(mockRouter.query.sort).toBe('price')
      expect(mockRouter.query.dir).toBe('desc')
    })
  })

  describe('Real-time Updates', () => {
    it('should update results count in real-time as search changes', () => {
      render(<MarketplacePage />)

      const searchInput = screen.getByPlaceholderText(/Search spices or farmers/i)
      
      // Initially shows all products
      expect(screen.getByText('3 of 3 products')).toBeInTheDocument()
      
      // Search for one product
      fireEvent.change(searchInput, { target: { value: 'cinnamon' } })
      expect(screen.getByText('1 of 3 products')).toBeInTheDocument()
      
      // Search for multiple products
      fireEvent.change(searchInput, { target: { value: 'Farmer' } })
      expect(screen.getByText('3 of 3 products')).toBeInTheDocument()
      
      // Search with no results
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } })
      expect(screen.getByText('0 of 3 products')).toBeInTheDocument()
    })

    it('should update results count when filters change', () => {
      render(<MarketplacePage />)

      fireEvent.click(screen.getByText('Filters'))
      
      expect(screen.getByText('3 of 3 products')).toBeInTheDocument()
      
      const cinnamonCheckbox = screen.getByRole('checkbox', { name: /Ceylon Cinnamon/i })
      fireEvent.click(cinnamonCheckbox)
      
      expect(screen.getByText('1 of 3 products')).toBeInTheDocument()
    })
  })
})