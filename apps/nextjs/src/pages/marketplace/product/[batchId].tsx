import React, { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { MarketplaceLayout } from '@/components/marketplace/MarketplaceLayout'
import { useMarketplaceProduct } from '@/hooks/useMarketplaceProducts'
import { BlockchainVerificationModal } from '@/components/verification/BlockchainVerificationModal'
import { ProvenanceTimeline } from '@/components/marketplace/ProvenanceTimeline'
import { FarmerCard } from '@/components/marketplace/FarmerCard'
import { QRCodeVerifier } from '@/components/verification/QRCodeVerifier'
import { PurchaseModal } from '@/components/marketplace/PurchaseModal'
import { useAuth } from '@/hooks/useAuth'
import { 
  Shield, 
  Verified, 
  Calendar, 
  Weight, 
  MapPin, 
  Award, 
  Truck,
  Package,
  ExternalLink,
  ChevronLeft,
  Star,
  ShoppingCart
} from 'lucide-react'

const SpicePassportPage: React.FC = () => {
  const router = useRouter()
  const { batchId } = router.query
  const { product, loading, error } = useMarketplaceProduct(batchId as string)
  const { walletClient, isAuthenticated } = useAuth()
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)

  if (loading) {
    return (
      <MarketplaceLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </MarketplaceLayout>
    )
  }

  if (error || !product) {
    return (
      <MarketplaceLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
              <div className="text-red-600 mb-2">⚠️ Product not found</div>
              <p className="text-red-700 text-sm">
                {error || 'The requested spice passport could not be found.'}
              </p>
              <Link 
                href="/marketplace"
                className="mt-4 inline-block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Back to Marketplace
              </Link>
            </div>
          </div>
        </div>
      </MarketplaceLayout>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getQualityGradeBadge = (grade: string) => {
    const colors = {
      'AA': 'bg-purple-100 text-purple-800 border-purple-200',
      'A+': 'bg-green-100 text-green-800 border-green-200',
      'A': 'bg-blue-100 text-blue-800 border-blue-200',
      'B+': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'B': 'bg-gray-100 text-gray-800 border-gray-200'
    }
    
    return colors[grade as keyof typeof colors] || colors.B
  }

  return (
    <>
      <Head>
        <title>{product.spiceType} - Batch #{product.batchId} | Spiced Marketplace</title>
        <meta 
          name="description" 
          content={`${product.spiceType} by ${product.farmerName}. ${product.description}`}
        />
        <meta property="og:title" content={`${product.spiceType} - Batch #${product.batchId}`} />
        <meta property="og:description" content={product.description} />
        {product.imageUrl && <meta property="og:image" content={product.imageUrl} />}
      </Head>

      <MarketplaceLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
            <Link href="/marketplace" className="hover:text-orange-600">
              Marketplace
            </Link>
            <span>/</span>
            <span className="text-gray-900">{product.spiceType}</span>
          </nav>

          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to search
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.spiceType}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="h-24 w-24 text-gray-400" />
                  </div>
                )}
                
                {/* Quality Grade Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium border rounded-full ${getQualityGradeBadge(product.qualityGrade)}`}>
                    <Award className="h-3 w-3" />
                    Grade {product.qualityGrade}
                  </span>
                </div>

                {/* Blockchain Verified Badge */}
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium border border-green-200 rounded-full">
                    <Shield className="h-3 w-3" />
                    Blockchain Verified
                  </span>
                </div>
              </div>

              {/* QR Code Verification */}
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-sm text-gray-600 mb-2">
                  Verify this product by scanning its QR code
                </div>
                <button
                  onClick={() => setShowQRScanner(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Package className="h-4 w-4" />
                  Scan QR Code
                </button>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.spiceType}
                </h1>
                <div className="flex items-center gap-2 text-lg text-gray-600 mb-4">
                  <span>Batch #{product.batchId}</span>
                  <span>•</span>
                  <span>{product.weight} kg</span>
                </div>
                
                <div className="text-4xl font-bold text-orange-600 mb-6">
                  {formatPrice(product.price)}
                </div>

                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Key Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600">Harvested</div>
                    <div className="font-medium">{formatDate(product.harvestDate)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Weight className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600">Weight</div>
                    <div className="font-medium">{product.weight} kg</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600">Origin</div>
                    <div className="font-medium">{product.region}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Truck className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600">Processing</div>
                    <div className="font-medium">{product.processingMethod}</div>
                  </div>
                </div>
              </div>

              {/* Verification Actions */}
              <div className="border-t pt-6 space-y-4">
                <button
                  onClick={() => setShowVerificationModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Verified className="h-5 w-5" />
                  Verify on Blockchain
                </button>

                <button 
                  onClick={() => {
                    if (isAuthenticated) {
                      setShowPurchaseModal(true)
                    } else {
                      alert('Please connect your wallet to make a purchase')
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {isAuthenticated ? `Buy Now - ${formatPrice(product.price)}` : 'Connect Wallet to Buy'}
                </button>
              </div>
            </div>
          </div>

          {/* Farmer Information */}
          <div className="mb-12">
            <FarmerCard 
              farmerAddress={product.farmerAddress}
              farmerName={product.farmerName}
            />
          </div>

          {/* Provenance Timeline */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Complete Provenance History
            </h2>
            <ProvenanceTimeline 
              batchId={product.batchId}
              harvestDate={product.harvestDate}
              sealedAt={product.sealedAt}
            />
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Quality Assurance
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Blockchain-verified authenticity
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Complete provenance tracking
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Quality grade: {product.qualityGrade}
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Processing method documented
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5 text-blue-600" />
                Shipping & Handling
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Sealed and ready to ship
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Protective packaging included
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Tracking information provided
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Quality guaranteed upon delivery
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Blockchain Verification Modal */}
        {showVerificationModal && (
          <BlockchainVerificationModal
            batchId={product.batchId}
            verificationHash={product.verificationHash}
            onClose={() => setShowVerificationModal(false)}
          />
        )}

        {/* QR Code Scanner Modal */}
        {showQRScanner && (
          <QRCodeVerifier
            expectedBatchId={product.batchId}
            onClose={() => setShowQRScanner(false)}
            onVerified={(verified) => {
              console.log('QR verification result:', verified)
              setShowQRScanner(false)
            }}
          />
        )}

        {/* Purchase Modal */}
        {showPurchaseModal && (
          <PurchaseModal
            product={{
              batchId: product.batchId,
              spiceType: product.spiceType,
              price: product.price,
              totalWeight: product.weight * 1000, // Convert kg to grams
              farmerAddress: product.farmerAddress,
              farmerName: product.farmerName,
              photos: product.imageUrl ? [product.imageUrl] : []
            }}
            walletClient={walletClient}
            onClose={() => setShowPurchaseModal(false)}
            onPurchaseSuccess={(escrowId) => {
              console.log('Purchase successful! Escrow ID:', escrowId)
              setShowPurchaseModal(false)
              router.push('/dashboard/purchases')
            }}
          />
        )}
      </MarketplaceLayout>
    </>
  )
}

export default SpicePassportPage