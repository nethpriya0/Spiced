import React, { useMemo } from 'react'
import { type MarketplaceProduct } from '@/types/marketplace'
import { TrendingUp, Users, Package, Clock } from 'lucide-react'

interface MarketplaceStatsProps {
  products: MarketplaceProduct[]
}

export const MarketplaceStats: React.FC<MarketplaceStatsProps> = ({ products }) => {
  const stats = useMemo(() => {
    const uniqueFarmers = new Set(products.map(p => p.farmerAddress)).size
    const uniqueSpiceTypes = new Set(products.map(p => p.spiceType)).size
    
    // Calculate recent additions (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentProducts = products.filter(p => 
      new Date(p.sealedAt) > thirtyDaysAgo
    ).length

    // Calculate average batch size
    const avgBatchSize = products.length > 0 
      ? products.reduce((sum, p) => sum + p.weight, 0) / products.length
      : 0

    return {
      totalProducts: products.length,
      uniqueFarmers,
      uniqueSpiceTypes,
      recentProducts,
      avgBatchSize: Math.round(avgBatchSize * 10) / 10
    }
  }, [products])

  if (products.length === 0) {
    return null
  }

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Total Products */}
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-orange-100 rounded-lg">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stats.totalProducts}
            </div>
            <div className="text-sm text-gray-600">
              Premium Products Available
            </div>
          </div>

          {/* Unique Farmers */}
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stats.uniqueFarmers}
            </div>
            <div className="text-sm text-gray-600">
              Verified Farmers
            </div>
          </div>

          {/* Spice Varieties */}
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stats.uniqueSpiceTypes}
            </div>
            <div className="text-sm text-gray-600">
              Spice Varieties
            </div>
          </div>

          {/* Recent Additions */}
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stats.recentProducts}
            </div>
            <div className="text-sm text-gray-600">
              Added This Month
            </div>
          </div>
        </div>

        {/* Additional Stats Bar */}
        <div className="mt-8 pt-8 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Average batch size: {stats.avgBatchSize} kg</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>100% blockchain verified</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Direct from Sri Lankan farms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MarketplaceStats