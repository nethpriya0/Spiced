import { type PassportData } from '@/lib/contracts/SpicePassportService'
import { IPFSService } from '@/lib/ipfs/IPFSService'

export interface SealReadinessCheck {
  hasHarvestData: boolean
  hasMinimumProcessingSteps: boolean
  hasRequiredPhotos: boolean
  hasValidDescriptions: boolean
  meetsTimingRequirements: boolean
  overallReady: boolean
  warnings: string[]
}

export interface SealReadinessRule {
  name: string
  check: (passport: PassportData, ipfsData?: any) => Promise<boolean> | boolean
  warning?: string
  required: boolean
}

export class PassportReadinessService {
  private ipfsService: IPFSService
  private rules: SealReadinessRule[]

  constructor() {
    this.ipfsService = new IPFSService()
    this.rules = [
      {
        name: 'hasHarvestData',
        check: (passport) => !!passport.harvestHash && passport.harvestHash !== '',
        warning: 'Harvest data is required before sealing',
        required: true
      },
      {
        name: 'hasMinimumProcessingSteps', 
        check: (passport) => passport.processingHashes.length >= 1,
        warning: 'At least one processing step is required',
        required: true
      },
      {
        name: 'hasRequiredPhotos',
        check: async (passport, ipfsData) => {
          // Check if harvest has photo
          const harvestData = ipfsData?.harvestData
          if (!harvestData || !harvestData.data?.harvestPhotoUrl) {
            return false
          }

          // Check if processing steps have photos
          const processingData = ipfsData?.processingData || []
          return processingData.every((step: any) => 
            step.data?.processingPhotoUrls && step.data.processingPhotoUrls.length > 0
          )
        },
        warning: 'All steps must have photos before sealing',
        required: true
      },
      {
        name: 'hasValidDescriptions',
        check: async (passport, ipfsData) => {
          const processingData = ipfsData?.processingData || []
          return processingData.every((step: any) => 
            step.data?.description && step.data.description.trim().length >= 10
          )
        },
        warning: 'All processing steps need detailed descriptions (minimum 10 characters)',
        required: true
      },
      {
        name: 'meetsTimingRequirements',
        check: (passport) => {
          // Passport should exist for at least 1 hour before sealing
          const creationTime = Number(passport.dateCreated) * 1000
          const minimumAge = 60 * 60 * 1000 // 1 hour in milliseconds
          const currentTime = Date.now()
          
          return (currentTime - creationTime) >= minimumAge
        },
        warning: 'Passport must exist for at least 1 hour before sealing',
        required: false // This is a soft requirement
      }
    ]
  }

