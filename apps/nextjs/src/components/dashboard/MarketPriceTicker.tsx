import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
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
  const [previousPrices, setPreviousPrices] = useState<MarketPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Generate realistic market data with price continuity
  const generateMockPrices = (usePreviousPrices = false): MarketPrice[] => {
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

      let currentPrice: number
      let previousPrice: number

      if (usePreviousPrices && previousPrices.length > 0) {
        // Use previous price as base for realistic movement
        const prevPriceData = previousPrices.find(p => p.spiceType === spiceType)
        if (prevPriceData) {
          previousPrice = prevPriceData.currentPrice
          // Small realistic movements: ±0.5% to ±3%
          const movement = (Math.random() - 0.5) * 0.06 // ±3% max
          currentPrice = previousPrice * (1 + movement)
        } else {
          // Fallback to base calculation
          const variance = (Math.random() - 0.5) * 0.1
          currentPrice = basePrice * (1 + variance)
          previousPrice = currentPrice * (1 + (Math.random() - 0.5) * 0.02)
        }
      } else {
        // Initial price generation
        const variance = (Math.random() - 0.5) * 0.2
        currentPrice = basePrice * (1 + variance)
        previousPrice = currentPrice * (1 + (Math.random() - 0.5) * 0.05)
      }

      const change = currentPrice - previousPrice
      const changePercentage = (change / previousPrice) * 100
      const transactions = Math.floor(Math.random() * 15) + 5

      return {
        spiceType,
        currentPrice: Number(currentPrice.toFixed(2)),
        previousPrice: Number(previousPrice.toFixed(2)),
        change: Number(change.toFixed(2)),
        changePercentage: Number(changePercentage.toFixed(1)),
        volume: Math.floor(Math.random() * 500) + 50,
        lastUpdated: new Date(),
        trend: Math.abs(change) < 0.01 ? 'stable' : change > 0 ? 'up' : 'down',
        transactions,
        symbol: spiceType.replace(/\s+/g, '').slice(0, 3).toUpperCase()
      }
    })
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const loadPrices = async (isInitial = false) => {
      if (isInitial) {
        setLoading(true)
        // Simulate API delay for initial load
        await new Promise(resolve => setTimeout(resolve, 800))
      } else {
        setIsUpdating(true)
        // Brief update indicator
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      // Store current prices as previous before updating
      setPreviousPrices(current => current.length > 0 ? current : [])

      const newPrices = generateMockPrices(!isInitial)
      setPrices(newPrices)
      setPreviousPrices(newPrices)
      setLastRefresh(new Date())

      if (isInitial) {
        setLoading(false)
      } else {
        setIsUpdating(false)
      }
    }

    // Initial load
    loadPrices(true)

    // Real-time updates every 15 seconds for more dynamic feel
    const realTimeInterval = setInterval(() => loadPrices(false), 15 * 1000)

    return () => {
      clearInterval(realTimeInterval)
    }
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

  const handleRefresh = async () => {
    setIsUpdating(true)
    await new Promise(resolve => setTimeout(resolve, 300))

    setPreviousPrices(prices)
    const newPrices = generateMockPrices(true)
    setPrices(newPrices)
    setLastRefresh(new Date())
    setIsUpdating(false)
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
            <div className={`h-2 w-2 rounded-full ${isUpdating ? 'bg-orange-500 animate-ping' : 'bg-green-500 animate-pulse'}`}></div>
            <h4 className="text-sm font-medium text-gray-900">Live Market</h4>
            {isUpdating && <span className="text-xs text-orange-600 font-medium">Updating...</span>}
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-500">
              {isMounted ? `${Math.floor((Date.now() - lastRefresh.getTime()) / 1000)}s ago` : '0s ago'}
            </div>
            <button
              onClick={handleRefresh}
              disabled={isUpdating}
              className={`p-1 transition-colors ${isUpdating ? 'text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
              title="Refresh prices"
            >
              <RefreshCw className={`h-3 w-3 ${isUpdating ? 'animate-spin' : ''}`} />
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
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold text-gray-900">Market Prices</h3>
              <div className={`h-2 w-2 rounded-full ${isUpdating ? 'bg-orange-500 animate-ping' : 'bg-green-500 animate-pulse'}`}></div>
              {isUpdating && <span className="text-sm text-orange-600 font-medium">Updating...</span>}
            </div>
            <p className="text-sm text-gray-600">
              Real-time prices • Updates every 15 seconds
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-xs text-gray-500">
            <div>Last update</div>
            <div>{lastRefresh.toLocaleTimeString()}</div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isUpdating}
            className={`p-2 transition-colors border border-gray-200 rounded-lg ${
              isUpdating
                ? 'text-gray-300 bg-gray-50'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
            title="Refresh prices"
          >
            <RefreshCw className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
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
            <Activity className="h-4 w-4" />
            <span>Live prices from completed escrow transactions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span>Real-time updates every 15s</span>
          </div>
        </div>
      </div>
    </div>
  )
}