import { Users, CheckCircle, Clock } from 'lucide-react'

interface AdminStatsProps {
  stats: {
    totalFarmers: number
    verifiedFarmers: number
    pendingFarmers: number
  }
}

export function AdminStats({ stats }: AdminStatsProps) {
  const statCards = [
    {
      name: 'Total Farmers',
      value: stats.totalFarmers,
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-900'
    },
    {
      name: 'Verified Farmers',
      value: stats.verifiedFarmers,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      textColor: 'text-green-900'
    },
    {
      name: 'Pending Verification',
      value: stats.pendingFarmers,
      icon: Clock,
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      textColor: 'text-orange-900'
    }
  ]

  const verificationRate = stats.totalFarmers > 0 
    ? ((stats.verifiedFarmers / stats.totalFarmers) * 100).toFixed(1)
    : '0'

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
      {statCards.map((stat) => (
        <div key={stat.name} className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className={`text-2xl font-semibold ${stat.textColor}`}>
                      {stat.value}
                    </div>
                    {stat.name === 'Verified Farmers' && stats.totalFarmers > 0 && (
                      <div className="ml-2 flex items-baseline text-sm">
                        <span className="text-gray-500">({verificationRate}%)</span>
                      </div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          
          {/* Progress bar for verification rate */}
          {stat.name === 'Verified Farmers' && stats.totalFarmers > 0 && (
            <div className="bg-gray-50 px-5 py-3">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Verification Progress</span>
                <span>{verificationRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${verificationRate}%` }}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}