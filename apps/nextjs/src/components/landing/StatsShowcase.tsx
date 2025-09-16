import React from 'react'
import { Users, Package, Shield, TrendingUp, Leaf, Award } from 'lucide-react'
import { DEMO_STATS } from '@/data/demoData'

export const StatsShowcase: React.FC = () => {
  const stats = [
    {
      icon: Users,
      value: DEMO_STATS.totalFarmers.toLocaleString(),
      label: "Verified Farmers",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: Package,
      value: DEMO_STATS.totalProducts.toLocaleString(),
      label: "Products Listed",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      icon: Shield,
      value: DEMO_STATS.verifiedBatches.toLocaleString(),
      label: "Blockchain Verified",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: TrendingUp,
      value: `+${DEMO_STATS.avgFarmerIncome}%`,
      label: "Farmer Income Increase",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      icon: Leaf,
      value: `${DEMO_STATS.co2Saved}t`,
      label: "CO₂ Saved Monthly",
      color: "text-green-700",
      bgColor: "bg-green-50"
    },
    {
      icon: Award,
      value: `${DEMO_STATS.biodiversityScore}/10`,
      label: "Biodiversity Score",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ]

  return (
    <section className="py-16 bg-gradient-to-r from-orange-50 via-yellow-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Impact by the Numbers
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real farmers, real impact, real transparency. See how our blockchain-verified platform
            is transforming the global spice trade.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300 text-center group"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${stat.bgColor} ${stat.color} mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            )
          })}
        </div>

        {/* Additional impact metrics */}
        <div className="mt-12 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {DEMO_STATS.waterSaved.toLocaleString()}L
              </div>
              <div className="text-gray-600">Water saved per kg of spice</div>
              <div className="text-sm text-gray-500 mt-1">
                Through sustainable farming practices
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                24/7
              </div>
              <div className="text-gray-600">Blockchain verification</div>
              <div className="text-sm text-gray-500 mt-1">
                Immutable provenance tracking
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                100%
              </div>
              <div className="text-gray-600">Transparent supply chain</div>
              <div className="text-sm text-gray-500 mt-1">
                From farm to your kitchen
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default StatsShowcase