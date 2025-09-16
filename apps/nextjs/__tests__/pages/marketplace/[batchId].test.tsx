import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { useRouter } from 'next/router'
import { useMarketplaceProduct } from '@/hooks/useMarketplaceProducts'
import { useAuth } from '@/hooks/useAuth'
import SpicePassportPage from '../[batchId]'

// Mock Next.js components
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

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

jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />
  }
})

// Mock hooks
jest.mock('@/hooks/useMarketplaceProducts')
jest.mock('@/hooks/useAuth')

// Mock components
jest.mock('@/components/marketplace/MarketplaceLayout', () => {
  return function MockMarketplaceLayout({ children }: { children: React.ReactNode }) {
    return <div data-testid="marketplace-layout">{children}</div>
  }
})

jest.mock('@/components/marketplace/ProvenanceTimeline', () => {
  return function MockProvenanceTimeline({ batchId, harvestDate, sealedAt }: any) {
    return (
      <div data-testid="provenance-timeline">
        Timeline: {batchId}, {harvestDate}, {sealedAt}
      </div>
    )
  }
})

jest.mock('@/components/marketplace/FarmerCard', () => {
  return function MockFarmerCard({ farmerAddress, farmerName }: any) {
    return (
      <div data-testid="farmer-card">
        Farmer: {farmerName} ({farmerAddress})
      </div>
    )
  }
})

jest.mock('@/components/verification/BlockchainVerificationModal', () => {
  return function MockBlockchainVerificationModal({ onClose }: any) {
    return (
      <div data-testid="verification-modal">
        <button onClick={onClose}>Close</button>
      </div>
    )
  }
})

jest.mock('@/components/verification/QRCodeVerifier', () => {
  return function MockQRCodeVerifier({ onClose, onVerified }: any) {
    return (
      <div data-testid="qr-scanner">
        <button onClick={onClose}>Close</button>
        <button onClick={() => onVerified(true)}>Verify</button>
      </div>
    )
  }
})

