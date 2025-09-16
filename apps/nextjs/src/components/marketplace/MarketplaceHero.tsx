import React from 'react'
import { Shield, Award, Package } from 'lucide-react'

interface MarketplaceHeroProps {
  totalProducts: number
  featuredSpices: string[]
}

export const MarketplaceHero: React.FC<MarketplaceHeroProps> = ({
  totalProducts,
  featuredSpices
}) => {
  return (
    <div className="bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Authentic Sri Lankan Spices
            <span className="block text-orange-600 mt-2">With Verified Provenance</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
            Discover premium spices directly from verified Sri Lankan farmers. 
            Every product comes with complete blockchain-verified traceability from farm to your table.
          </p>

          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {totalProducts}+
              </div>
              <div className="text-sm text-gray-600">Premium Products</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
              <div className="text-sm text-gray-600">Blockchain Verified</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-sm text-gray-600">Trusted Farmers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">24h</div>
              <div className="text-sm text-gray-600">Farm Fresh</div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 mb-8">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Blockchain Verified</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <Award className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Ceylon Authentic</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <Package className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-700">Direct from Farm</span>
            </div>
          </div>

          {/* Featured Spices */}
          {featuredSpices.length > 0 && (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">Featured Spices:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {featuredSpices.map((spice) => (
                  <span
                    key={spice}
                    className="px-3 py-1 bg-white text-orange-700 text-sm font-medium rounded-full shadow-sm"
                  >
                    {spice}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MarketplaceHero