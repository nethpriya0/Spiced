import React, { useMemo } from 'react'
import { MarketPriceTicker } from './MarketPriceTicker'
import { LogHarvestButton } from './LogHarvestButton'
import { useFarmerDashboard } from '@/hooks/useFarmerDashboard'
import { useMyProducts } from '@/hooks/useMyProducts'
// import { SealForSaleButton } from '@/components/finalization/SealForSaleButton'
// import { useAuth } from '@/hooks/useAuth'
// import { useWallet } from '@/hooks/useWallet'
import { Package, Users, Star, TrendingUp, Lock, CheckCircle, ArrowRight } from 'lucide-react'
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

      {/* Primary Call to Action */}
      <div className="mb-10 animate-slide-in-up">
        <LogHarvestButton />
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

      {/* Getting Started Section */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          {sealingMetrics.totalProducts === 0 ? 'Getting Started' : 'Your Journey'}
        </h3>
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