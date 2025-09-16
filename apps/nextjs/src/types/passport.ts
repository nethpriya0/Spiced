import { ChatMessage } from './chat'

// Base types from Dev Notes
export type Address = `0x${string}`
export type IpfsUrl = `ipfs://${string}`
export type UnixTimestamp = number

export interface HarvestLog {
  spiceType: string
  harvestWeight: number // in grams
  qualityClaims: string[]
  harvestPhotoUrl: IpfsUrl
  dateHarvested: UnixTimestamp
  location?: {
    latitude: number
    longitude: number
  }
}

export interface SpicePassport {
  batchId: string
  ownerAddress: Address
  status: 'IN_PROGRESS' | 'LOCKED' | 'WITHDRAWN'
  
  harvestLog: HarvestLog
  processingLogs: ProcessingLog[]
  packageLog: PackageLog
}

export interface ProcessingLog {
  stepDescription: string
  stepPhotoUrl: IpfsUrl
  dateCompleted: UnixTimestamp
}

export interface PackageLog {
  finalWeight: number
  packagePhotoUrl: IpfsUrl
  qrCodeUrl: IpfsUrl
  datePackaged: UnixTimestamp
}

// Harvest logging conversation types
export type HarvestConversationStep = 
  | 'welcome'
  | 'spice-type'
  | 'harvest-weight'
  | 'quality-claims'
  | 'harvest-photo'
  | 'review-harvest'
  | 'creating-passport'
  | 'success'
  | 'error'

export interface HarvestConversationState {
  step: HarvestConversationStep
  messages: ChatMessage[]
  harvestData: {
    spiceType?: string
    harvestWeight?: number // in grams
    weightUnit?: 'g' | 'kg' | 'lbs'
    qualityClaims?: string[]
    harvestPhotoFile?: File
    harvestPhotoPreview?: string
    location?: {
      latitude: number
      longitude: number
    }
  }
  isComplete: boolean
  isLoading: boolean
  error?: string
  batchId?: number
  qrCodeData?: string
}

// Spice type definitions for Sri Lankan spices
export const COMMON_SPICE_TYPES = [
  'Ceylon Cinnamon',
  'Ceylon Cardamom', 
  'Ceylon Pepper',
  'Ceylon Cloves',
  'Ceylon Nutmeg',
  'Ceylon Mace',
  'Vanilla',
  'Turmeric',
  'Ginger'
] as const

// Quality claim options
export const QUALITY_CLAIM_OPTIONS = [
  'Organic',
  'Fair Trade',
  'Single Origin',
  'Hand-picked',
  'Sundried',
  'Non-GMO',
  'Rain-fed',
  'Traditional Methods',
  'High Altitude',
  'Premium Grade'
] as const

// Weight conversion utilities
export const WEIGHT_UNITS = {
  g: { label: 'Grams', symbol: 'g' },
  kg: { label: 'Kilograms', symbol: 'kg' },
  lbs: { label: 'Pounds', symbol: 'lbs' }
} as const

export type WeightUnit = keyof typeof WEIGHT_UNITS

export const convertWeight = (value: number, from: WeightUnit, to: WeightUnit): number => {
  // Convert everything to grams first, then to target unit
  let grams: number
  
  switch (from) {
    case 'g':
      grams = value
      break
    case 'kg':
      grams = value * 1000
      break
    case 'lbs':
      grams = value * 453.592
      break
  }

  switch (to) {
    case 'g':
      return grams
    case 'kg':
      return grams / 1000
    case 'lbs':
      return grams / 453.592
  }
}

// Validation constants
export const HARVEST_VALIDATION = {
  spiceType: {
    minLength: 3,
    maxLength: 50
  },
  weight: {
    min: 1, // 1 gram
    max: 10_000_000 // 10,000 kg in grams
  },
  qualityClaims: {
    max: 5,
    customClaimMinLength: 5,
    customClaimMaxLength: 100
  },
  photo: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    minWidth: 800,
    minHeight: 600,
    maxWidth: 4096,
    maxHeight: 4096
  }
} as const

// Batch ID generation types
export interface BatchIdData {
  date: Date
  spiceCode: string
  sequence: number
}

export const SPICE_CODES = {
  'Ceylon Cinnamon': 'CIN',
  'Ceylon Cardamom': 'CAR', 
  'Ceylon Pepper': 'PEP',
  'Ceylon Cloves': 'CLA',
  'Ceylon Nutmeg': 'NUT',
  'Ceylon Mace': 'MAC',
  'Vanilla': 'VAN',
  'Turmeric': 'TUR',
  'Ginger': 'GIN'
} as const

// QR Code data structure
export interface QRCodeData {
  batchId: string
  contractAddress: string
  verificationUrl: string
  farmer: string
  spiceType: string
  harvestDate: string
  weight: string
}