import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { MarketplaceLayout } from '@/components/marketplace/MarketplaceLayout'
import { useMarketplaceProduct } from '@/hooks/useMarketplaceProducts'
import { PassportTimeline } from '@/components/passport/PassportTimeline'
import { BlockchainVerification } from '@/components/verification/BlockchainVerification'
import { FarmerProfile } from '@/components/farmer/FarmerProfile'
import { PurchaseButton } from '@/components/purchase/PurchaseButton'
import { 
  ArrowLeft, 
  Share2, 
  Shield, 
  MapPin, 
  Calendar, 
  Weight, 
  Star,
  ExternalLink,
  QrCode,
  CheckCircle,
  Award
} from 'lucide-react'

export default function PassportPage() {
  const router = useRouter()
  const { batchId } = router.query
  const { product, loading, error } = useMarketplaceProduct(batchId as string)
  const [showVerification, setShowVerification] = useState(false)
  const [showQR, setShowQR] = useState(false)

  if (loading) {
    return (
      <MarketplaceLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading spice passport...</p>
          </div>
        </div>
      </MarketplaceLayout>
    )
  }

  if (error || !product) {
    return (
      <MarketplaceLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🌶️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Passport Not Found</h1>
            <p className="text-gray-600 mb-6">
              {error || 'The spice passport you\'re looking for doesn\'t exist or has been removed.'}
            </p>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Marketplace
            </Link>
          </div>
        </div>
      </MarketplaceLayout>
    )
  }

  return (
    <>
      <Head>
        <title>{product.spiceType} - Batch #{product.batchId} | Spice Platform</title>
        <meta name="description" content={`Authentic ${product.spiceType} from ${product.farmerName} with complete blockchain-verified provenance`} />
        <meta property="og:title" content={`${product.spiceType} - Batch #${product.batchId}`} />
        <meta property="og:description" content={`Authentic Sri Lankan ${product.spiceType} with verified provenance`} />
        <meta property="og:image" content={product.images?.[0]} />
      </Head>

      <MarketplaceLayout>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => router.back()}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {product.spiceType}
                    </h1>
                    <p className="text-gray-600">Batch ID: #{product.batchId}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <QrCode className="h-4 w-4" />
                    QR Code
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Modal */}
          {showQR && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-8 max-w-sm w-full text-center">
                <h3 className="text-lg font-semibold mb-4">Product QR Code</h3>
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                  <div className="w-48 h-48 mx-auto bg-white border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <QrCode className="h-16 w-16 text-gray-400" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Scan to verify this product&apos;s authenticity
                </p>
                <button
                  onClick={() => setShowQR(false)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Product Images */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden mb-4">
                    <Image
                      src={product.images?.[0] || '/api/placeholder/600/400'}
                      alt={product.spiceType}
                      width={600}
                      height={400}
                      className="w-full h-64 object-cover"
                      priority
                    />
                  </div>
                  {product.images && product.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {product.images.slice(1, 5).map((image, index) => (
                        <Image
                          key={index}
                          src={image}
                          alt={`${product.spiceType} ${index + 2}`}
                          width={80}
                          height={64}
                          className="w-full h-16 object-cover rounded cursor-pointer hover:opacity-80"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Details</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Weight className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                      <div className="text-sm text-gray-600">Weight</div>
                      <div className="font-semibold">{product.weight}kg</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <MapPin className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                      <div className="text-sm text-gray-600">Region</div>
                      <div className="font-semibold">{product.region}</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Calendar className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                      <div className="text-sm text-gray-600">Harvest Date</div>
                      <div className="font-semibold">
                        {new Date(product.harvestDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Star className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                      <div className="text-sm text-gray-600">Quality</div>
                      <div className="font-semibold">Premium</div>
                    </div>
                  </div>
                </div>

                {/* Blockchain Verification */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Blockchain Verification</h2>
                    <button
                      onClick={() => setShowVerification(!showVerification)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-green-600 bg-green-50 rounded-lg hover:bg-green-100"
                    >
                      <Shield className="h-4 w-4" />
                      Verify On-Chain
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Blockchain Verified</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600">
                      <Award className="h-4 w-4" />
                      <span>Quality Assured</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-600">
                      <Shield className="h-4 w-4" />
                      <span>Provenance Tracked</span>
                    </div>
                  </div>

                  {showVerification && (
                    <BlockchainVerification 
                      batchId={product.batchId}
                      harvestHash={product.harvestHash}
                      processingHashes={product.processingHashes}
                    />
                  )}
                </div>

                {/* Processing Timeline */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Provenance Timeline</h2>
                  <PassportTimeline 
                    batchId={product.batchId}
                    spiceType={product.spiceType}
                    harvestDate={product.harvestDate}
                    processingSteps={[
                      {
                        id: '1',
                        title: 'Harvest Collection',
                        date: product.harvestDate,
                        description: `Premium ${product.spiceType} harvested from sustainable farms in ${product.region}`,
                        image: product.images?.[0]
                      },
                      {
                        id: '2', 
                        title: 'Initial Processing',
                        date: new Date(new Date(product.harvestDate).getTime() + 86400000),
                        description: 'Careful cleaning and initial processing following traditional methods',
                        image: product.images?.[1]
                      },
                      {
                        id: '3',
                        title: 'Quality Testing',
                        date: new Date(new Date(product.harvestDate).getTime() + 172800000),
                        description: 'Comprehensive quality testing and grading',
                      },
                      {
                        id: '4',
                        title: 'Final Packaging',
                        date: new Date(new Date(product.harvestDate).getTime() + 259200000),
                        description: 'Professional packaging with sealed freshness guarantee',
                        image: product.images?.[2]
                      }
                    ]}
                  />
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Purchase Card */}
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    ${product.price}
                    <span className="text-lg font-normal text-gray-600">/{product.unit}</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    Total: ${(product.price * product.weight).toFixed(2)} for {product.weight}kg
                  </div>
                  
                  <PurchaseButton 
                    product={product}
                    className="w-full mb-4"
                  />
                  
                  <div className="text-xs text-gray-500 text-center">
                    🔒 Secure payment with smart contract escrow
                  </div>
                </div>

                {/* Farmer Profile */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Meet the Farmer</h3>
                  <FarmerProfile 
                    address={product.farmerAddress}
                    name={product.farmerName}
                    image={product.farmerImage}
                    reputationScore={product.reputationScore}
                    badges={product.badges}
                    showProducts={false}
                  />
                  <Link
                    href={`/marketplace/farmers/${product.farmerAddress}`}
                    className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 text-sm font-medium mt-4"
                  >
                    View Farmer Profile
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>

                {/* Trust Indicators */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">Why Trust This Product?</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>Complete blockchain-verified provenance</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>Direct from certified Sri Lankan farmers</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>Traditional processing methods preserved</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>Secure escrow payment protection</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MarketplaceLayout>
    </>
  )
}