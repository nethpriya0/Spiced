import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { type MarketplaceProduct } from '@/types/marketplace'
import { Shield, Award, MapPin, Calendar, Package, Verified, Star, Leaf, Truck } from 'lucide-react'
import { QUALITY_GRADES } from '@/data/demoData'

interface MarketplaceProductCardProps {
  product: MarketplaceProduct
}

export const MarketplaceProductCard: React.FC<MarketplaceProductCardProps> = ({ product }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getQualityGradeInfo = (grade: string) => {
    return QUALITY_GRADES[grade as keyof typeof QUALITY_GRADES] || QUALITY_GRADES.A
  }

  const getActiveCompounds = (product: MarketplaceProduct) => {
    const compounds = []
    if (product.piperine) compounds.push(`${product.piperine} Piperine`)
    if (product.curcumin) compounds.push(`${product.curcumin} Curcumin`)
    if (product.eugenol) compounds.push(`${product.eugenol} Eugenol`)
    if (product.vanillin) compounds.push(`${product.vanillin} Vanillin`)
    if (product.myristicin) compounds.push(`${product.myristicin} Myristicin`)
    return compounds
  }

  const getAverageRating = (reviews: typeof product.reviews) => {
    if (!reviews || reviews.length === 0) return null
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  }

  const qualityGradeInfo = getQualityGradeInfo(product.qualityGrade)
  const activeCompounds = getActiveCompounds(product)
  const averageRating = getAverageRating(product.reviews)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group hover:border-orange-200">
      {/* Product Image */}
      <div className="relative h-56 bg-gradient-to-br from-orange-50 to-green-50">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={`${product.spiceType} by ${product.farmerName}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <Package className="h-16 w-16 text-gray-300" />
          </div>
        )}
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1 px-2 py-1 bg-green-500/90 backdrop-blur-sm text-white text-xs font-medium rounded-full shadow-lg">
              <Shield className="h-3 w-3" />
              Verified
            </div>
            {product.sustainabilityScore && product.sustainabilityScore > 8.5 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-medium rounded-full shadow-lg">
                <Leaf className="h-3 w-3" />
                Eco+
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 items-end">
            <div className={`flex items-center gap-1 px-2 py-1 backdrop-blur-sm text-xs font-medium rounded-full shadow-lg ${
              qualityGradeInfo.color.includes('purple') ? 'bg-purple-500/90 text-white' :
              qualityGradeInfo.color.includes('blue') ? 'bg-blue-500/90 text-white' :
              qualityGradeInfo.color.includes('green') ? 'bg-green-500/90 text-white' :
              qualityGradeInfo.color.includes('yellow') ? 'bg-yellow-500/90 text-white' :
              'bg-gray-500/90 text-white'
            }`}>
              <Award className="h-3 w-3" />
              {product.qualityGrade}
            </div>
            {averageRating && (
              <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/90 backdrop-blur-sm text-white text-xs font-medium rounded-full shadow-lg">
                <Star className="h-3 w-3 fill-current" />
                {averageRating.toFixed(1)}
              </div>
            )}
          </div>
        </div>

        {/* Price Overlay */}
        <div className="absolute bottom-3 right-3">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-2 shadow-lg">
            <div className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </div>
            <div className="text-xs text-gray-500 text-center">
              {product.weight} kg
            </div>
          </div>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-5">
        {/* Header */}
        <div className="mb-3">
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-orange-600 transition-colors">
            {product.spiceType}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {product.farmerName}
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(product.harvestDate)}
            </p>
          </div>
        </div>

        {/* Certifications */}
        {product.certifications && product.certifications.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.certifications.slice(0, 3).map(cert => (
              <span key={cert} className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-md">
                {cert}
              </span>
            ))}
            {product.certifications.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">
                +{product.certifications.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Active Compounds */}
        {activeCompounds.length > 0 && (
          <div className="mb-3 p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <div className="text-xs font-medium text-gray-700 mb-1">Active Compounds</div>
            <div className="text-xs text-blue-700 font-medium">
              {activeCompounds[0]}
              {activeCompounds.length > 1 && ` +${activeCompounds.length - 1} more`}
            </div>
          </div>
        )}

        {/* Description */}
        {product.description && (
          <p className="text-sm text-gray-700 mb-4 line-clamp-3 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Sustainability Score */}
        {product.sustainabilityScore && (
          <div className="mb-3 flex items-center justify-between text-xs">
            <span className="text-gray-600">Sustainability Score</span>
            <div className="flex items-center gap-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(i => (
                  <Leaf 
                    key={i} 
                    className={`h-3 w-3 ${
                      i <= Math.round(product.sustainabilityScore! / 2) 
                        ? 'text-green-500 fill-current' 
                        : 'text-gray-300'
                    }`} 
                  />
                ))}
              </div>
              <span className="font-medium text-green-600 ml-1">
                {product.sustainabilityScore}/10
              </span>
            </div>
          </div>
        )}

        {/* Carbon Footprint */}
        {product.carbonFootprint && (
          <div className="mb-3 flex items-center justify-between text-xs">
            <span className="text-gray-600 flex items-center gap-1">
              <Truck className="h-3 w-3" />
              Carbon Footprint
            </span>
            <span className="text-green-600 font-medium">{product.carbonFootprint}</span>
          </div>
        )}

        {/* Reviews Preview */}
        {product.reviews && product.reviews.length > 0 && (
          <div className="mb-4 p-2 bg-amber-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star 
                    key={i} 
                    className={`h-3 w-3 ${
                      i <= Math.round(averageRating!) 
                        ? 'text-amber-400 fill-current' 
                        : 'text-gray-300'
                    }`} 
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600">
                {averageRating!.toFixed(1)} ({product.reviews.length} reviews)
              </span>
            </div>
            <p className="text-xs text-gray-700 italic line-clamp-2">
              "{product.reviews[0]?.comment}" - {product.reviews[0]?.buyer}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link
            href={`/marketplace/product/${product.batchId}`}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-600 to-red-500 text-white text-sm font-medium rounded-lg hover:from-orange-700 hover:to-red-600 transition-all duration-200 text-center shadow-sm"
          >
            View Details
          </Link>
          <Link
            href={`/marketplace/farmer/${product.farmerAddress}`}
            className="px-3 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors border border-gray-200"
            title="View Farmer Profile"
          >
            <MapPin className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Blockchain Verification Footer */}
      <div className="px-5 py-3 bg-gradient-to-r from-green-50 to-blue-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-gray-700">
            <Shield className="h-3 w-3 text-green-600" />
            <span className="font-medium">Blockchain Verified</span>
            <span className="text-gray-500">#{product.batchId.slice(-6)}</span>
          </div>
          <Link
            href={`/marketplace/verify/${product.batchId}`}
            className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
          >
            Verify
            <Verified className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default MarketplaceProductCard