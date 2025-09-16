import { useState, useCallback, useMemo } from 'react'
import { useSpicePassportService } from './useSpicePassportService'
import { PassportReadinessService, type SealReadinessCheck } from '@/lib/validation/PassportReadinessService'
import { type PassportData } from '@/lib/contracts/SpicePassportService'
import type { Hash } from 'viem'

export interface SealResult {
  success: boolean
  transactionHash?: Hash
  blockNumber?: number
  gasUsed?: bigint
  error?: string
}

export interface GasEstimate {
  gasLimit: bigint
  gasPrice: bigint
  estimatedCost: bigint
}

export function usePassportSealing(batchId: number) {
  const spicePassportService = useSpicePassportService()
  const [isSealing, setIsSealing] = useState(false)
  const [sealResult, setSealResult] = useState<SealResult | undefined>(undefined)
  const [readinessCheck, setReadinessCheck] = useState<SealReadinessCheck | undefined>(undefined)
  const [gasEstimate, setGasEstimate] = useState<GasEstimate | undefined>(undefined)
  
  // Initialize services
  const readinessService = useMemo(() => new PassportReadinessService(), [])

  /**
   * Validate passport readiness for sealing
   */
  const validateReadiness = useCallback(async (): Promise<SealReadinessCheck> => {
    if (!spicePassportService) {
      throw new Error('Wallet not connected')
    }

    try {
      // Get passport data from blockchain
      const passport = await spicePassportService.getPassport(batchId)
      if (!passport) {
        throw new Error('Passport not found')
      }

      // Validate readiness
      const check = await readinessService.validateSealReadiness(passport)
      setReadinessCheck(check)
      
      return check
    } catch (error) {
      const failedCheck: SealReadinessCheck = {
        hasHarvestData: false,
        hasMinimumProcessingSteps: false,
        hasRequiredPhotos: false,
        hasValidDescriptions: false,
        meetsTimingRequirements: false,
        overallReady: false,
        warnings: [
          'Failed to validate passport readiness',
          error instanceof Error ? error.message : 'Unknown error'
        ]
      }
      setReadinessCheck(failedCheck)
      throw error
    }
  }, [spicePassportService, batchId, readinessService])

  /**
   * Get gas estimation for sealing
   */
  const estimateGas = useCallback(async (): Promise<GasEstimate> => {
    if (!spicePassportService) {
      throw new Error('Wallet not connected')
    }

    try {
      const estimate = await spicePassportService.getLockPassportGasEstimate(batchId)
      setGasEstimate(estimate)
      return estimate
    } catch (error) {
      console.error('Failed to estimate gas:', error)
      throw error
    }
  }, [spicePassportService, batchId])

  /**
   * Seal the passport permanently
   */
  const sealPassport = useCallback(async (): Promise<SealResult> => {
    if (!spicePassportService) {
      throw new Error('Wallet not connected')
    }

    setIsSealing(true)
    setSealResult(undefined)

    try {
      // Final validation before sealing
      const currentReadiness = await validateReadiness()
      if (!currentReadiness.overallReady) {
        throw new Error('Passport validation failed. Please address all issues before sealing.')
      }

      // Execute the seal transaction
      const result = await spicePassportService.lockPassport(batchId)
      
      const sealResult: SealResult = {
        success: true,
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber,
        gasUsed: result.gasUsed
      }

      setSealResult(sealResult)
      return sealResult

    } catch (error) {
      console.error('Failed to seal passport:', error)
      
      const errorResult: SealResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }

      setSealResult(errorResult)
      return errorResult
    } finally {
      setIsSealing(false)
    }
  }, [spicePassportService, batchId, validateReadiness])

  /**
   * Reset sealing state
   */
  const resetSealingState = useCallback(() => {
    setSealResult(undefined)
    setIsSealing(false)
  }, [])

  /**
   * Initialize validation and gas estimation
   */
  const initialize = useCallback(async () => {
    try {
      await Promise.allSettled([
        validateReadiness(),
        estimateGas()
      ])
    } catch (error) {
      console.warn('Failed to fully initialize sealing service:', error)
    }
  }, [validateReadiness, estimateGas])

  return {
    // State
    isSealing,
    sealResult,
    readinessCheck,
    gasEstimate,

    // Actions
    validateReadiness,
    estimateGas,
    sealPassport,
    resetSealingState,
    initialize,

    // Computed values
    isReady: readinessCheck?.overallReady || false,
    hasGasEstimate: !!gasEstimate,
    hasValidated: !!readinessCheck,
    
    // Helper functions
    getValidationSummary: readinessCheck ? 
      () => readinessService.getValidationSummary(readinessCheck) : 
      undefined
  }
}