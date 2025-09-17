import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  User, 
  Star, 
  MapPin, 
  Calendar, 
  Award, 
  Package,
  ExternalLink,
  Shield
} from 'lucide-react'

interface FarmerCardProps {
  farmerAddress: string
  farmerName: string
}

// Mock farmer data - in production, this would be fetched from contracts/IPFS
const getFarmerProfile = (address: string, name: string) => {
  const profiles = {
    '0x1234567890123456789012345678901234567890': {
      name: 'Rajesh Silva',
      bio: 'Third-generation spice farmer with 25+ years of experience in Ceylon cinnamon cultivation. Committed to sustainable farming practices and maintaining the highest quality standards.',
      profileImage: '👨‍🌾',
      reputationScore: 4.8,
      totalProducts: 47,
      verificationStatus: 'verified' as const,
      location: 'Kandy Hills, Sri Lanka',
      joinedDate: '2022-03-15',
      specialties: ['Ceylon Cinnamon', 'Cardamom', 'Cloves'],
      certifications: ['Organic Certified', 'Fair Trade', 'Rainforest Alliance']
    },
    '0x2345678901234567890123456789012345678901': {
      name: 'Kumari Fernando',
      bio: 'Passionate organic farmer specializing in premium black pepper. Uses traditional methods passed down through generations while incorporating modern sustainable practices.',
      profileImage: '👩‍🌾',
      reputationScore: 4.9,
      totalProducts: 32,
      verificationStatus: 'verified' as const,
      location: 'Matale, Sri Lanka',
      joinedDate: '2021-11-08',
      specialties: ['Black Pepper', 'White Pepper', 'Nutmeg'],
      certifications: ['Organic Certified', 'Women Farmers Collective']
    }
  }

  return profiles[address as keyof typeof profiles] || {
    name,
    bio: 'Dedicated spice farmer committed to producing authentic, high-quality Sri Lankan spices using sustainable and traditional farming methods.',
    profileImage: '👨‍🌾',
    reputationScore: 4.5,
    totalProducts: 15,
    verificationStatus: 'verified' as const,
    location: 'Sri Lanka',
    joinedDate: '2023-01-01',
    specialties: ['Traditional Spices'],
    certifications: ['Verified Farmer']
  }
}

export const FarmerCard: React.FC<FarmerCardProps> = ({ 
  farmerAddress, 
  farmerName 
}) => {
  const farmer = getFarmerProfile(farmerAddress, farmerName)

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-start gap-6">
        {/* Farmer Photo */}
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
            {farmer.profileImage ? (
              <Image
                src={farmer.profileImage}
                alt={farmer.name}
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="h-10 w-10 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Verification Badge */}
          {farmer.verificationStatus === 'verified' && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
              <Shield className="h-3 w-3 text-white" />
            </div>
          )}
        </div>

        {/* Farmer Information */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {farmer.name}
              </h3>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-0.5">
                  {renderStars(farmer.reputationScore)}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {farmer.reputationScore}
                </span>
                <span className="text-sm text-gray-500">
                  ({farmer.totalProducts} products)
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                <MapPin className="h-4 w-4" />
                {farmer.location}
              </div>

              {/* Member Since */}
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                Member since {formatDate(farmer.joinedDate)}
              </div>
            </div>

            {/* View Profile Link */}
            <Link
              href={`/marketplace/farmer/${farmerAddress}`}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              View Profile
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          {/* Bio */}
          <p className="text-gray-700 text-sm leading-relaxed mb-4">
            {farmer.bio}
          </p>

          {/* Specialties */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Specializes in:</h4>
            <div className="flex flex-wrap gap-2">
              {farmer.specialties.map((specialty) => (
                <span
                  key={specialty}
                  className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Certifications:</h4>
            <div className="flex flex-wrap gap-2">
              {farmer.certifications.map((cert) => (
                <span
                  key={cert}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full"
                >
                  <Award className="h-3 w-3" />
                  {cert}
                </span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {farmer.totalProducts}
              </div>
              <div className="text-xs text-gray-600">Products Sold</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {farmer.reputationScore}★
              </div>
              <div className="text-xs text-gray-600">Avg Rating</div>
            </div>

            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                100%
              </div>
              <div className="text-xs text-gray-600">Verified</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FarmerCard