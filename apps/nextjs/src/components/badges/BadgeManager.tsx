import React, { useState } from 'react'
import { Award, Shield, CheckCircle, Clock, ExternalLink, Plus, Sparkles } from 'lucide-react'

interface Badge {
  id: string
  name: string
  description: string
  type: 'certification' | 'achievement' | 'verification' | 'community'
  status: 'earned' | 'pending' | 'available'
  earnedDate?: Date
  expiryDate?: Date
  issuer: string
  documentId?: string
  verificationUrl?: string
  icon: string
}

interface Document {
  id: string
  title: string
  category: string
}

interface BadgeManagerProps {
  badges: Badge[]
  documents: Document[]
  onGenerateZKP: (documentId: string, proofType: string) => Promise<any>
}

export const BadgeManager: React.FC<BadgeManagerProps> = ({
  badges,
  documents,
  onGenerateZKP
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showBadgeDetail, setShowBadgeDetail] = useState<string | null>(null)

  const categories = [
    { id: 'all', name: 'All Badges', count: badges.length },
    { id: 'earned', name: 'Earned', count: badges.filter(b => b.status === 'earned').length },
    { id: 'pending', name: 'Pending', count: badges.filter(b => b.status === 'pending').length },
    { id: 'available', name: 'Available', count: badges.filter(b => b.status === 'available').length }
  ]

  const filteredBadges = badges.filter(badge => {
    if (selectedCategory === 'all') return true
    return badge.status === selectedCategory
  })

  const getBadgeIcon = (type: string, status: string) => {
    const icons = {
      certification: '🏆',
      achievement: '⭐',
      verification: '✅',
      community: '👥'
    }
    
    if (status === 'earned') {
      return icons[type as keyof typeof icons] || '🏅'
    } else if (status === 'pending') {
      return '⏳'
    } else {
      return '🔒'
    }
  }

  const getBadgeStatusColor = (status: string) => {
    switch (status) {
      case 'earned':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'available':
        return 'bg-gray-100 text-gray-600 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const handleClaimBadge = async (badge: Badge) => {
    if (badge.documentId && badge.status === 'available') {
      try {
        await onGenerateZKP(badge.documentId, 'certification_validity')
        // In a real app, this would update the badge status
        console.log('Badge claimed:', badge.name)
      } catch (error) {
        console.error('Failed to claim badge:', error)
      }
    }
  }

  // Mock available badges that can be earned
  const availableBadges: Badge[] = [
    {
      id: 'organic_certified',
      name: 'Organic Certified',
      description: 'Verified organic farming practices through official certification',
      type: 'certification',
      status: 'available',
      issuer: 'Sri Lankan Organic Agriculture Association',
      icon: '🌱'
    },
    {
      id: 'fair_trade',
      name: 'Fair Trade Verified',
      description: 'Committed to fair wages and sustainable farming practices',
      type: 'certification',
      status: 'available',
      issuer: 'Fair Trade International',
      icon: '🤝'
    },
    {
      id: 'quality_excellence',
      name: 'Quality Excellence',
      description: 'Consistently high-quality spice production',
      type: 'achievement',
      status: 'available',
      issuer: 'Spice Platform',
      icon: '⭐'
    },
    {
      id: 'sustainability_champion',
      name: 'Sustainability Champion',
      description: 'Leading the way in sustainable farming practices',
      type: 'achievement',
      status: 'available',
      issuer: 'Environmental Council',
      icon: '🌍'
    }
  ]

  const allBadges = [...badges, ...availableBadges].filter(badge => {
    if (selectedCategory === 'all') return true
    return badge.status === selectedCategory
  })

  if (allBadges.length === 0) {
    return (
      <div className="text-center py-12">
        <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Badges Yet</h3>
        <p className="text-gray-600 mb-6">
          Upload credentials and certificates to start earning verification badges.
        </p>
        <div className="flex justify-center">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Upload First Document
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedCategory === category.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {category.name}
            <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">
              {category.count}
            </span>
          </button>
        ))}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allBadges.map((badge) => (
          <div
            key={badge.id}
            className={`relative p-6 border-2 rounded-lg transition-all cursor-pointer hover:shadow-md ${
              getBadgeStatusColor(badge.status)
            }`}
            onClick={() => setShowBadgeDetail(badge.id)}
          >
            <div className="text-center">
              <div className="text-4xl mb-3">
                {getBadgeIcon(badge.type, badge.status)}
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2">
                {badge.name}
              </h3>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {badge.description}
              </p>
              
              <div className="text-xs text-gray-500 mb-3">
                Issued by {badge.issuer}
              </div>

              {badge.status === 'earned' && badge.earnedDate && (
                <div className="flex items-center justify-center text-xs text-green-600 mb-2">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Earned {badge.earnedDate.toLocaleDateString()}
                </div>
              )}

              {badge.status === 'pending' && (
                <div className="flex items-center justify-center text-xs text-yellow-600 mb-2">
                  <Clock className="h-3 w-3 mr-1" />
                  Verification pending
                </div>
              )}

              {badge.status === 'available' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClaimBadge(badge)
                  }}
                  className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  Claim Badge
                </button>
              )}

              {badge.expiryDate && (
                <div className="text-xs text-gray-500 mt-2">
                  Expires {badge.expiryDate.toLocaleDateString()}
                </div>
              )}
            </div>

            {badge.status === 'earned' && (
              <div className="absolute top-2 right-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Badge Detail Modal */}
      {showBadgeDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            {(() => {
              const badge = allBadges.find(b => b.id === showBadgeDetail)
              if (!badge) return null

              return (
                <>
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-4">
                      {getBadgeIcon(badge.type, badge.status)}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      {badge.name}
                    </h2>
                    <span className={`px-3 py-1 text-sm rounded-full ${getBadgeStatusColor(badge.status)}`}>
                      {badge.status.charAt(0).toUpperCase() + badge.status.slice(1)}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Description</h3>
                      <p className="text-gray-600">{badge.description}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Issuer</h3>
                      <p className="text-gray-600">{badge.issuer}</p>
                    </div>

                    {badge.earnedDate && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Earned Date</h3>
                        <p className="text-gray-600">{badge.earnedDate.toLocaleDateString()}</p>
                      </div>
                    )}

                    {badge.verificationUrl && (
                      <div>
                        <a
                          href={badge.verificationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Verify Badge Online
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end space-x-3 mt-6">
                    <button
                      onClick={() => setShowBadgeDetail(null)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                    >
                      Close
                    </button>
                    {badge.status === 'available' && (
                      <button
                        onClick={() => {
                          handleClaimBadge(badge)
                          setShowBadgeDetail(null)
                        }}
                        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                      >
                        Claim Badge
                      </button>
                    )}
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <h4 className="font-medium text-blue-900 mb-1">About Verification Badges</h4>
            <p className="text-blue-700">
              Badges are earned by uploading relevant documents and generating zero-knowledge proofs. 
              They allow you to showcase your credentials and achievements while maintaining privacy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}