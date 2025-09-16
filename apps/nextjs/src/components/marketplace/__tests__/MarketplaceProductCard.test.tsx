import React from 'react'
import { render, screen } from '@testing-library/react'
import { MarketplaceProductCard } from '../MarketplaceProductCard'
import { type MarketplaceProduct } from '@/types/marketplace'

// Mock Next.js components
jest.mock('next/link', () => {
  return function MockLink({ href, children, ...props }: any) {
    return <a href={href} {...props}>{children}</a>
  }
})

jest.mock('next/image', () => {
  return function MockImage({ src, alt, fill, ...props }: any) {
    // Convert fill prop to string to avoid React warning
    const imgProps = fill ? { ...props, 'data-fill': 'true' } : props
    return <img src={src} alt={alt} {...imgProps} />
  }
})

// Mock data
jest.mock('@/data/demoData', () => ({
  QUALITY_GRADES: {
    'AAA': { color: 'text-purple-600 bg-purple-100', name: 'Premium AAA' },
    'AA': { color: 'text-blue-600 bg-blue-100', name: 'Premium AA' },
    'A+': { color: 'text-green-600 bg-green-100', name: 'Grade A+' },
    'A': { color: 'text-yellow-600 bg-yellow-100', name: 'Grade A' },
    'B+': { color: 'text-orange-600 bg-orange-100', name: 'Grade B+' },
    'B': { color: 'text-gray-600 bg-gray-100', name: 'Grade B' }
  }
}))