  /**
   * Comprehensive readiness check for passport sealing
   */
  async validateSealReadiness(passport: PassportData): Promise<SealReadinessCheck> {
    try {
      // Initialize result
      const result: SealReadinessCheck = {
        hasHarvestData: false,
        hasMinimumProcessingSteps: false,
        hasRequiredPhotos: false,
        hasValidDescriptions: false,
        meetsTimingRequirements: false,
        overallReady: false,
        warnings: []
      }

      // Basic validations first
      if (passport.isLocked || passport.status === 1) {
        result.warnings.push('Passport is already sealed and cannot be modified')
        return result
      }

      if (passport.status === 2) {
        result.warnings.push('Passport has been withdrawn and cannot be sealed')
        return result
      }

      // Load IPFS data for detailed validation
      const ipfsData: any = {}
      
      try {
        // Load harvest data
        if (passport.harvestHash) {
          ipfsData.harvestData = await this.ipfsService.retrieveData(passport.harvestHash as any)
        }

        // Load processing step data
        if (passport.processingHashes.length > 0) {
          ipfsData.processingData = await Promise.all(
            passport.processingHashes.map(hash => 
              this.ipfsService.retrieveData(hash as any).catch(err => {
                console.warn(`Failed to load processing step ${hash}:`, err)
                return null
              })
            )
          )
          // Filter out failed loads
          ipfsData.processingData = ipfsData.processingData.filter(Boolean)
        }
      } catch (error) {
        console.warn('Failed to load some IPFS data for validation:', error)
        result.warnings.push('Some passport data could not be loaded for validation')
      }

      // Run all validation rules
      for (const rule of this.rules) {
        try {
          const checkResult = await rule.check(passport, ipfsData)
          
          // Map rule name to result property
          const resultKey = rule.name as keyof Omit<SealReadinessCheck, 'overallReady' | 'warnings'>
          if (resultKey in result) {
            (result as any)[resultKey] = checkResult
          }

          // Add warning if rule fails and has a warning message
          if (!checkResult && rule.warning) {
            result.warnings.push(rule.warning)
          }

        } catch (error) {
          console.error(`Validation rule '${rule.name}' failed:`, error)
          result.warnings.push(`Failed to validate ${rule.name}`)
        }
      }

      // Determine overall readiness
      const requiredRules = this.rules.filter(rule => rule.required)
      const requiredPassing = requiredRules.every(rule => {
        const resultKey = rule.name as keyof Omit<SealReadinessCheck, 'overallReady' | 'warnings'>
        return (result as any)[resultKey] === true
      })

      result.overallReady = requiredPassing && result.warnings.length === 0

      // Add summary information
      if (result.overallReady) {
        result.warnings.unshift('✅ Passport is ready for sealing')
      } else {
        const failedRequired = requiredRules.filter(rule => {
          const resultKey = rule.name as keyof Omit<SealReadinessCheck, 'overallReady' | 'warnings'>
          return (result as any)[resultKey] !== true
        })
        
        if (failedRequired.length > 0) {
          result.warnings.unshift(`❌ ${failedRequired.length} required validation(s) failed`)
        }
      }

      return result

    } catch (error) {
      console.error('Passport readiness validation failed:', error)
      return {
        hasHarvestData: false,
        hasMinimumProcessingSteps: false,
        hasRequiredPhotos: false,
        hasValidDescriptions: false,
        meetsTimingRequirements: false,
        overallReady: false,
        warnings: [
          'Validation failed due to an error. Please try again.',
          error instanceof Error ? error.message : 'Unknown error'
        ]
      }
    }
  }

  /**
   * Quick validation check for UI feedback
   */
  async quickValidation(passport: PassportData): Promise<{ ready: boolean; issues: number }> {
    try {
      const result = await this.validateSealReadiness(passport)
      return {
        ready: result.overallReady,
        issues: result.warnings.filter(w => w.startsWith('❌')).length
      }
    } catch (error) {
      return { ready: false, issues: 1 }
    }
  }

  /**
   * Get validation summary for display
   */
  getValidationSummary(check: SealReadinessCheck): {
    title: string
    status: 'ready' | 'warning' | 'error'
    description: string
  } {
    if (check.overallReady) {
      return {
        title: 'Ready for Sealing',
        status: 'ready',
        description: 'All requirements met. Your passport can be sealed permanently.'
      }
    }

    const errorCount = check.warnings.filter(w => w.includes('required')).length
    const warningCount = check.warnings.length - errorCount

    if (errorCount > 0) {
      return {
        title: 'Cannot Seal Yet',
        status: 'error', 
        description: `${errorCount} required validation(s) failed. Please address these issues before sealing.`
      }
    }

    return {
      title: 'Minor Issues',
      status: 'warning',
      description: `${warningCount} warning(s) found. You may proceed with caution.`
    }
  }

  /**
   * Add custom validation rule
   */
  addRule(rule: SealReadinessRule) {
    this.rules.push(rule)
  }

  /**
   * Remove validation rule by name
   */
  removeRule(name: string) {
    this.rules = this.rules.filter(rule => rule.name !== name)
  }

  /**
   * Get all validation rules
   */
  getRules(): readonly SealReadinessRule[] {
    return this.rules
  }
}