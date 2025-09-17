import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAccount } from 'wagmi';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Star,
  MapPin,
  ShoppingCart,
  Leaf,
  Shield,
  Calendar,
  Package,
  Truck,
  Award,
  Heart,
  Share2,
  CheckCircle
} from 'lucide-react';

export default function ProductDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { isConnected } = useAccount();
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Mock product data - in real app, this would come from API/blockchain
  const product = {
    id: '1',
    name: 'Ceylon True Cinnamon',
    category: 'cinnamon',
    description: 'Premium grade Ceylon cinnamon with delicate sweet flavor, hand-harvested from Kandy highlands. This authentic Ceylon cinnamon is known for its thin bark, sweet aroma, and complex flavor profile that sets it apart from regular cassia cinnamon.',
    longDescription: 'Our Ceylon True Cinnamon is sourced directly from family-owned plantations in the Kandy highlands of Sri Lanka. The bark is hand-peeled and sun-dried using traditional methods passed down through generations. This results in the characteristic thin, papery texture and sweet, delicate flavor that makes Ceylon cinnamon the world\'s finest.',
    price: 24.99,
    unit: '100g',
    rating: 4.9,
    reviews: 127,
    farmer: {
      name: 'Ranjan Perera',
      location: 'Kandy, Sri Lanka',
      verified: true,
      farmSize: '12 acres',
      experience: '25 years',
      bio: 'Third-generation cinnamon farmer with expertise in traditional harvesting methods.'
    },
    images: ['🌿', '🍂', '🌳', '📦'],
    inStock: 45,
    organic: true,
    featured: true,
    blockchain: {
      harvestDate: '2024-08-15',
      certifications: ['Organic', 'Fair Trade', 'Quality Assured'],
      traceabilityHash: '0x1a2b3c4d5e6f...',
      batchNumber: 'CN-2024-08-001',
      processingDate: '2024-08-18',
      qualityScore: 95
    },
    shipping: {
      weight: '100g',
      dimensions: '15cm x 10cm x 5cm',
      freeShipping: true,
      estimatedDelivery: '3-5 business days'
    },
    nutritionalInfo: {
      calories: 247,
      carbs: 50.6,
      fiber: 53.1,
      sugar: 2.2,
      protein: 4.0,
      fat: 1.2
    }
  };

  const handleAddToCart = () => {
    if (!isConnected) {
      // Handle wallet connection
      return;
    }
    console.log('Adding to cart:', { product, quantity });
  };

  const handleBuyNow = () => {
    if (!isConnected) {
      // Handle wallet connection
      return;
    }
    console.log('Buy now:', { product, quantity });
  };

  return (
    <>
      <Head>
        <title>{product.name} - Spice Platform</title>
        <meta name="description" content={product.description} />
      </Head>

      <Header />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Back Button */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Marketplace</span>
            </Button>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">

            {/* Product Images */}
            <div className="space-y-4">
              <Card>
                <CardContent className="p-8">
                  <div className="text-center">
                    <div className="text-8xl mb-4">{product.images[activeImageIndex]}</div>
                    <div className="flex justify-center space-x-2">
                      {product.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveImageIndex(index)}
                          className={`p-2 border-2 rounded-lg transition-colors ${
                            activeImageIndex === index
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-2xl">{image}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Blockchain Verification */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span>Blockchain Verified</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Batch Number:</span>
                      <p className="text-gray-600 font-mono">{product.blockchain.batchNumber}</p>
                    </div>
                    <div>
                      <span className="font-medium">Harvest Date:</span>
                      <p className="text-gray-600">{new Date(product.blockchain.harvestDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium">Quality Score:</span>
                      <p className="text-gray-600">{product.blockchain.qualityScore}/100</p>
                    </div>
                    <div>
                      <span className="font-medium">Hash:</span>
                      <p className="text-gray-600 font-mono text-xs">{product.blockchain.traceabilityHash}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {product.blockchain.certifications.map((cert) => (
                      <Badge key={cert} variant="secondary" className="text-xs">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Product Details */}
            <div className="space-y-6">

              {/* Header */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="font-medium">{product.rating}</span>
                        <span className="text-gray-500">({product.reviews} reviews)</span>
                      </div>
                      {product.featured && (
                        <Badge className="bg-amber-500">Featured</Badge>
                      )}
                      {product.organic && (
                        <Badge variant="secondary">Organic</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="text-4xl font-bold text-gray-900 mb-2">
                  ${product.price}
                  <span className="text-lg font-normal text-gray-500 ml-2">per {product.unit}</span>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-green-600 font-medium">{product.inStock} in stock</span>
                  <span className="text-gray-500">• Ready to ship</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed mb-4">{product.description}</p>
                <p className="text-gray-600 leading-relaxed">{product.longDescription}</p>
              </div>

              {/* Farmer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Leaf className="w-5 h-5 text-green-600" />
                    <span>About the Farmer</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Leaf className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{product.farmer.name}</h4>
                        {product.farmer.verified && (
                          <Shield className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                        <MapPin className="w-3 h-3" />
                        <span>{product.farmer.location}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{product.farmer.bio}</p>
                      <div className="flex space-x-4 text-xs text-gray-500">
                        <span>Farm: {product.farmer.farmSize}</span>
                        <span>Experience: {product.farmer.experience}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Purchase Section */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Quantity</label>
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                          -
                        </Button>
                        <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setQuantity(Math.min(product.inStock, quantity + 1))}
                        >
                          +
                        </Button>
                        <span className="text-sm text-gray-500 ml-4">
                          Total: ${(product.price * quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        onClick={handleAddToCart}
                        className="flex items-center justify-center space-x-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </Button>
                      <Button
                        onClick={handleBuyNow}
                        className="flex items-center justify-center space-x-2"
                      >
                        <Package className="w-4 h-4" />
                        <span>Buy Now</span>
                      </Button>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Truck className="w-4 h-4" />
                      <span>Free shipping • Estimated delivery: {product.shipping.estimatedDelivery}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Shipping Info</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <div>Weight: {product.shipping.weight}</div>
                    <div>Dimensions: {product.shipping.dimensions}</div>
                    <div className="text-green-600 font-medium">✓ Free shipping</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Nutrition (per 100g)</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <div>Calories: {product.nutritionalInfo.calories}</div>
                    <div>Fiber: {product.nutritionalInfo.fiber}g</div>
                    <div>Protein: {product.nutritionalInfo.protein}g</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}