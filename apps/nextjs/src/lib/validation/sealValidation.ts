/**
 * Seal Validation Utilities
 * Comprehensive validation logic for passport sealing readiness
 */

export interface SealReadinessCheck {
  hasHarvestData: boolean
  hasMinimumProcessingSteps: boolean
  hasRequiredPhotos: boolean
  hasValidDescriptions: boolean
  meetsTimingRequirements: boolean
  hasQualityClaims: boolean
  overallReady: boolean
  warnings: string[]
  score: number // 0-100 readiness score
}

export interface PassportValidationData {
  batchId: number
  spiceType: string
  totalWeight: number
  dateCreated: Date
  harvestHash: string
  processingHashes: string[]
  isLocked: boolean
  statusText: string
  owner: string
  qualityClaims?: string[]
  totalSteps?: number
  processingSteps?: Array<{
    description?: string
    photos?: string[]
    timestamp: Date
  }>
}

/**
 * Validates if a passport is ready for sealing
 */
export function validateSealReadiness(passport: PassportValidationData): SealReadinessCheck {
  const warnings: string[] = []
  const checks = {
    hasHarvestData: false,
    hasMinimumProcessingSteps: false,
    hasRequiredPhotos: false,
    hasValidDescriptions: false,
    meetsTimingRequirements: false,
    hasQualityClaims: false
  }

  // Check 1: Harvest Data
  checks.hasHarvestData = !!passport.harvestHash
  if (!checks.hasHarvestData) {
    warnings.push('Missing harvest data. Please complete the harvest logging process.')
  }

  // Check 2: Processing Steps
  checks.hasMinimumProcessingSteps = passport.processingHashes.length >= 1
  if (!checks.hasMinimumProcessingSteps) {
    warnings.push('At least one processing step is required before sealing.')
  }

  // Check 3: Required Photos
  checks.hasRequiredPhotos = passport.processingHashes.length > 0
  if (!checks.hasRequiredPhotos) {
    warnings.push('Processing step photos are required for verification.')
  }

  // Check 4: Valid Descriptions
  if (passport.processingSteps) {
    const hasValidDescriptions = passport.processingSteps.every(step => 
      step.description && step.description.trim().length >= 10
    )
    checks.hasValidDescriptions = hasValidDescriptions
    if (!hasValidDescriptions) {
      warnings.push('All processing steps must have detailed descriptions (minimum 10 characters).')
    }
  } else {
    checks.hasValidDescriptions = passport.totalSteps ? passport.totalSteps >= 1 : true
  }

  // Check 5: Timing Requirements
  const now = Date.now()
  const createdTime = new Date(passport.dateCreated).getTime()
  const timeSinceCreation = now - createdTime
  const minimumWaitTime = 5 * 60 * 1000 // 5 minutes
  
  checks.meetsTimingRequirements = timeSinceCreation >= minimumWaitTime
  if (!checks.meetsTimingRequirements) {
    const remainingTime = Math.ceil((minimumWaitTime - timeSinceCreation) / 1000 / 60)
    warnings.push(`Please wait ${remainingTime} more minute(s) before sealing to ensure data integrity.`)
  }

  // Check 6: Quality Claims (Optional but recommended)
  checks.hasQualityClaims = !!(passport.qualityClaims && passport.qualityClaims.length > 0)
  if (!checks.hasQualityClaims) {
    warnings.push('Consider adding quality claims to increase buyer confidence.')
  }

  // Calculate overall readiness
  const requiredChecks = [
    checks.hasHarvestData,
    checks.hasMinimumProcessingSteps,
    checks.hasRequiredPhotos,
    checks.hasValidDescriptions,
    checks.meetsTimingRequirements
  ]

  const overallReady = requiredChecks.every(check => check === true)

  // Calculate score (0-100)
  const allChecks = Object.values(checks)
  const passedChecks = allChecks.filter(check => check === true).length
  const score = Math.round((passedChecks / allChecks.length) * 100)

  return {
    ...checks,
    overallReady,
    warnings,
    score
  }
}

