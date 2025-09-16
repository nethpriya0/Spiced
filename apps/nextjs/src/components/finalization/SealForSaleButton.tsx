import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Lock, AlertTriangle, CheckCircle, Clock, Loader2 } from 'lucide-react'
import { SealConfirmationModal } from './SealConfirmationModal'
import { validateSealReadiness, type SealReadinessCheck, type PassportValidationData } from '@/lib/validation/sealValidation'
import { type Hash } from 'viem'

interface GasEstimate {
  gasLimit: bigint
  gasPrice: bigint
  estimatedCost: bigint
}

interface SealForSaleButtonProps {
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
    processingStepCount?: number // Legacy support
  }
  farmerName: string
  contractAddress: string
  currentAddress?: string
  onSeal: (batchId: number) => Promise<void>
  onGasEstimate?: (batchId: number) => Promise<GasEstimate>
  className?: string
  variant?: 'default' | 'compact'
}

export function SealForSaleButton({
  passport,
  farmerName,
  contractAddress,
  currentAddress,
  onSeal,
  onGasEstimate,
  className = '',
  variant = 'default'
}: SealForSaleButtonProps) {
  const [showReadinessCheck, setShowReadinessCheck] = useState(false)
  const [showSealModal, setShowSealModal] = useState(false)
  const [readinessCheck, setReadinessCheck] = useState<SealReadinessCheck | null>(null)
  const [gasEstimate, setGasEstimate] = useState<GasEstimate | null>(null)
  const [isSealing, setIsSealing] = useState(false)
  const [sealResult, setSealResult] = useState<{ success: boolean; transactionHash?: Hash; error?: string } | null>(null)
  const [validatingReadiness, setValidatingReadiness] = useState(false)

  // Convert passport to validation format
  const validationPassport: PassportValidationData = {
    batchId: passport.batchId,
    spiceType: passport.spiceType,
    totalWeight: passport.totalWeight,
    dateCreated: passport.dateCreated,
    harvestHash: passport.harvestHash,
    processingHashes: passport.processingHashes,
    isLocked: passport.isLocked,
    statusText: passport.statusText,
    owner: passport.owner,
    qualityClaims: passport.qualityClaims,
    totalSteps: passport.totalSteps || passport.processingStepCount || 0
  }

  // Validate readiness on component mount and passport changes
  useEffect(() => {
    const validatePassport = async () => {
      setValidatingReadiness(true)
      try {
        const check = validateSealReadiness(validationPassport)
        setReadinessCheck(check)
      } catch (error) {
        console.error('Readiness validation failed:', error)
        setReadinessCheck({
          hasHarvestData: false,
          hasMinimumProcessingSteps: false,
          hasRequiredPhotos: false,
          hasValidDescriptions: false,
          meetsTimingRequirements: false,
          hasQualityClaims: false,
          overallReady: false,
          warnings: ['Validation failed. Please try again.'],
          score: 0
        })
      } finally {
        setValidatingReadiness(false)
      }
    }

    validatePassport()
  }, [passport.batchId, passport.dateCreated, passport.processingHashes.length])

  const readinessScore = readinessCheck?.score || 0
  const isReady = readinessCheck?.overallReady || false

  const canSeal = passport.statusText === 'In Progress' && !passport.isLocked && isReady && currentAddress?.toLowerCase() === passport.owner.toLowerCase()

  const getReadinessColor = () => {
    if (readinessScore >= 90) return 'text-green-600'
    if (readinessScore >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getReadinessIcon = () => {
    if (validatingReadiness) return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
    if (readinessScore >= 90) return <CheckCircle className="h-4 w-4 text-green-500" />
    if (readinessScore >= 70) return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    return <Clock className="h-4 w-4 text-red-500" />
  }

  const handleSealClick = async () => {
    if (!canSeal) {
      setShowReadinessCheck(true)
      return
    }

    // Get gas estimate if available
    if (onGasEstimate) {
      try {
        const estimate = await onGasEstimate(passport.batchId)
        setGasEstimate(estimate)
      } catch (error) {
        console.error('Gas estimation failed:', error)
      }
    }

    setShowSealModal(true)
  }

  const handleConfirmSeal = async () => {
    setIsSealing(true)
    setSealResult(null)
    
    try {
      await onSeal(passport.batchId)
      setSealResult({ success: true })
    } catch (error) {
      console.error('Sealing failed:', error)
      setSealResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      })
    } finally {
      setIsSealing(false)
    }
  }

  const handleModalClose = () => {
    setShowSealModal(false)
    setSealResult(null)
    setGasEstimate(null)
  }

  if (passport.statusText === 'Locked' || passport.isLocked) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Lock className="h-4 w-4 text-green-600" />
        <span className="text-sm font-medium text-green-600">Sealed</span>
      </div>
    )
  }

  if (passport.statusText !== 'In Progress') {
    return null
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={canSeal ? handleSealClick : () => setShowReadinessCheck(true)}
        disabled={!canSeal && readinessScore < 50}
        className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
          canSeal
            ? 'bg-green-100 text-green-800 hover:bg-green-200'
            : readinessScore >= 70
            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
            : 'bg-gray-100 text-gray-500 cursor-not-allowed'
        } ${className}`}
      >
        <Lock className="h-4 w-4" />
        {canSeal ? 'Seal' : 'Not Ready'}
      </button>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Readiness Indicator */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          {getReadinessIcon()}
          <span className={`text-sm font-medium ${getReadinessColor()}`}>
            Readiness: {readinessScore}%
          </span>
        </div>
        
        <button
          onClick={() => setShowReadinessCheck(!showReadinessCheck)}
          className="text-xs text-gray-600 hover:text-gray-800"
        >
          {showReadinessCheck ? 'Hide' : 'View'} Details
        </button>
      </div>

      {/* Readiness Checklist */}
      {showReadinessCheck && readinessCheck && (
        <div className="p-3 bg-white border rounded-lg space-y-2">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Seal Readiness Checklist</h4>
          
          <div className="space-y-1">
            <div className={`flex items-center gap-2 text-sm ${readinessCheck.hasHarvestData ? 'text-gray-700' : 'text-red-600'}`}>
              {readinessCheck.hasHarvestData ? <CheckCircle className="h-3 w-3 text-green-500" /> : <Clock className="h-3 w-3 text-red-500" />}
              <span>Harvest data recorded</span>
            </div>
            <div className={`flex items-center gap-2 text-sm ${readinessCheck.hasMinimumProcessingSteps ? 'text-gray-700' : 'text-red-600'}`}>
              {readinessCheck.hasMinimumProcessingSteps ? <CheckCircle className="h-3 w-3 text-green-500" /> : <Clock className="h-3 w-3 text-red-500" />}
              <span>Processing steps completed</span>
            </div>
            <div className={`flex items-center gap-2 text-sm ${readinessCheck.hasRequiredPhotos ? 'text-gray-700' : 'text-red-600'}`}>
              {readinessCheck.hasRequiredPhotos ? <CheckCircle className="h-3 w-3 text-green-500" /> : <Clock className="h-3 w-3 text-red-500" />}
              <span>Required photos uploaded</span>
            </div>
            <div className={`flex items-center gap-2 text-sm ${readinessCheck.hasValidDescriptions ? 'text-gray-700' : 'text-red-600'}`}>
              {readinessCheck.hasValidDescriptions ? <CheckCircle className="h-3 w-3 text-green-500" /> : <Clock className="h-3 w-3 text-red-500" />}
              <span>Descriptions completed</span>
            </div>
            <div className={`flex items-center gap-2 text-sm ${readinessCheck.meetsTimingRequirements ? 'text-gray-700' : 'text-red-600'}`}>
              {readinessCheck.meetsTimingRequirements ? <CheckCircle className="h-3 w-3 text-green-500" /> : <Clock className="h-3 w-3 text-red-500" />}
              <span>Timing requirements met</span>
            </div>
            <div className={`flex items-center gap-2 text-sm ${readinessCheck.hasQualityClaims ? 'text-gray-700' : 'text-yellow-600'}`}>
              {readinessCheck.hasQualityClaims ? <CheckCircle className="h-3 w-3 text-green-500" /> : <AlertTriangle className="h-3 w-3 text-yellow-500" />}
              <span>Quality claims added {!readinessCheck.hasQualityClaims && '(optional)'}</span>
            </div>
          </div>
          
          {readinessCheck.warnings.length > 0 && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
              {readinessCheck.warnings.map((warning, index) => (
                <div key={index} className="text-xs text-yellow-800 flex items-start gap-2">
                  <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  {warning}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Seal Button */}
      <Button
        onClick={handleSealClick}
        disabled={!canSeal}
        className={`w-full ${
          canSeal
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
        size="lg"
      >
        <Lock className="h-5 w-5 mr-2" />
        {canSeal ? 'Seal for Sale' : 'Complete Requirements First'}
      </Button>

      {canSeal && (
        <div className="text-xs text-gray-600 text-center">
          ⚠️ Once sealed, this passport becomes immutable and ready for marketplace listing
        </div>
      )}

      {/* Seal Confirmation Modal */}
      {showSealModal && (
        <SealConfirmationModal
          passport={validationPassport}
          farmerName={farmerName}
          contractAddress={contractAddress}
          gasEstimate={gasEstimate || undefined}
          readinessCheck={readinessCheck || undefined}
          onConfirm={handleConfirmSeal}
          onCancel={handleModalClose}
          isSealing={isSealing}
          sealResult={sealResult || undefined}
          onValidationRequested={async () => {
            const check = validateSealReadiness(validationPassport)
            return check
          }}
        />
      )}
    </div>
  )
}

// Removed getCheckDescription as it's no longer needed

export default SealForSaleButton