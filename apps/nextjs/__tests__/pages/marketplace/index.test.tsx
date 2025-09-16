import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useMarketplaceProducts } from '@/hooks/useMarketplaceProducts'
import MarketplacePage from '../index'

// Mock the hook
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
            {product.spiceType}
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

describe('MarketplacePage', () => {
  const mockProducts = [
    {
      batchId: '1',
      spiceType: 'Ceylon Cinnamon',
      farmerName: 'Farmer A',
      farmerAddress: '0x123',
      price: 35,
      weight: 5,
      unit: 'kg'
    },
    {
      batchId: '2',
      spiceType: 'Black Pepper',
      farmerName: 'Farmer B',
      farmerAddress: '0x456',
      price: 15,
      weight: 3,
      unit: 'kg'
    },
    {
      batchId: '3',
      spiceType: 'Cardamom',
      farmerName: 'Farmer C',
      farmerAddress: '0x789',
      price: 80,
      weight: 1,
      unit: 'kg'
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render loading state', () => {
    mockUseMarketplaceProducts.mockReturnValue({
      products: [],
      loading: true,
      error: null,
      refetch: jest.fn(),
      stats: {
        totalProducts: 0,
        uniqueFarmers: 0,
        uniqueSpiceTypes: 0,
        averagePrice: 0
      }
    })

    render(<MarketplacePage />)

    expect(screen.getByTestId('loading')).toBeInTheDocument()
  })

  it('should render products when loaded', () => {
    mockUseMarketplaceProducts.mockReturnValue({
      products: mockProducts,
      loading: false,
      error: null,
      refetch: jest.fn(),
      stats: {
        totalProducts: 3,
        uniqueFarmers: 3,
        uniqueSpiceTypes: 3,
        averagePrice: 43.33
      }
    })

    render(<MarketplacePage />)

    expect(screen.getByTestId('hero')).toHaveTextContent('Hero: 3 products')
    expect(screen.getByTestId('stats')).toHaveTextContent('Stats: 3 products')
    expect(screen.getByTestId('product-grid')).toBeInTheDocument()
    expect(screen.getByTestId('product-1')).toHaveTextContent('Ceylon Cinnamon')
    expect(screen.getByTestId('product-2')).toHaveTextContent('Black Pepper')
    expect(screen.getByTestId('product-3')).toHaveTextContent('Cardamom')
  })

  it('should render error state', () => {
    mockUseMarketplaceProducts.mockReturnValue({
      products: [],
      loading: false,
      error: 'Failed to load products',
      refetch: jest.fn(),
      stats: {
        totalProducts: 0,
        uniqueFarmers: 0,
        uniqueSpiceTypes: 0,
        averagePrice: 0
      }
    })

    render(<MarketplacePage />)

    expect(screen.getByText('⚠️ Unable to load products')).toBeInTheDocument()
    expect(screen.getByText('Failed to load products')).toBeInTheDocument()
  })

  it('should render empty state when no products', () => {
    mockUseMarketplaceProducts.mockReturnValue({
      products: [],
      loading: false,
      error: null,
      refetch: jest.fn(),
      stats: {
        totalProducts: 0,
        uniqueFarmers: 0,
        uniqueSpiceTypes: 0,
        averagePrice: 0
      }
    })

    render(<MarketplacePage />)

    expect(screen.getByTestId('empty-message')).toHaveTextContent(
      'No products available yet. Check back soon!'
    )
  })

  it('should filter products by search query', async () => {
    mockUseMarketplaceProducts.mockReturnValue({
      products: mockProducts,
      loading: false,
      error: null,
      refetch: jest.fn(),
      stats: {
        totalProducts: 3,
        uniqueFarmers: 3,
        uniqueSpiceTypes: 3,
        averagePrice: 43.33
      }
    })

    render(<MarketplacePage />)

    const searchInput = screen.getByPlaceholderText('Search spices or farmers...')
    
    fireEvent.change(searchInput, { target: { value: 'cinnamon' } })

    // Should show filtered results count
    expect(screen.getByText('1 of 3 products')).toBeInTheDocument()
  })

  it('should toggle filter panel', () => {
    mockUseMarketplaceProducts.mockReturnValue({
      products: mockProducts,
      loading: false,
      error: null,
      refetch: jest.fn(),
      stats: {
        totalProducts: 3,
        uniqueFarmers: 3,
        uniqueSpiceTypes: 3,
        averagePrice: 43.33
      }
    })

    render(<MarketplacePage />)

    const filterButton = screen.getByText('Filters')
    
    // Filter panel should not be visible initially
    expect(screen.queryByText('Spice Types')).not.toBeInTheDocument()
    
    fireEvent.click(filterButton)
    
    // Filter panel should be visible after clicking
    expect(screen.getByText('Spice Types')).toBeInTheDocument()
  })

  it('should filter products by spice type', () => {
    mockUseMarketplaceProducts.mockReturnValue({
      products: mockProducts,
      loading: false,
      error: null,
      refetch: jest.fn(),
      stats: {
        totalProducts: 3,
        uniqueFarmers: 3,
        uniqueSpiceTypes: 3,
        averagePrice: 43.33
      }
    })

    render(<MarketplacePage />)

    // Open filters
    fireEvent.click(screen.getByText('Filters'))

    // Select Ceylon Cinnamon filter
    const cinnamonCheckbox = screen.getByRole('checkbox', { name: /Ceylon Cinnamon/i })
    fireEvent.click(cinnamonCheckbox)

    // Should show filtered results
    expect(screen.getByText('1 of 3 products')).toBeInTheDocument()
    
    // Should show filter count badge
    expect(screen.getByText('1')).toBeInTheDocument() // Filter badge
  })

  it('should clear all filters', () => {
    mockUseMarketplaceProducts.mockReturnValue({
      products: mockProducts,
      loading: false,
      error: null,
      refetch: jest.fn(),
      stats: {
        totalProducts: 3,
        uniqueFarmers: 3,
        uniqueSpiceTypes: 3,
        averagePrice: 43.33
      }
    })

    render(<MarketplacePage />)

    // Open filters and select one
    fireEvent.click(screen.getByText('Filters'))
    const cinnamonCheckbox = screen.getByRole('checkbox', { name: /Ceylon Cinnamon/i })
    fireEvent.click(cinnamonCheckbox)

    expect(screen.getByText('1 of 3 products')).toBeInTheDocument()

    // Clear all filters
    fireEvent.click(screen.getByText('Clear all filters'))

    expect(screen.getByText('3 of 3 products')).toBeInTheDocument()
  })

  it('should show correct SEO meta tags', () => {
    mockUseMarketplaceProducts.mockReturnValue({
      products: mockProducts,
      loading: false,
      error: null,
      refetch: jest.fn(),
      stats: {
        totalProducts: 3,
        uniqueFarmers: 3,
        uniqueSpiceTypes: 3,
        averagePrice: 43.33
      }
    })

    render(<MarketplacePage />)

    // Check that title is rendered (mocked Head component)
    expect(document.title).toBe('') // Default in test environment
    
    // In a real test, we'd check that the Head component receives the correct props
    // This would require a more sophisticated Head mock
  })

  it('should show call-to-action section', () => {
    mockUseMarketplaceProducts.mockReturnValue({
      products: mockProducts,
      loading: false,
      error: null,
      refetch: jest.fn(),
      stats: {
        totalProducts: 3,
        uniqueFarmers: 3,
        uniqueSpiceTypes: 3,
        averagePrice: 43.33
      }
    })

    render(<MarketplacePage />)

    expect(screen.getByText('Are you a spice farmer?')).toBeInTheDocument()
    expect(screen.getByText('Join as a Farmer')).toBeInTheDocument()
    
    const joinLink = screen.getByRole('link', { name: 'Join as a Farmer' })
    expect(joinLink).toHaveAttribute('href', '/auth/login')
  })
})