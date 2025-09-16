import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  RefreshCw,
  DollarSign,
  BarChart3,
  Calendar,
  Activity
} from 'lucide-react'

interface MarketPrice {
  spiceType: string
  currentPrice: number
  previousPrice: number
  change: number
  changePercentage: number
  volume: number
  lastUpdated: Date
  trend: 'up' | 'down' | 'stable'
  transactions: number
  symbol: string
}

interface MarketPriceTickerProps {
  farmerSpiceTypes?: string[]
  compact?: boolean
  className?: string
}

export const MarketPriceTicker: React.FC<MarketPriceTickerProps> = ({ 
  farmerSpiceTypes = [],
  compact = false,
  className 
}) => {
  const [prices, setPrices] = useState<MarketPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [currentIndex, setCurrentIndex] = useState(0)

  // Generate mock market data based on completed transactions
  const generateMockPrices = (): MarketPrice[] => {
    const spiceTypes = farmerSpiceTypes.length > 0 
      ? farmerSpiceTypes 
      : ['Ceylon Cinnamon', 'Black Pepper', 'Cardamom', 'Cloves', 'Nutmeg']

    return spiceTypes.map(spiceType => {
      const basePrice = {
        'Ceylon Cinnamon': 45,
        'Black Pepper': 32,
        'Cardamom': 78,
        'Cloves': 56,
        'Nutmeg': 67,
        'Vanilla': 120,
        'Star Anise': 89,
        'Turmeric': 28
      }[spiceType] || 35

      // Calculate average of last 10 transactions (simulated)
      const transactions = Math.floor(Math.random() * 15) + 5 // 5-20 transactions
      const variance = (Math.random() - 0.5) * 0.2 // ±10% variance
      const currentPrice = basePrice * (1 + variance)
      const previousPrice = basePrice * (1 + (Math.random() - 0.5) * 0.15)
      const change = currentPrice - previousPrice
      const changePercentage = (change / previousPrice) * 100
      
      return {
        spiceType,
        currentPrice: Number(currentPrice.toFixed(2)),
        previousPrice: Number(previousPrice.toFixed(2)),
        change: Number(change.toFixed(2)),
        changePercentage: Number(changePercentage.toFixed(1)),
        volume: Math.floor(Math.random() * 500) + 50,
        lastUpdated: new Date(Date.now() - Math.random() * 3600000), // Within last hour
        trend: change > 1 ? 'up' : change < -1 ? 'down' : 'stable',
        transactions,
        symbol: spiceType.replace(/\s+/g, '').slice(0, 3).toUpperCase()
      }
    })
  }

  useEffect(() => {
    const loadPrices = async () => {
      setLoading(true)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setPrices(generateMockPrices())
      setLastRefresh(new Date())
      setLoading(false)
    }

    loadPrices()

    // Auto-refresh every 5 minutes as per requirements
    const interval = setInterval(loadPrices, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [farmerSpiceTypes])

  // Cycle through prices for compact display
  useEffect(() => {
    if (compact && prices.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % prices.length)
      }, 4000) // Change every 4 seconds
      return () => clearInterval(interval)
    }
  }, [compact, prices.length])

  const handleRefresh = () => {
    setPrices(generateMockPrices())
    setLastRefresh(new Date())
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'stable': return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      case 'stable': return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${compact ? 'p-4' : 'p-6'} ${className || ''}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Market Prices</h3>
          </div>
          <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (compact) {
    const currentPrice = prices[currentIndex] || prices[0]
    if (!currentPrice) return null

    return (
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-4 ${className || ''}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <h4 className="text-sm font-medium text-gray-900">Live Market</h4>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Refresh prices"
            >
              <RefreshCw className="h-3 w-3" />
            </button>
            {prices.length > 1 && (
              <div className="flex gap-1">
                {prices.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 w-1.5 rounded-full transition-colors ${
                      index === currentIndex ? 'bg-orange-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {currentPrice.spiceType}
            </p>
            <p className="text-xs text-gray-500">
              Avg of {currentPrice.transactions} transactions
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-gray-900">
              ${currentPrice.currentPrice}
            </p>
            <div className={`flex items-center gap-1 text-sm ${getTrendColor(currentPrice.trend)}`}>
              {getTrendIcon(currentPrice.trend)}
              <span>
                {currentPrice.change > 0 ? '+' : ''}${currentPrice.change}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Per kg</span>
            <span>Last 24h</span>
          </div>
        </div>
      </div>
    )
  }

  // Full table view
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-6 ${className || ''}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6 text-orange-600" />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Market Prices</h3>
            <p className="text-sm text-gray-600">
              Average prices from last 10 completed transactions
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right text-xs text-gray-500">
            <div>Auto-updates</div>
            <div>{lastRefresh.toLocaleTimeString()}</div>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors border border-gray-200 rounded-lg hover:bg-gray-50"
            title="Refresh prices"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Spice Type</th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-700">Avg Price</th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-700">Change</th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-700">Volume</th>
              <th className="text-center py-3 px-2 text-sm font-medium text-gray-700">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {prices.map(price => (
              <tr key={price.spiceType} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-2">
                  <div>
                    <div className="font-medium text-gray-900">{price.spiceType}</div>
                    <div className="text-sm text-gray-500">
                      {price.transactions} transactions
                    </div>
                  </div>
                </td>
                
                <td className="py-4 px-2 text-right">
                  <div className="font-bold text-gray-900">${price.currentPrice}</div>
                  <div className="text-sm text-gray-500">per kg</div>
                </td>
                
                <td className="py-4 px-2 text-right">
                  <div className={`font-medium ${getTrendColor(price.trend)}`}>
                    {price.change > 0 ? '+' : ''}${price.change}
                  </div>
                  <div className={`text-sm ${getTrendColor(price.trend)}`}>
                    ({price.changePercentage > 0 ? '+' : ''}{price.changePercentage}%)
                  </div>
                </td>
                
                <td className="py-4 px-2 text-right">
                  <div className="text-gray-900">{price.volume} kg</div>
                  <div className="text-sm text-gray-500">24h volume</div>
                </td>
                
                <td className="py-4 px-2 text-center">
                  {getTrendIcon(price.trend)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {prices.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p>No market data available</p>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Prices calculated from completed escrow transactions</span>
          </div>
          <div>
            Auto-refreshes every 5 minutes
          </div>
        </div>
      </div>
    </div>
  )
}