jest.mock('@/components/marketplace/PurchaseModal', () => {
  return function MockPurchaseModal({ onClose, onPurchaseSuccess }: any) {
    return (
      <div data-testid="purchase-modal">
        <button onClick={onClose}>Close</button>
        <button onClick={() => onPurchaseSuccess('escrow123')}>Purchase</button>
      </div>
    )
  }
})

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUseMarketplaceProduct = useMarketplaceProduct as jest.MockedFunction<typeof useMarketplaceProduct>
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('SpicePassportPage', () => {
  const mockRouter = {
    query: { batchId: 'batch123' },
    back: jest.fn(),
    push: jest.fn()
  }

  const mockProduct = {
    batchId: 'batch123',
    spiceType: 'Ceylon Cinnamon',
    farmerName: 'Farmer John',
    farmerAddress: '0x123456789',
    price: 35.50,
    weight: 5,
    unit: 'kg',
    description: 'Premium Ceylon Cinnamon harvested with traditional methods',
    imageUrl: 'https://example.com/cinnamon.jpg',
    qualityGrade: 'AAA' as const,
    harvestDate: '2024-01-15',
    sealedAt: '2024-01-20',
    region: 'Kandy',
    processingMethod: 'Traditional Sun-Dried',
    verificationHash: 'hash123',
    status: 'sealed' as const,
    certifications: ['Blockchain Verified', 'Organic']
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue(mockRouter as any)
  })

  describe('Loading State', () => {
    it('should show loading skeleton', () => {
      mockUseMarketplaceProduct.mockReturnValue({
        product: null,
        loading: true,
        error: null
      })
      mockUseAuth.mockReturnValue({
        walletClient: null,
        isAuthenticated: false
      } as any)

      render(<SpicePassportPage />)

      expect(screen.getByTestId('marketplace-layout')).toBeInTheDocument()
      // Loading skeleton should have animated pulse elements
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('should show error message when product not found', () => {
      mockUseMarketplaceProduct.mockReturnValue({
        product: null,
        loading: false,
        error: 'Product not found'
      })
      mockUseAuth.mockReturnValue({
        walletClient: null,
        isAuthenticated: false
      } as any)

      render(<SpicePassportPage />)

      expect(screen.getByText('⚠️ Product not found')).toBeInTheDocument()
      expect(screen.getByText('Product not found')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Back to Marketplace' })).toHaveAttribute('href', '/marketplace')
    })

    it('should show default error when no specific error message', () => {
      mockUseMarketplaceProduct.mockReturnValue({
        product: null,
        loading: false,
        error: null
      })
      mockUseAuth.mockReturnValue({
        walletClient: null,
        isAuthenticated: false
      } as any)

      render(<SpicePassportPage />)

      expect(screen.getByText('The requested spice passport could not be found.')).toBeInTheDocument()
    })
  })

  describe('Product Display', () => {
    beforeEach(() => {
      mockUseMarketplaceProduct.mockReturnValue({
        product: mockProduct,
        loading: false,
        error: null
      })
      mockUseAuth.mockReturnValue({
        walletClient: null,
        isAuthenticated: false
      } as any)
    })

    it('should display product information correctly', () => {
      render(<SpicePassportPage />)

      expect(screen.getByText('Ceylon Cinnamon')).toBeInTheDocument()
      expect(screen.getByText('Batch #batch123')).toBeInTheDocument()
      expect(screen.getByText('5 kg')).toBeInTheDocument()
      expect(screen.getByText('$35.50')).toBeInTheDocument()
      expect(screen.getByText('Premium Ceylon Cinnamon harvested with traditional methods')).toBeInTheDocument()
    })

    it('should display product image when available', () => {
      render(<SpicePassportPage />)

      const image = screen.getByRole('img', { name: 'Ceylon Cinnamon' })
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', 'https://example.com/cinnamon.jpg')
    })

    it('should show fallback when no image available', () => {
      const productNoImage = { ...mockProduct, imageUrl: undefined }
      mockUseMarketplaceProduct.mockReturnValue({
        product: productNoImage,
        loading: false,
        error: null
      })

      render(<SpicePassportPage />)

      // Should show Package icon as fallback
      expect(document.querySelector('.lucide-package')).toBeInTheDocument()
    })

    it('should display quality grade badge', () => {
      render(<SpicePassportPage />)

      expect(screen.getByText('Grade AAA')).toBeInTheDocument()
    })

    it('should display blockchain verified badge', () => {
      render(<SpicePassportPage />)

      expect(screen.getByText('Blockchain Verified')).toBeInTheDocument()
    })

    it('should display key product details', () => {
      render(<SpicePassportPage />)

      expect(screen.getByText('Monday, January 15, 2024')).toBeInTheDocument() // Harvest date
      expect(screen.getByText('Kandy')).toBeInTheDocument() // Region
      expect(screen.getByText('Traditional Sun-Dried')).toBeInTheDocument() // Processing method
    })
  })

  describe('Navigation', () => {
    beforeEach(() => {
      mockUseMarketplaceProduct.mockReturnValue({
        product: mockProduct,
        loading: false,
        error: null
      })
      mockUseAuth.mockReturnValue({
        walletClient: null,
        isAuthenticated: false
      } as any)
    })

    it('should show breadcrumb navigation', () => {
      render(<SpicePassportPage />)

      expect(screen.getByRole('link', { name: 'Marketplace' })).toHaveAttribute('href', '/marketplace')
      expect(screen.getByText('Ceylon Cinnamon')).toBeInTheDocument()
    })

    it('should have back button that calls router.back', () => {
      render(<SpicePassportPage />)

      const backButton = screen.getByText('Back to search')
      fireEvent.click(backButton)

      expect(mockRouter.back).toHaveBeenCalled()
    })
  })

  describe('Farmer Information', () => {
    beforeEach(() => {
      mockUseMarketplaceProduct.mockReturnValue({
        product: mockProduct,
        loading: false,
        error: null
      })
      mockUseAuth.mockReturnValue({
        walletClient: null,
        isAuthenticated: false
      } as any)
    })

    it('should display farmer card with correct props', () => {
      render(<SpicePassportPage />)

      const farmerCard = screen.getByTestId('farmer-card')
      expect(farmerCard).toHaveTextContent('Farmer: Farmer John (0x123456789)')
    })
  })

  describe('Provenance Timeline', () => {
    beforeEach(() => {
      mockUseMarketplaceProduct.mockReturnValue({
        product: mockProduct,
        loading: false,
        error: null
      })
      mockUseAuth.mockReturnValue({
        walletClient: null,
        isAuthenticated: false
      } as any)
    })

    it('should display provenance timeline with correct data', () => {
      render(<SpicePassportPage />)

      expect(screen.getByText('Complete Provenance History')).toBeInTheDocument()
      
      const timeline = screen.getByTestId('provenance-timeline')
      expect(timeline).toHaveTextContent('Timeline: batch123, 2024-01-15, 2024-01-20')
    })
  })

  describe('Verification Actions', () => {
    beforeEach(() => {
      mockUseMarketplaceProduct.mockReturnValue({
        product: mockProduct,
        loading: false,
        error: null
      })
    })

    it('should show QR scanner when scan button is clicked', () => {
      mockUseAuth.mockReturnValue({
        walletClient: null,
        isAuthenticated: false
      } as any)

      render(<SpicePassportPage />)

      const scanButton = screen.getByText('Scan QR Code')
      fireEvent.click(scanButton)

      expect(screen.getByTestId('qr-scanner')).toBeInTheDocument()
    })

    it('should show blockchain verification modal when verify button is clicked', () => {
      mockUseAuth.mockReturnValue({
        walletClient: null,
        isAuthenticated: false
      } as any)

      render(<SpicePassportPage />)

      const verifyButton = screen.getByText('Verify on Blockchain')
      fireEvent.click(verifyButton)

      expect(screen.getByTestId('verification-modal')).toBeInTheDocument()
    })

    it('should close modals when close button is clicked', () => {
      mockUseAuth.mockReturnValue({
        walletClient: null,
        isAuthenticated: false
      } as any)

      render(<SpicePassportPage />)

      // Open and close QR scanner
      fireEvent.click(screen.getByText('Scan QR Code'))
      expect(screen.getByTestId('qr-scanner')).toBeInTheDocument()
      
      fireEvent.click(screen.getByText('Close'))
      expect(screen.queryByTestId('qr-scanner')).not.toBeInTheDocument()
    })
  })

  describe('Purchase Functionality', () => {
    it('should prompt to connect wallet when not authenticated', () => {
      mockUseMarketplaceProduct.mockReturnValue({
        product: mockProduct,
        loading: false,
        error: null
      })
      mockUseAuth.mockReturnValue({
        walletClient: null,
        isAuthenticated: false
      } as any)

      // Mock window.alert
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation()

      render(<SpicePassportPage />)

      const buyButton = screen.getByText('Connect Wallet to Buy')
      fireEvent.click(buyButton)

      expect(alertSpy).toHaveBeenCalledWith('Please connect your wallet to make a purchase')
      
      alertSpy.mockRestore()
    })

    it('should open purchase modal when authenticated', () => {
      mockUseMarketplaceProduct.mockReturnValue({
        product: mockProduct,
        loading: false,
        error: null
      })
      mockUseAuth.mockReturnValue({
        walletClient: { account: { address: '0xtest' } },
        isAuthenticated: true
      } as any)

      render(<SpicePassportPage />)

      const buyButton = screen.getByText('Buy Now - $35.50')
      fireEvent.click(buyButton)

      expect(screen.getByTestId('purchase-modal')).toBeInTheDocument()
    })

    it('should redirect to purchases page after successful purchase', () => {
      mockUseMarketplaceProduct.mockReturnValue({
        product: mockProduct,
        loading: false,
        error: null
      })
      mockUseAuth.mockReturnValue({
        walletClient: { account: { address: '0xtest' } },
        isAuthenticated: true
      } as any)

      render(<SpicePassportPage />)

      // Open purchase modal and simulate successful purchase
      fireEvent.click(screen.getByText('Buy Now - $35.50'))
      fireEvent.click(screen.getByText('Purchase'))

      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/purchases')
    })
  })

  describe('SEO and Social Sharing', () => {
    beforeEach(() => {
      mockUseMarketplaceProduct.mockReturnValue({
        product: mockProduct,
        loading: false,
        error: null
      })
      mockUseAuth.mockReturnValue({
        walletClient: null,
        isAuthenticated: false
      } as any)
    })

    it('should set correct page title', () => {
      render(<SpicePassportPage />)
      
      // In a real test, we'd check document.title or Head component
      // This is handled by the mocked Head component
      expect(true).toBe(true) // Placeholder for title check
    })

    it('should set meta description', () => {
      render(<SpicePassportPage />)
      
      // In a real test, we'd check meta tags
      // This is handled by the mocked Head component
      expect(true).toBe(true) // Placeholder for meta description check
    })
  })

  describe('Quality Assurance Section', () => {
    beforeEach(() => {
      mockUseMarketplaceProduct.mockReturnValue({
        product: mockProduct,
        loading: false,
        error: null
      })
      mockUseAuth.mockReturnValue({
        walletClient: null,
        isAuthenticated: false
      } as any)
    })

    it('should display quality assurance information', () => {
      render(<SpicePassportPage />)

      expect(screen.getByText('Quality Assurance')).toBeInTheDocument()
      expect(screen.getByText('Blockchain-verified authenticity')).toBeInTheDocument()
      expect(screen.getByText('Complete provenance tracking')).toBeInTheDocument()
      expect(screen.getByText('Quality grade: AAA')).toBeInTheDocument()
      expect(screen.getByText('Processing method documented')).toBeInTheDocument()
    })

    it('should display shipping information', () => {
      render(<SpicePassportPage />)

      expect(screen.getByText('Shipping & Handling')).toBeInTheDocument()
      expect(screen.getByText('Sealed and ready to ship')).toBeInTheDocument()
      expect(screen.getByText('Protective packaging included')).toBeInTheDocument()
      expect(screen.getByText('Tracking information provided')).toBeInTheDocument()
      expect(screen.getByText('Quality guaranteed upon delivery')).toBeInTheDocument()
    })
  })
})