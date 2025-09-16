import React from 'react'
import { MarketplaceProductCard } from './MarketplaceProductCard'
import { type MarketplaceProduct } from '@/types/marketplace'
import { Package, Loader2 } from 'lucide-react'

interface MarketplaceProductGridProps {
  products: MarketplaceProduct[]
  loading: boolean
  emptyMessage?: string
}

export const MarketplaceProductGrid: React.FC<MarketplaceProductGridProps> = ({
  products,
  loading,
  emptyMessage = "No products available"
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading authentic spices...</p>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-500 max-w-md mx-auto">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Authentic Sri Lankan Spices
        </h2>
        <p className="text-sm text-gray-500">
          {products.length} product{products.length !== 1 ? 's' : ''} available
        </p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <MarketplaceProductCard
            key={`${product.batchId}-${product.farmerAddress}`}
            product={product}
          />
        ))}
      </div>

      {/* Load More Section - Future Implementation */}
      {products.length >= 20 && (
        <div className="text-center pt-8">
          <button
            disabled
            className="px-6 py-3 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed"
          >
            Load More Products (Coming Soon)
          </button>
        </div>
      )}
    </div>
  )
}

export default MarketplaceProductGrid