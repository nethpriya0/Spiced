import React from 'react'
import { Star, Award, MapPin, Calendar, Verified, Users } from 'lucide-react'

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earnedDate: Date | string
}

interface FarmerProfileProps {
  address: string
  name: string
  image?: string
  reputationScore?: number
  badges?: Badge[]
  location?: string
  joinDate?: Date | string
  totalProducts?: number
  completedOrders?: number
  showProducts?: boolean
  compact?: boolean
}

export const FarmerProfile: React.FC<FarmerProfileProps> = ({
  address,
  name,
  image,
  reputationScore = 4.8,
  badges = [],
  location = 'Kandy District, Sri Lanka',
  joinDate = '2023-01-15',
  totalProducts = 12,
  completedOrders = 47,
  showProducts = true,
  compact = false
}) => {
  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    })
  }

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : i < rating 
            ? 'text-yellow-400 fill-current opacity-50' 
            : 'text-gray-300'
        }`}
      />
    ))
  }

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-3">
        <div className="relative">
          <img
            src={image || '/api/placeholder/48/48'}
            alt={name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
            <Verified className="h-3 w-3 text-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{name}</h3>
            <div className="flex items-center">
              {renderStars(reputationScore)}
              <span className="ml-1 text-xs text-gray-600">({reputationScore})</span>
            </div>
          </div>
          <p className="text-xs text-gray-500">{truncateAddress(address)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Profile Header */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img
            src={image || '/api/placeholder/80/80'}
            alt={name}
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
          />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
            <Verified className="h-4 w-4 text-white" />
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
            <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              Verified Farmer
            </div>
          </div>
          
          <div className="flex items-center space-x-1 mb-2">
            {renderStars(reputationScore)}
            <span className="ml-2 text-sm text-gray-600">
              {reputationScore} ({completedOrders} reviews)
            </span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{location}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      {showProducts && (
        <div className="grid grid-cols-3 gap-4 py-3 border-y border-gray-200">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{totalProducts}</div>
            <div className="text-xs text-gray-600">Products</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{completedOrders}</div>
            <div className="text-xs text-gray-600">Orders</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{Math.round(reputationScore * 20)}%</div>
            <div className="text-xs text-gray-600">Rating</div>
          </div>
        </div>
      )}

      {/* Wallet Address */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Wallet Address</span>
          <button
            onClick={() => navigator.clipboard.writeText(address)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Copy
          </button>
        </div>
        <code className="text-xs font-mono text-gray-800 break-all">{address}</code>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Achievements</h4>
          <div className="flex flex-wrap gap-2">
            {badges.slice(0, 3).map((badge) => (
              <div
                key={badge.id}
                className="flex items-center space-x-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                title={badge.description}
              >
                <Award className="h-3 w-3" />
                <span>{badge.name}</span>
              </div>
            ))}
            {badges.length > 3 && (
              <div className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{badges.length - 3} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Member Since */}
      <div className="flex items-center text-sm text-gray-500">
        <Calendar className="h-4 w-4 mr-1" />
        <span>Member since {formatDate(joinDate)}</span>
      </div>

      {/* Trust Indicators */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <h4 className="text-sm font-semibold text-green-900 mb-2">Trust & Safety</h4>
        <div className="space-y-1 text-xs text-green-700">
          <div className="flex items-center">
            <Verified className="h-3 w-3 mr-2 text-green-600" />
            Identity verified through government documentation
          </div>
          <div className="flex items-center">
            <Award className="h-3 w-3 mr-2 text-green-600" />
            Certified organic farming practices
          </div>
          <div className="flex items-center">
            <Users className="h-3 w-3 mr-2 text-green-600" />
            Active community member with high ratings
          </div>
        </div>
      </div>
    </div>
  )
}