/**
 * Security validations for seal confirmation
 */
export interface SecurityValidation {
  isOwner: boolean
  hasValidWallet: boolean
  hasValidContract: boolean
  isCorrectNetwork: boolean
  hasSufficientGas: boolean
  warnings: string[]
}

export function validateSecurityRequirements(
  passport: PassportValidationData,
  currentAddress?: string,
  contractAddress?: string,
  gasEstimate?: { estimatedCost: bigint },
  walletBalance?: bigint
): SecurityValidation {
  const warnings: string[] = []

  const isOwner = currentAddress ? passport.owner.toLowerCase() === currentAddress.toLowerCase() : false
  if (!isOwner) {
    warnings.push('Only the passport owner can seal this passport.')
  }

  const hasValidWallet = !!currentAddress
  if (!hasValidWallet) {
    warnings.push('Please connect your wallet to continue.')
  }

  const hasValidContract = !!contractAddress
  if (!hasValidContract) {
    warnings.push('Smart contract not available. Please refresh and try again.')
  }

  // Network validation would require web3 provider
  const isCorrectNetwork = true // Assume correct network for now

  const hasSufficientGas = gasEstimate && walletBalance 
    ? walletBalance >= gasEstimate.estimatedCost
    : true // Assume sufficient if we can't check

  if (!hasSufficientGas && gasEstimate) {
    warnings.push('Insufficient balance for transaction fees.')
  }

  return {
    isOwner,
    hasValidWallet,
    hasValidContract,
    isCorrectNetwork,
    hasSufficientGas,
    warnings
  }
}

/**
 * Risk assessment for sealing action
 */
export interface RiskAssessment {
  level: 'low' | 'medium' | 'high'
  factors: string[]
  recommendations: string[]
}

export function assessSealingRisks(passport: PassportValidationData): RiskAssessment {
  const factors: string[] = []
  const recommendations: string[] = []

  // Age-based risk
  const ageInHours = (Date.now() - new Date(passport.dateCreated).getTime()) / (1000 * 60 * 60)
  if (ageInHours < 1) {
    factors.push('Passport created very recently')
    recommendations.push('Consider waiting longer to ensure all data is accurate')
  }

  // Processing completeness risk
  if (passport.processingHashes.length < 2) {
    factors.push('Limited processing steps recorded')
    recommendations.push('Add more processing steps to increase buyer confidence')
  }

  // Quality claims risk
  if (!passport.qualityClaims || passport.qualityClaims.length === 0) {
    factors.push('No quality claims specified')
    recommendations.push('Add quality claims to justify premium pricing')
  }

  // Weight validation risk
  if (passport.totalWeight <= 0) {
    factors.push('Invalid weight specification')
    recommendations.push('Verify and update the total weight before sealing')
  }

  // Determine risk level
  let level: 'low' | 'medium' | 'high' = 'low'
  if (factors.length >= 3) {
    level = 'high'
  } else if (factors.length >= 1) {
    level = 'medium'
  }

  return {
    level,
    factors,
    recommendations
  }
}

/**
 * Complete validation for sealing workflow
 */
export function validateCompleteSealing(
  passport: PassportValidationData,
  currentAddress?: string,
  contractAddress?: string,
  gasEstimate?: { estimatedCost: bigint },
  walletBalance?: bigint
) {
  const readinessCheck = validateSealReadiness(passport)
  const securityValidation = validateSecurityRequirements(
    passport, 
    currentAddress, 
    contractAddress, 
    gasEstimate, 
    walletBalance
  )
  const riskAssessment = assessSealingRisks(passport)

  const canProceed = readinessCheck.overallReady && 
                    securityValidation.isOwner && 
                    securityValidation.hasValidWallet &&
                    securityValidation.hasValidContract

  return {
    readinessCheck,
    securityValidation,
    riskAssessment,
    canProceed,
    allWarnings: [
      ...readinessCheck.warnings,
      ...securityValidation.warnings
    ]
  }
}