describe('MarketplaceProductCard', () => {
  const mockProduct: MarketplaceProduct = {
    batchId: '12345',
    farmerAddress: '0x1234567890123456789012345678901234567890',
    spiceType: 'Ceylon Cinnamon',
    farmerName: 'Farmer John',
    price: 35.50,
    weight: 5.0,
    unit: 'kg',
    description: 'Premium Ceylon Cinnamon harvested with traditional methods',
    qualityGrade: 'AAA',
    region: 'Kandy',
    processingMethod: 'Traditional Sun-Dried',
    harvestDate: '2024-01-15',
    sealedAt: '2024-01-20',
    verificationHash: 'ipfs://QmTest123',
    status: 'sealed',
    certifications: ['Organic Certified', 'Fair Trade', 'Blockchain Verified'],
    sustainabilityScore: 9.2,
    reputationScore: 4.8,
    carbonFootprint: '2.1kg CO2e',
    moistureContent: '10.2%',
    harvestHash: 'ipfs://QmHarvest123',
    processingHashes: ['ipfs://QmProcess1', 'ipfs://QmProcess2'],
    reviews: [
      {
        rating: 5,
        comment: 'Excellent quality cinnamon!',
        buyer: 'Alice'
      },
      {
        rating: 4,
        comment: 'Very aromatic and fresh',
        buyer: 'Bob'
      }
    ],
    badges: [
      {
        id: 'verified',
        name: 'Blockchain Verified',
        description: 'Product authenticity verified on blockchain',
        icon: 'shield',
        earnedDate: new Date('2024-01-20')
      }
    ]
  }

  it('should render product information correctly', () => {
    render(<MarketplaceProductCard product={mockProduct} />)

    expect(screen.getByText('Ceylon Cinnamon')).toBeInTheDocument()
    expect(screen.getByText('Farmer John')).toBeInTheDocument()
    expect(screen.getByText('$35.50')).toBeInTheDocument()
    expect(screen.getByText('5 kg')).toBeInTheDocument()
    expect(screen.getByText('Premium Ceylon Cinnamon harvested with traditional methods')).toBeInTheDocument()
  })

  it('should render quality grade badge', () => {
    render(<MarketplaceProductCard product={mockProduct} />)

    expect(screen.getByText('AAA')).toBeInTheDocument()
  })

  it('should render verification badge', () => {
    render(<MarketplaceProductCard product={mockProduct} />)

    expect(screen.getByText('Verified')).toBeInTheDocument()
    expect(screen.getAllByText('Blockchain Verified')).toHaveLength(2) // In certifications and footer
  })

  it('should render certifications', () => {
    render(<MarketplaceProductCard product={mockProduct} />)

    expect(screen.getByText('Organic Certified')).toBeInTheDocument()
    expect(screen.getByText('Fair Trade')).toBeInTheDocument()
    expect(screen.getAllByText('Blockchain Verified')).toHaveLength(2) // In certifications and footer
  })

  it('should render sustainability score', () => {
    render(<MarketplaceProductCard product={mockProduct} />)

    expect(screen.getByText('Sustainability Score')).toBeInTheDocument()
    expect(screen.getByText('9.2/10')).toBeInTheDocument()
  })

  it('should render carbon footprint', () => {
    render(<MarketplaceProductCard product={mockProduct} />)

    expect(screen.getByText('Carbon Footprint')).toBeInTheDocument()
    expect(screen.getByText('2.1kg CO2e')).toBeInTheDocument()
  })

  it('should render reviews section', () => {
    render(<MarketplaceProductCard product={mockProduct} />)

    expect(screen.getByText('4.5 (2 reviews)')).toBeInTheDocument()
    expect(screen.getByText('"Excellent quality cinnamon!" - Alice')).toBeInTheDocument()
  })

  it('should render correct action buttons with links', () => {
    render(<MarketplaceProductCard product={mockProduct} />)

    const viewDetailsLink = screen.getByRole('link', { name: 'View Details' })
    expect(viewDetailsLink).toHaveAttribute('href', '/marketplace/product/12345')

    const verifyLink = screen.getByRole('link', { name: /Verify/i })
    expect(verifyLink).toHaveAttribute('href', '/marketplace/verify/12345')

    // Farmer profile link (icon button)
    const farmerLinks = screen.getAllByRole('link')
    const farmerProfileLink = farmerLinks.find(link => 
      link.getAttribute('href') === `/marketplace/farmer/${mockProduct.farmerAddress}`
    )
    expect(farmerProfileLink).toBeInTheDocument()
  })

  it('should format date correctly', () => {
    render(<MarketplaceProductCard product={mockProduct} />)

    expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument()
  })

  it('should show eco badge for high sustainability score', () => {
    const ecoProduct = { ...mockProduct, sustainabilityScore: 9.0 }
    render(<MarketplaceProductCard product={ecoProduct} />)

    expect(screen.getByText('Eco+')).toBeInTheDocument()
  })

  it('should not show eco badge for lower sustainability score', () => {
    const normalProduct = { ...mockProduct, sustainabilityScore: 7.0 }
    render(<MarketplaceProductCard product={normalProduct} />)

    expect(screen.queryByText('Eco+')).not.toBeInTheDocument()
  })

  it('should render product with image', () => {
    const productWithImage = { ...mockProduct, imageUrl: 'https://example.com/image.jpg' }
    render(<MarketplaceProductCard product={productWithImage} />)

    const image = screen.getByRole('img', { name: 'Ceylon Cinnamon by Farmer John' })
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg')
  })

  it('should render fallback when no image provided', () => {
    const productNoImage = { ...mockProduct, imageUrl: undefined }
    render(<MarketplaceProductCard product={productNoImage} />)

    // Should show Package icon as fallback (look for the lucide package class)
    expect(document.querySelector('.lucide-package')).toBeInTheDocument()
  })

  it('should show active compounds when present', () => {
    const productWithCompounds = {
      ...mockProduct,
      curcumin: '3.5%',
      piperine: '8.2%'
    }
    render(<MarketplaceProductCard product={productWithCompounds} />)

    expect(screen.getByText('Active Compounds')).toBeInTheDocument()
    expect(screen.getByText('8.2% Piperine +1 more')).toBeInTheDocument() // First compound shown
  })

  it('should not show active compounds section when none present', () => {
    render(<MarketplaceProductCard product={mockProduct} />)

    expect(screen.queryByText('Active Compounds')).not.toBeInTheDocument()
  })

  it('should limit certifications display to 3 with overflow indicator', () => {
    const productManyCategories = {
      ...mockProduct,
      certifications: ['Organic', 'Fair Trade', 'Blockchain Verified', 'Rainforest Alliance', 'UTZ Certified']
    }
    render(<MarketplaceProductCard product={productManyCategories} />)

    expect(screen.getByText('Organic')).toBeInTheDocument()
    expect(screen.getByText('Fair Trade')).toBeInTheDocument()
    expect(screen.getAllByText('Blockchain Verified')).toHaveLength(2) // In certs and footer
    expect(screen.getByText('+2')).toBeInTheDocument() // Overflow indicator
  })

  it('should show batch ID in verification footer', () => {
    render(<MarketplaceProductCard product={mockProduct} />)

    expect(screen.getByText('#12345')).toBeInTheDocument()
  })

  it('should handle products without reviews', () => {
    const productNoReviews = { ...mockProduct, reviews: [] }
    render(<MarketplaceProductCard product={productNoReviews} />)

    expect(screen.queryByText(/reviews/)).not.toBeInTheDocument()
  })

  it('should handle products without certifications', () => {
    const productNoCerts = { ...mockProduct, certifications: [] }
    render(<MarketplaceProductCard product={productNoCerts} />)

    // Should not render certifications section
    const certElements = screen.queryAllByText(/Organic|Fair Trade|Blockchain Verified/)
    expect(certElements).toHaveLength(1) // Only the "Blockchain Verified" in footer should remain
  })
})