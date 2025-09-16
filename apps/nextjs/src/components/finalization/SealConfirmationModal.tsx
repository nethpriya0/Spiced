import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { 
  Lock, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  ExternalLink,
  Copy
} from 'lucide-react'
import { PassportSummary } from './PassportSummary'
import { type Hash } from 'viem'

interface GasEstimate {
  gasLimit: bigint
  gasPrice: bigint
  estimatedCost: bigint
}

interface SealReadinessCheck {
  hasHarvestData: boolean
  hasMinimumProcessingSteps: boolean
  hasRequiredPhotos: boolean
  hasValidDescriptions: boolean
  meetsTimingRequirements: boolean
  overallReady: boolean
  warnings: string[]
}

interface SealConfirmationModalProps {
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
  gasEstimate?: GasEstimate
  readinessCheck?: SealReadinessCheck
  onConfirm: () => Promise<void>
  onCancel: () => void
  isSealing?: boolean
  sealResult?: {
    success: boolean
    transactionHash?: Hash
    error?: string
    blockNumber?: number
  }
  onValidationRequested?: () => Promise<SealReadinessCheck>
  className?: string
}

type ConfirmationStep = 'review' | 'warning' | 'confirm' | 'processing' | 'success' | 'error'

export function SealConfirmationModal({
  passport,
  farmerName,
  contractAddress,
  gasEstimate,
  readinessCheck,
  onConfirm,
  onCancel,
  isSealing = false,
  sealResult,
  onValidationRequested,
  className = ''
}: SealConfirmationModalProps) {
  const [currentStep, setCurrentStep] = useState<ConfirmationStep>('review')
  const [confirmationText, setConfirmationText] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [copied, setCopied] = useState(false)
  const [validationInProgress, setValidationInProgress] = useState(false)
  const [localReadinessCheck, setLocalReadinessCheck] = useState<SealReadinessCheck | null>(readinessCheck || null)

  const requiredConfirmationText = 'SEAL PASSPORT'
  const minimumConfirmationTime = 3000 // 3 seconds minimum before allowing confirmation
  const [confirmationStartTime, setConfirmationStartTime] = useState<number | null>(null)

  // Validate passport readiness on mount
  useEffect(() => {
    if (!localReadinessCheck && onValidationRequested) {
      setValidationInProgress(true)
      onValidationRequested()
        .then(check => {
          setLocalReadinessCheck(check)
          if (!check.overallReady) {
            setCurrentStep('review') // Show validation issues
          }
        })
        .catch(error => {
          console.error('Readiness validation failed:', error)
          setLocalReadinessCheck({
            hasHarvestData: false,
            hasMinimumProcessingSteps: false,
            hasRequiredPhotos: false,
            hasValidDescriptions: false,
            meetsTimingRequirements: false,
            overallReady: false,
            warnings: ['Unable to validate passport readiness. Please try again.']
          })
        })
        .finally(() => setValidationInProgress(false))
    }
  }, [localReadinessCheck, onValidationRequested])

  // Update step based on sealing state
  useEffect(() => {
    if (isSealing) {
      setCurrentStep('processing')
    } else if (sealResult) {
      setCurrentStep(sealResult.success ? 'success' : 'error')
    }
  }, [isSealing, sealResult])

  // Track confirmation timing
  useEffect(() => {
    if (currentStep === 'confirm') {
      setConfirmationStartTime(Date.now())
    }
  }, [currentStep])

  const validateSealReadiness = (): SealReadinessCheck => {
    const now = Date.now()
    const createdTime = new Date(passport.dateCreated).getTime()
    const timeSinceCreation = now - createdTime
    
    return {
      hasHarvestData: !!passport.harvestHash,
      hasMinimumProcessingSteps: passport.processingHashes.length >= 1,
      hasRequiredPhotos: passport.processingHashes.length > 0, // Assuming photos are required
      hasValidDescriptions: passport.totalSteps ? passport.totalSteps >= 1 : true,
      meetsTimingRequirements: timeSinceCreation > 300000, // 5 minutes minimum
      overallReady: true,
      warnings: []
    }
  }

  const handleConfirm = async () => {
    // Validation checks
    if (confirmationText !== requiredConfirmationText || !agreedToTerms) {
      return
    }

    // Time-based protection against rushed decisions
    if (confirmationStartTime && Date.now() - confirmationStartTime < minimumConfirmationTime) {
      return
    }

    // Final readiness check
    const currentReadiness = localReadinessCheck || validateSealReadiness()
    if (!currentReadiness.overallReady) {
      console.error('Cannot seal passport - readiness check failed')
      return
    }

    setCurrentStep('processing')
    try {
      await onConfirm()
    } catch (error) {
      console.error('Seal confirmation failed:', error)
      setCurrentStep('error')
    }
  }

  const copyTransactionHash = async () => {
    if (sealResult?.transactionHash) {
      await navigator.clipboard.writeText(sealResult.transactionHash)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatEthValue = (wei: bigint): string => {
    const eth = Number(wei) / 1e18
    return `${eth.toFixed(6)} ETH`
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 'review': return 'Review Passport Data'
      case 'warning': return 'Important Warning'
      case 'confirm': return 'Final Confirmation'
      case 'processing': return 'Sealing Passport...'
      case 'success': return 'Passport Sealed Successfully!'
      case 'error': return 'Sealing Failed'
      default: return 'Seal Passport'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${className}`}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {getStepTitle()}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Batch #{passport.batchId} - {passport.spiceType}
              </p>
            </div>
            
            {/* Step indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                ['review', 'warning', 'confirm'].includes(currentStep) 
                  ? 'bg-blue-100 text-blue-600' 
                  : currentStep === 'processing'
                  ? 'bg-yellow-100 text-yellow-600'
                  : currentStep === 'success'
                  ? 'bg-green-100 text-green-600'
                  : 'bg-red-100 text-red-600'
              }`}>
                {currentStep === 'processing' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : currentStep === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : currentStep === 'error' ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
              </div>
              
              {currentStep !== 'success' && currentStep !== 'error' && (
                <button
                  onClick={onCancel}
                  disabled={currentStep === 'processing'}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Review Step */}
          {currentStep === 'review' && (
            <div className="space-y-6">
              {validationInProgress ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <div className="text-gray-600">Validating passport readiness...</div>
                </div>
              ) : (
                <>
                  <div className="text-sm text-gray-600">
                    Review all passport data before sealing. Once sealed, this data becomes immutable.
                  </div>
                  
                  {/* Readiness Check Results */}
                  {localReadinessCheck && (
                    <div className={`border rounded-lg p-4 ${localReadinessCheck.overallReady ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
                      <h4 className={`font-medium mb-3 ${localReadinessCheck.overallReady ? 'text-green-900' : 'text-yellow-900'}`}>
                        Passport Readiness Check
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div className={`flex items-center gap-2 ${localReadinessCheck.hasHarvestData ? 'text-green-700' : 'text-red-700'}`}>
                          {localReadinessCheck.hasHarvestData ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                          Harvest data recorded
                        </div>
                        <div className={`flex items-center gap-2 ${localReadinessCheck.hasMinimumProcessingSteps ? 'text-green-700' : 'text-red-700'}`}>
                          {localReadinessCheck.hasMinimumProcessingSteps ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                          Processing steps added
                        </div>
                        <div className={`flex items-center gap-2 ${localReadinessCheck.hasRequiredPhotos ? 'text-green-700' : 'text-red-700'}`}>
                          {localReadinessCheck.hasRequiredPhotos ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                          Photos uploaded
                        </div>
                        <div className={`flex items-center gap-2 ${localReadinessCheck.meetsTimingRequirements ? 'text-green-700' : 'text-red-700'}`}>
                          {localReadinessCheck.meetsTimingRequirements ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                          Timing requirements met
                        </div>
                      </div>
                      
                      {localReadinessCheck.warnings.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {localReadinessCheck.warnings.map((warning, index) => (
                            <div key={index} className="text-sm text-yellow-800 flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              {warning}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <PassportSummary
                    passport={passport}
                    farmerName={farmerName}
                    contractAddress={contractAddress}
                    className="border-0 shadow-none"
                  />

                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={onCancel}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => setCurrentStep('warning')}
                      disabled={!localReadinessCheck?.overallReady}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                    >
                      {localReadinessCheck?.overallReady ? 'Continue' : 'Complete Requirements First'}
                      {localReadinessCheck?.overallReady && <ArrowRight className="h-4 w-4 ml-2" />}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Warning Step */}
          {currentStep === 'warning' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-8 w-8 text-yellow-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-900 mb-3">
                      This Action is Permanent
                    </h3>
                    
                    <div className="space-y-3 text-yellow-800">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <strong>No More Edits:</strong> Once sealed, you cannot add processing steps, change descriptions, or modify any data.
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <strong>Immutable Record:</strong> The passport becomes a permanent blockchain record that cannot be deleted or altered.
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <strong>Marketplace Ready:</strong> Sealed passports can be listed for sale but the provenance data is locked forever.
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <strong>Gas Cost:</strong> This transaction will cost approximately{' '}
                          {gasEstimate ? formatEthValue(gasEstimate.estimatedCost) : 'calculating...'} to complete.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">What happens after sealing?</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <div>✅ Passport becomes immutable proof of provenance</div>
                  <div>✅ Ready for marketplace listing and sales</div>
                  <div>✅ QR code provides permanent verification</div>
                  <div>✅ Buyers can trust the complete history</div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep('review')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Review
                </Button>
                
                <Button 
                  onClick={() => setCurrentStep('confirm')}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  I Understand, Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Confirmation Step */}
          {currentStep === 'confirm' && (
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Lock className="h-6 w-6 text-red-600" />
                  <h3 className="text-lg font-semibold text-red-900">
                    Final Confirmation Required
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div className="text-red-800">
                    Type <strong>&quot;{requiredConfirmationText}&quot;</strong> to confirm you want to permanently seal this passport:
                  </div>
                  
                  <input
                    type="text"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value.toUpperCase())}
                    placeholder={requiredConfirmationText}
                    className={`w-full px-4 py-3 border rounded-lg font-mono text-center text-lg ${
                      confirmationText === requiredConfirmationText
                        ? 'border-green-300 bg-green-50 text-green-800'
                        : confirmationText.length > 0
                        ? 'border-red-300 bg-red-50 text-red-800'
                        : 'border-gray-300'
                    }`}
                  />
                  
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-red-800">
                      I understand this action is permanent and cannot be undone
                    </span>
                  </label>
                </div>
              </div>

              {gasEstimate && (
                <div className="bg-gray-50 border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Transaction Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Gas Limit:</span>
                      <div className="font-mono">{gasEstimate.gasLimit.toString()}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Gas Price:</span>
                      <div className="font-mono">{(Number(gasEstimate.gasPrice) / 1e9).toFixed(2)} Gwei</div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Estimated Cost:</span>
                      <div className="font-mono text-lg">{formatEthValue(gasEstimate.estimatedCost)}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep('warning')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Warning
                </Button>
                
                <Button
                  onClick={handleConfirm}
                  disabled={
                    confirmationText !== requiredConfirmationText || 
                    !agreedToTerms || 
                    (confirmationStartTime ? Date.now() - confirmationStartTime < minimumConfirmationTime : true)
                  }
                  className="bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  {confirmationStartTime && Date.now() - confirmationStartTime < minimumConfirmationTime
                    ? `Please wait ${Math.ceil((minimumConfirmationTime - (Date.now() - confirmationStartTime)) / 1000)}s`
                    : 'Seal Passport Permanently'
                  }
                </Button>
              </div>
            </div>
          )}

          {/* Processing Step */}
          {currentStep === 'processing' && (
            <div className="text-center py-12 space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-yellow-600 animate-spin" />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Sealing Your Passport
                </h3>
                <p className="text-gray-600">
                  Please wait while we record your passport on the blockchain...
                </p>
              </div>
              
              <div className="text-sm text-gray-500">
                This may take a few moments to complete
              </div>
            </div>
          )}

          {/* Success Step */}
          {currentStep === 'success' && (
            <div className="text-center py-8 space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Passport Sealed Successfully!
                </h3>
                <p className="text-gray-600">
                  Your spice passport is now immutable and ready for the marketplace
                </p>
              </div>

              {sealResult?.transactionHash && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-sm text-green-800 mb-2">Blockchain Confirmation:</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <code className="text-sm font-mono bg-white px-2 py-1 rounded border">
                        {sealResult.transactionHash.slice(0, 20)}...
                      </code>
                      <button
                        onClick={copyTransactionHash}
                        className="p-1 hover:bg-green-200 rounded"
                        title="Copy full hash"
                      >
                        <Copy className="h-4 w-4 text-green-600" />
                      </button>
                      <button
                        onClick={() => window.open(`https://sepolia.etherscan.io/tx/${sealResult.transactionHash}`, '_blank')}
                        className="p-1 hover:bg-green-200 rounded"
                        title="View on Etherscan"
                      >
                        <ExternalLink className="h-4 w-4 text-green-600" />
                      </button>
                    </div>
                    {sealResult.blockNumber && (
                      <div className="text-xs text-green-700 text-center">
                        Block: #{sealResult.blockNumber}
                      </div>
                    )}
                    {copied && (
                      <div className="text-xs text-green-600 text-center">Copied to clipboard!</div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">What&apos;s Next?</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <div>• List your sealed passport on the marketplace</div>
                    <div>• Share QR code with potential buyers</div>
                    <div>• Monitor offers and inquiries</div>
                  </div>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900 mb-2">Benefits</h4>
                  <div className="text-sm text-purple-800 space-y-1">
                    <div>• Immutable provenance proof</div>
                    <div>• Premium pricing potential</div>
                    <div>• Verified authenticity</div>
                  </div>
                </div>
              </div>

              <Button
                onClick={onCancel}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                Continue to My Products
              </Button>
            </div>
          )}

          {/* Error Step */}
          {currentStep === 'error' && (
            <div className="text-center py-8 space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Sealing Failed
                </h3>
                <p className="text-gray-600">
                  There was an error sealing your passport. Please try again.
                </p>
              </div>

              {sealResult?.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-sm text-red-800">
                    <strong>Error Details:</strong> {sealResult.error}
                  </div>
                </div>
              )}

              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button
                  onClick={() => setCurrentStep('confirm')}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SealConfirmationModal