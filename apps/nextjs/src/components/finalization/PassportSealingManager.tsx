import React, { useEffect, useState } from 'react'
import { SealConfirmationModal } from './SealConfirmationModal'
import { usePassportSealing } from '@/hooks/usePassportSealing'
import { useAuth } from '@/hooks/useAuth'
import { Loader2, AlertCircle } from 'lucide-react'

interface PassportSealingManagerProps {
  batchId: number
  passport: {
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
  }
  farmerName: string
  contractAddress: string
  onCancel: () => void
  onSuccess?: (transactionHash: string) => void
  className?: string
}

export function PassportSealingManager({
  batchId,
  passport,
  farmerName,
  contractAddress,
  onCancel,
  onSuccess,
  className = ''
}: PassportSealingManagerProps) {
  const { user } = useAuth()
  const {
    isSealing,
    sealResult,
    readinessCheck,
    gasEstimate,
    validateReadiness,
    estimateGas,
    sealPassport,
    initialize,
    isReady,
    hasGasEstimate,
    hasValidated
  } = usePassportSealing(batchId)

  const [initializationError, setInitializationError] = useState<string | null>(null)
  const [initializing, setInitializing] = useState(true)

  // Initialize sealing service on mount
  useEffect(() => {
    const initializeSealing = async () => {
      try {
        setInitializing(true)
        setInitializationError(null)
        await initialize()
      } catch (error) {
        console.error('Failed to initialize sealing service:', error)
        setInitializationError(error instanceof Error ? error.message : 'Failed to initialize')
      } finally {
        setInitializing(false)
      }
    }

    initializeSealing()
  }, [initialize])

  // Handle successful sealing
  useEffect(() => {
    if (sealResult?.success && sealResult.transactionHash) {
      onSuccess?.(sealResult.transactionHash)
    }
  }, [sealResult, onSuccess])

  // Show loading state during initialization
  if (initializing) {
    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 ${className}`}>
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Preparing to Seal Passport
            </h3>
            <p className="text-gray-600 mb-4">
              Validating passport data and estimating gas costs...
            </p>
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show initialization error
  if (initializationError) {
    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 ${className}`}>
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Initialization Failed
            </h3>
            <p className="text-gray-600 mb-4">
              {initializationError}
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Handle validation request
  const handleValidationRequested = async () => {
    try {
      return await validateReadiness()
    } catch (error) {
      console.error('Validation failed:', error)
      throw error
    }
  }

  // Handle seal confirmation
  const handleConfirm = async () => {
    try {
      const result = await sealPassport()
      if (!result.success) {
        throw new Error(result.error || 'Sealing failed')
      }
    } catch (error) {
      console.error('Sealing failed:', error)
      throw error
    }
  }

  // Create the seal result for the modal
  const modalSealResult = sealResult ? {
    success: sealResult.success,
    transactionHash: sealResult.transactionHash,
    blockNumber: sealResult.blockNumber,
    error: sealResult.error
  } : undefined

  return (
    <SealConfirmationModal
      passport={passport}
      farmerName={farmerName}
      contractAddress={contractAddress}
      gasEstimate={gasEstimate}
      readinessCheck={readinessCheck}
      onConfirm={handleConfirm}
      onCancel={onCancel}
      isSealing={isSealing}
      sealResult={modalSealResult}
      onValidationRequested={handleValidationRequested}
      className={className}
    />
  )
}

export default PassportSealingManager