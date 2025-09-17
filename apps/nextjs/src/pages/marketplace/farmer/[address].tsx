import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { MarketplaceLayout } from '@/components/marketplace/MarketplaceLayout'
import { MarketplaceProductCard } from '@/components/marketplace/MarketplaceProductCard'
import { useFarmerProducts } from '@/hooks/useMarketplaceProducts'
import { 
  User, 
  Star, 
  MapPin, 
  Calendar, 
  Award, 
  Package,
  ChevronLeft,
  Shield,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react'

// Mock farmer profile data - in production, this would be fetched from contracts/IPFS
const getFarmerProfile = (address: string) => {
  const profiles = {
    '0x1234567890123456789012345678901234567890': {
      name: 'Rajesh Silva',
      bio: 'Third-generation spice farmer with over 25 years of experience in Ceylon cinnamon cultivation. My family has been farming in the Kandy hills for generations, and we are committed to sustainable farming practices that preserve both the environment and the traditional methods passed down through our ancestors. We specialize in premium grade Ceylon cinnamon, known worldwide for its sweet flavor and delicate aroma.',
      profileImage: '👨‍🌾',
      coverImage: '🌿',
      reputationScore: 4.8,
      totalProducts: 47,
      totalSales: 156,
      verificationStatus: 'verified' as const,
      location: 'Kandy Hills, Sri Lanka',
      coordinates: { lat: 7.2906, lng: 80.6337 },
      joinedDate: '2022-03-15',
      specialties: ['Ceylon Cinnamon', 'Cardamom', 'Cloves'],
      certifications: ['Organic Certified', 'Fair Trade', 'Rainforest Alliance', 'ISO 22000'],
      farmSize: 15, // hectares
      farmingMethod: 'Organic',
      languages: ['Sinhala', 'Tamil', 'English'],
      story: 'Growing up surrounded by cinnamon trees in Kandy, I learned the art of spice cultivation from my grandfather. Our farm follows traditional methods combined with modern organic practices. Each batch is carefully tended by hand, ensuring the highest quality while supporting our local community.',
      achievements: [
        'Best Organic Cinnamon Producer 2023',
        'Community Farming Award 2022',
        'Sustainable Agriculture Recognition',
        '50+ Five-Star Reviews'
      ]
    },
    '0x2345678901234567890123456789012345678901': {
      name: 'Kumari Fernando',
      bio: 'Passionate organic farmer specializing in premium black pepper cultivation. I believe in sustainable farming practices that protect our environment while producing the finest quality spices. My pepper plantation uses traditional fermentation methods that have been perfected over generations.',
      profileImage: '👩‍🌾',
      coverImage: '🌶️',
      reputationScore: 4.9,
      totalProducts: 32,
      totalSales: 89,
      verificationStatus: 'verified' as const,
      location: 'Matale, Sri Lanka',
      coordinates: { lat: 7.4705, lng: 80.6217 },
      joinedDate: '2021-11-08',
      specialties: ['Black Pepper', 'White Pepper', 'Nutmeg'],
      certifications: ['Organic Certified', 'Women Farmers Collective', 'Sri Lanka Spice Council'],
      farmSize: 8,
      farmingMethod: 'Organic',
      languages: ['Sinhala', 'English'],
      story: 'As a female farmer in a traditional industry, I am proud to showcase the quality and authenticity of Sri Lankan black pepper. My focus on organic methods ensures that each peppercorn carries the true essence of our soil and climate.',
      achievements: [
        'Women in Agriculture Award 2023',
        'Premium Quality Certification',
        'Export Excellence Award',
        '40+ Perfect Ratings'
      ]
    }
  }

  return profiles[address as keyof typeof profiles] || {
    name: 'Unknown Farmer',
    bio: 'Dedicated spice farmer committed to producing authentic, high-quality Sri Lankan spices using sustainable and traditional farming methods.',
    profileImage: '👨‍🌾',
    coverImage: '🌿',
    reputationScore: 4.5,
    totalProducts: 15,
    totalSales: 45,
    verificationStatus: 'verified' as const,
    location: 'Sri Lanka',
    coordinates: { lat: 7.8731, lng: 80.7718 },
    joinedDate: '2023-01-01',
    specialties: ['Traditional Spices'],
    certifications: ['Verified Farmer'],
    farmSize: 5,
    farmingMethod: 'Traditional',
    languages: ['Sinhala'],
    story: 'Committed to preserving the traditional methods of spice cultivation while ensuring the highest quality products for our customers.',
    achievements: ['Quality Assurance Certified']
  }
}

const FarmerProfilePage: React.FC = () => {
  const router = useRouter()
  const { address } = router.query
  const { products, loading, error, stats } = useFarmerProducts(address as string)
  
  const farmer = getFarmerProfile(address as string)

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

  if (loading) {
    return (
      <MarketplaceLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg mb-6"></div>
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </MarketplaceLayout>
    )
  }

  return (
    <>
      <Head>
        <title>{farmer.name} - Spice Farmer Profile | Spiced Marketplace</title>
        <meta 
          name="description" 
          content={`${farmer.name} - ${farmer.bio.slice(0, 160)}...`}
        />
        <meta property="og:title" content={`${farmer.name} - Spice Farmer Profile`} />
        <meta property="og:description" content={farmer.bio} />
        {farmer.profileImage && <meta property="og:image" content={farmer.profileImage} />}
      </Head>

      <MarketplaceLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to marketplace
          </button>

          {/* Cover Image */}
          <div className="relative h-48 md:h-64 rounded-xl overflow-hidden bg-gradient-to-r from-green-400 to-green-600 mb-8">
            {farmer.coverImage ? (
              <Image
                src={farmer.coverImage}
                alt={`${farmer.name}'s plantation`}
                fill
                className="object-cover"
                priority
              />
            ) : null}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            
            {/* Profile Info Overlay */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-end gap-6">
                {/* Profile Picture */}
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-white p-1">
                    {farmer.profileImage ? (
                      <Image
                        src={farmer.profileImage}
                        alt={farmer.name}
                        width={128}
                        height={128}
                        className="object-cover w-full h-full rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-full">
                        <User className="h-12 w-12 md:h-16 md:w-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Verification Badge */}
                  {farmer.verificationStatus === 'verified' && (
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center border-2 border-white">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Basic Info */}
                <div className="flex-1 text-white">
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">
                    {farmer.name}
                  </h1>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-0.5">
                      {renderStars(farmer.reputationScore)}
                    </div>
                    <span className="text-sm font-medium">
                      {farmer.reputationScore}
                    </span>
                    <span className="text-sm opacity-80">
                      ({stats.totalProducts} products)
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm opacity-90">
                    <MapPin className="h-4 w-4" />
                    {farmer.location}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  About {farmer.name.split(' ')[0]}
                </h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {farmer.story}
                </p>
                
                {/* Specialties */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Specializes In</h3>
                  <div className="flex flex-wrap gap-2">
                    {farmer.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="inline-flex items-center px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Certifications */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Certifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {farmer.certifications.map((cert) => (
                      <div
                        key={cert}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-green-50 text-green-800 border border-green-200 rounded-lg"
                      >
                        <Award className="h-4 w-4" />
                        {cert}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Products Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Available Products ({stats.totalProducts})
                  </h2>
                  <div className="text-sm text-gray-600">
                    Avg. ${stats.averagePrice.toFixed(2)} per product
                  </div>
                </div>

                {error ? (
                  <div className="text-center py-8">
                    <div className="text-red-600 mb-2">Failed to load products</div>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No products currently available
                    </h3>
                    <p className="text-gray-600">
                      Check back soon for new products from {farmer.name.split(' ')[0]}.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {products.map((product) => (
                      <MarketplaceProductCard key={product.batchId} product={product} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Farmer Statistics
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Package className="h-4 w-4" />
                      <span className="text-sm">Products Sold</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {farmer.totalSales}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm">Avg. Rating</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {farmer.reputationScore}★
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">Farm Size</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {farmer.farmSize} ha
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Member Since</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(farmer.joinedDate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Farm Info */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Farm Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600">Farming Method</div>
                    <div className="font-medium text-gray-900">{farmer.farmingMethod}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-600">Languages</div>
                    <div className="font-medium text-gray-900">
                      {farmer.languages.join(', ')}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Location</div>
                    <div className="font-medium text-gray-900">{farmer.location}</div>
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Achievements
                </h3>
                <div className="space-y-2">
                  {farmer.achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <Award className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                      {achievement}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact/Trust Indicators */}
              <div className="bg-green-50 rounded-lg border border-green-200 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-900">
                    Verified Farmer
                  </h3>
                </div>
                <p className="text-sm text-green-700 mb-4">
                  This farmer has been verified through our blockchain authentication system.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Identity verified on blockchain
                  </div>
                  <div className="flex items-center gap-2 text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Farm location confirmed
                  </div>
                  <div className="flex items-center gap-2 text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Quality certifications valid
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MarketplaceLayout>
    </>
  )
}

export default FarmerProfilePage