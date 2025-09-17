import React, { useMemo } from 'react'
import { MarketPriceTicker } from './MarketPriceTicker'
import { LogHarvestButton } from './LogHarvestButton'
import { useFarmerDashboard } from '@/hooks/useFarmerDashboard'
import { useMyProducts } from '@/hooks/useMyProducts'
// import { SealForSaleButton } from '@/components/finalization/SealForSaleButton'
// import { useAuth } from '@/hooks/useAuth'
// import { useWallet } from '@/hooks/useWallet'
import { Package, Users, Star, TrendingUp, Lock, CheckCircle, ArrowRight, Calendar, Activity, Eye, Bell, Cloud, Sun, CloudRain, Wind } from 'lucide-react'
import { useRouter } from 'next/router'

interface DashboardStatProps {
  title: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

const DashboardStat: React.FC<DashboardStatProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend 
}) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-soft hover:shadow-medium transition-all duration-300 p-6 group transform hover:-translate-y-1">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-600 mb-2">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mb-1 group-hover:text-spice-green transition-colors">{value}</p>
        <p className="text-sm text-gray-500">{description}</p>
        {trend && (
          <div className={`flex items-center gap-1.5 mt-3 text-sm font-medium ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`h-4 w-4 ${trend.isPositive ? '' : 'rotate-180'}`} />
            <span>{trend.isPositive ? '+' : ''}{trend.value}% from last month</span>
          </div>
        )}
      </div>
      <div className="h-16 w-16 bg-gradient-to-br from-spice-green/10 to-spice-cinnamon/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <Icon className="h-8 w-8 text-spice-green group-hover:text-spice-green-dark transition-colors" />
      </div>
    </div>
  </div>
)

interface DashboardMainProps {
  className?: string
}

export const DashboardMain: React.FC<DashboardMainProps> = ({ className }) => {
  const { profile, stats } = useFarmerDashboard()
  const { passports } = useMyProducts()
  // const { currentAddress } = useAuth()
  // const { walletClient } = useWallet()
  const router = useRouter()

  // Calculate sealing metrics
  const sealingMetrics = useMemo(() => {
    const inProgress = passports.filter(p => p.statusText === 'In Progress')
    const sealed = passports.filter(p => p.statusText === 'Locked')
    const readyToSeal = inProgress.filter(p => p.processingStepCount > 0)
    
    return {
      totalProducts: passports.length,
      inProgress: inProgress.length,
      sealed: sealed.length,
      readyToSeal: readyToSeal.length,
      readyProducts: readyToSeal.slice(0, 3) // Show top 3
    }
  }, [passports])

  const dashboardStats = [
    {
      title: 'Total Products',
      value: sealingMetrics.totalProducts.toString(),
      icon: Package,
      description: `${sealingMetrics.inProgress} in progress, ${sealingMetrics.sealed} sealed`,
      trend: { value: 12, isPositive: true }
    },
    {
      title: 'Ready to Seal',
      value: sealingMetrics.readyToSeal.toString(),
      icon: Lock,
      description: 'Products ready for marketplace',
      trend: sealingMetrics.readyToSeal > 0 ? { value: 100, isPositive: true } : undefined
    },
    {
      title: 'Reputation Score',
      value: stats?.reputationScore.toFixed(1) || '0.0',
      icon: Star,
      description: 'Out of 5.0 stars'
    },
    {
      title: 'Community Standing',
      value: stats?.communityRank || 'Loading...',
      icon: Users,
      description: 'Verified farmer status'
    }
  ]

  const userName = profile?.name?.split(' ')[0] || "Farmer"

  return (
    <main className={`flex-1 p-8 bg-gradient-to-br from-gray-50 to-white min-h-screen ${className || ''}`}>
      {/* Welcome Header */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-12 w-12 bg-gradient-to-br from-spice-green to-spice-cinnamon rounded-xl flex items-center justify-center animate-bounce-gentle">
            <span className="text-2xl">🌶️</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 animate-fade-in-up">
              Welcome back, {userName}!
            </h1>
            <p className="text-lg text-gray-600 mt-1 animate-slide-in-left">
              Here&apos;s what&apos;s happening with your spice farming business today.
            </p>
          </div>
        </div>
      </div>

      {/* Market Price Ticker */}
      <div className="mb-8 animate-fade-in">
        <MarketPriceTicker />
      </div>

      {/* Quick Actions Panel */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-yellow-500 rounded-full"></div>
          <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => router.push('/harvest/log-new')}
            className="bg-white p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200 group"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-sm font-medium text-gray-900">Log Harvest</div>
              <div className="text-xs text-gray-500 mt-1">Create passport</div>
            </div>
          </button>

          <button
            onClick={() => router.push('/products')}
            className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-sm font-medium text-gray-900">View Products</div>
              <div className="text-xs text-gray-500 mt-1">Manage inventory</div>
            </div>
          </button>

          <button
            onClick={() => router.push('/marketplace')}
            className="bg-white p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200 transition-colors">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-sm font-medium text-gray-900">Marketplace</div>
              <div className="text-xs text-gray-500 mt-1">Browse & sell</div>
            </div>
          </button>

          <button
            onClick={() => router.push('/dashboard/analytics')}
            className="bg-white p-4 rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-200 group"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-200 transition-colors">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-sm font-medium text-gray-900">Analytics</div>
              <div className="text-xs text-gray-500 mt-1">View insights</div>
            </div>
          </button>
        </div>
      </div>

      {/* Grid Layout for Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Primary Call to Action */}
        <div className="lg:col-span-2">
          <LogHarvestButton />
        </div>

        {/* Weather Widget */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-900">Today's Weather</h3>
            <Sun className="h-6 w-6 text-yellow-500" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-blue-900">28°C</span>
              <div className="text-right">
                <div className="text-blue-700 font-medium">Partly Cloudy</div>
                <div className="text-blue-600 text-sm">Perfect for farming</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-blue-200">
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-700">12 km/h</span>
              </div>
              <div className="flex items-center gap-2">
                <CloudRain className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-700">20%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-gradient-to-b from-spice-green to-spice-cinnamon rounded-full"></div>
          <h2 className="text-2xl font-bold text-gray-900">
            Your Dashboard Overview
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardStats.map((stat, index) => (
            <div key={index} className="animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
              <DashboardStat
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                description={stat.description}
                trend={stat.trend}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Products Showcase */}
      {passports.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-900">Recent Products</h2>
            </div>
            <button
              onClick={() => router.push('/products')}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
            >
              View All <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {passports.slice(0, 3).map((passport) => (
              <div
                key={passport.batchId}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
                onClick={() => router.push(`/products/view/${passport.batchId}`)}
              >
                <div className="h-48 bg-gradient-to-br from-green-100 to-yellow-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                      <Package className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="text-lg font-bold text-gray-700">{passport.spiceType}</div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold text-gray-900">
                      Batch #{passport.batchId}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      passport.statusText === 'Locked'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {passport.statusText}
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 mb-3">
                    Weight: {passport.weightInKg}kg
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{passport.processingStepCount} processing steps</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ready to Seal Section */}
      {sealingMetrics.readyToSeal > 0 && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  🚀 Ready to Seal & List
                </h3>
                <p className="text-green-700 text-sm">
                  {sealingMetrics.readyToSeal} product{sealingMetrics.readyToSeal !== 1 ? 's' : ''} ready for marketplace listing
                </p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            
            <div className="grid gap-3">
              {sealingMetrics.readyProducts.map(passport => (
                <div key={passport.batchId} className="flex items-center justify-between bg-white rounded-lg p-3 border border-green-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Package className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Batch #{passport.batchId} - {passport.spiceType}</div>
                      <div className="text-sm text-gray-600">
                        {passport.processingStepCount} step{passport.processingStepCount !== 1 ? 's' : ''} • 
                        {passport.weightInKg}kg • 
                        Ready to seal
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/products/edit/${passport.batchId}?section=finalize`)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Lock className="h-4 w-4" />
                    Seal Now
                  </button>
                </div>
              ))}
              
              {sealingMetrics.readyToSeal > 3 && (
                <button
                  onClick={() => router.push('/products?filter=ready')}
                  className="flex items-center justify-center gap-2 text-green-700 hover:text-green-800 text-sm font-medium py-2"
                >
                  View all {sealingMetrics.readyToSeal - 3} more products
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity and Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <button
              onClick={() => router.push('/activity')}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              View All
            </button>
          </div>

          <div className="space-y-4">
            {passports.slice(0, 3).map((passport, index) => (
              <div key={passport.batchId} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Package className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {passport.spiceType} harvest logged
                  </p>
                  <p className="text-xs text-gray-500">
                    Batch #{passport.batchId} • {passport.weightInKg}kg
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  passport.statusText === 'Locked'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {passport.statusText}
                </div>
              </div>
            ))}

            {passports.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm">No recent activity</p>
                <p className="text-xs">Start by logging your first harvest</p>
              </div>
            )}
          </div>
        </div>

        {/* Notifications & Alerts */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            </div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          </div>

          <div className="space-y-4">
            {sealingMetrics.readyToSeal > 0 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900">
                    Products Ready to Seal
                  </p>
                  <p className="text-xs text-green-700">
                    {sealingMetrics.readyToSeal} product{sealingMetrics.readyToSeal !== 1 ? 's' : ''} ready for marketplace
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Market Update
                </p>
                <p className="text-xs text-blue-700">
                  Ceylon Cinnamon prices up 12% this week
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <Star className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-purple-900">
                  Reputation Milestone
                </p>
                <p className="text-xs text-purple-700">
                  You're close to reaching 4.5 stars! Keep up the great work.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">
            {sealingMetrics.totalProducts === 0 ? 'Getting Started' : 'Your Journey'}
          </h3>
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-500">Progress:</div>
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(((sealingMetrics.totalProducts > 0 ? 1 : 0) + (sealingMetrics.sealed > 0 ? 1 : 0)) / 3 * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
              sealingMetrics.totalProducts > 0 ? 'bg-[#2e6a4f]' : 'bg-[#2e6a4f]'
            }`}>
              <span className="text-white text-sm font-bold">
                {sealingMetrics.totalProducts > 0 ? '✓' : '1'}
              </span>
            </div>
            <div>
              <h4 className={`font-medium ${
                sealingMetrics.totalProducts > 0 ? 'text-slate-600' : 'text-slate-900'
              }`}>
                Create Your First Spice Passport
                {sealingMetrics.totalProducts > 0 && <span className="text-green-600 ml-2">✓ Done</span>}
              </h4>
              <p className="text-sm text-slate-600">
                {sealingMetrics.totalProducts > 0 
                  ? `You have ${sealingMetrics.totalProducts} product${sealingMetrics.totalProducts !== 1 ? 's' : ''} documented.`
                  : 'Document your harvest with photos, location, and quality details to build trust with buyers.'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
              sealingMetrics.sealed > 0 ? 'bg-[#2e6a4f]' : 
              sealingMetrics.readyToSeal > 0 ? 'bg-yellow-500' : 'bg-slate-300'
            }`}>
              <span className={`text-sm font-bold ${
                sealingMetrics.sealed > 0 ? 'text-white' :
                sealingMetrics.readyToSeal > 0 ? 'text-white' : 'text-slate-600'
              }`}>
                {sealingMetrics.sealed > 0 ? '✓' : '2'}
              </span>
            </div>
            <div>
              <h4 className={`font-medium ${
                sealingMetrics.sealed > 0 ? 'text-slate-600' :
                sealingMetrics.readyToSeal > 0 ? 'text-yellow-700' : 'text-slate-600'
              }`}>
                Seal Products for Marketplace
                {sealingMetrics.sealed > 0 && <span className="text-green-600 ml-2">✓ Done</span>}
                {sealingMetrics.readyToSeal > 0 && sealingMetrics.sealed === 0 && (
                  <span className="text-yellow-600 ml-2">⏳ Ready</span>
                )}
              </h4>
              <p className="text-sm text-slate-600">
                {sealingMetrics.sealed > 0 
                  ? `${sealingMetrics.sealed} product${sealingMetrics.sealed !== 1 ? 's' : ''} sealed and ready for buyers.`
                  : sealingMetrics.readyToSeal > 0
                  ? `${sealingMetrics.readyToSeal} product${sealingMetrics.readyToSeal !== 1 ? 's' : ''} ready to seal for marketplace.`
                  : 'Seal your products to make them immutable and ready for global buyers.'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 bg-slate-300 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-slate-600 text-sm font-bold">3</span>
            </div>
            <div>
              <h4 className="font-medium text-slate-600">Build Your Reputation</h4>
              <p className="text-sm text-slate-500">
                Complete transactions and earn reviews to increase your reputation score. (Coming Soon)
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}