import { type Address } from 'viem'

export interface MarketplaceProduct {
  // Core identification
  batchId: string
  farmerAddress: Address
  
  // Product details
  spiceType: string
  farmerName: string
  price: number
  weight: number
  unit: string
  description?: string
  imageUrl?: string
  images?: string[]
  farmerImage?: string
  badges?: Array<{
    id: string
    name: string
    description: string
    icon: string
    earnedDate: Date | string
  }>
  reputationScore?: number
  harvestHash?: string
  processingHashes?: string[]
  
  // Quality and origin
  qualityGrade: 'AAA' | 'AA' | 'A+' | 'A' | 'B+' | 'B'
  region: string
  processingMethod: string
  
  // Dates
  harvestDate: string
  sealedAt: string
  
  // Blockchain verification
  verificationHash: string
  
  // Status (all marketplace products should be sealed)
  status?: 'sealed' | 'sold' | 'disputed'
  
  // Enhanced presentation fields
  certifications?: string[]
  curcumin?: string | null
  piperine?: string | null
  eugenol?: string | null
  vanillin?: string | null
  moistureContent?: string
  essentialOilContent?: string
  myristicin?: string | null
  harvestStory?: string
  sustainabilityScore?: number
  carbonFootprint?: string
  socialImpact?: string
  healthBenefits?: string
  reviews?: Array<{
    rating: number
    comment: string
    buyer: string
  }>
}

export interface MarketplaceFilters {
  spiceTypes: string[]
  priceRange?: {
    min: number
    max: number
  }
  weightRange?: {
    min: number
    max: number
  }
  qualityGrades: string[]
  regions: string[]
  harvestDateRange?: {
    start: string
    end: string
  }
}

export interface MarketplaceSortOption {
  field: 'price' | 'harvestDate' | 'sealedAt' | 'weight' | 'qualityGrade'
  direction: 'asc' | 'desc'
}

export interface MarketplaceStats {
  totalProducts: number
  uniqueFarmers: number
  uniqueSpiceTypes: number
  averagePrice: number
  totalWeight: number
  recentAdditions: number
}

export interface FarmerProfile {
  address: Address
  name: string
  bio?: string
  profileImage?: string
  reputationScore: number
  totalProducts: number
  verificationStatus: 'verified' | 'pending' | 'unverified'
  location: string
  joinedDate: string
  specialties: string[]
}

export interface ProductVerification {
  batchId: string
  blockchainHash: string
  verified: boolean
  verificationData: {
    farmerAddress: Address
    harvestDate: string
    processingSteps: string[]
    qualityChecks: string[]
    sealingTimestamp: string
  }
  blockExplorerUrl: string
}