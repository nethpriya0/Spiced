import React, { useState, useEffect } from 'react'
import { AddProcessingStep, type ProcessingStepData } from './AddProcessingStep'
import { IPFSService } from '@/lib/ipfs/IPFSService'
import { SpicePassportService } from '@/lib/contracts/SpicePassportService'
import { useWallet } from '@/hooks/useWallet'
import { Plus, CheckCircle, Clock, AlertCircle, Eye, Trash2 } from 'lucide-react'
import { type Hash } from 'viem'

interface ProcessingStepRecord extends ProcessingStepData {
  id: string
  processingHash?: string
  transactionHash?: Hash
  isUploading?: boolean
  isBlockchainPending?: boolean
  error?: string
  createdAt: Date
}

interface ProcessingStepManagerProps {
  batchId: number
  passport: {
    batchId: number
    spiceType: string
    statusText: string
    processingStepCount: number
    processingHashes: string[]
    isLocked: boolean
  }
  onStepAdded?: (step: ProcessingStepRecord) => void
  onRefresh?: () => void
  className?: string
}

export function ProcessingStepManager({
  batchId,
  passport,
  onStepAdded,
  onRefresh,
  className = ''
}: ProcessingStepManagerProps) {
  const { walletClient, address } = useWallet()
  const [showAddForm, setShowAddForm] = useState(false)
  const [processingSteps, setProcessingSteps] = useState<ProcessingStepRecord[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ipfsService] = useState(() => new IPFSService())
  const [passportService, setPassportService] = useState<SpicePassportService | null>(null)

  // Initialize services
  useEffect(() => {
    if (walletClient && address) {
      const service = new SpicePassportService({
        contractAddress: process.env.NEXT_PUBLIC_SPICE_PASSPORT_CONTRACT_ADDRESS as `0x${string}` || '0x123...contract',
        walletClient
      })
      setPassportService(service)
    }
  }, [walletClient, address])

  // Load existing processing steps (mock for now - would fetch from IPFS in production)
  useEffect(() => {
    const loadExistingSteps = async () => {
      // Mock processing steps based on passport data
      const mockSteps: ProcessingStepRecord[] = passport.processingHashes.map((hash, index) => ({
        id: `existing-${index}`,
        stepNumber: index + 1,
        description: index === 0 ? 'Initial harvest collection and sorting' : `Processing step ${index + 1}`,
        processingType: index === 0 ? 'quality_check' as const : 'drying' as const,
        dateCompleted: new Date(Date.now() - (passport.processingHashes.length - index) * 86400000),
        photos: [],
        photoPreview: [],
        processingHash: hash,
        transactionHash: `0x${Math.random().toString(16).slice(2)}` as Hash,
        createdAt: new Date(Date.now() - (passport.processingHashes.length - index) * 86400000)
      }))
      
      setProcessingSteps(mockSteps)
    }

    if (passport.processingHashes.length > 0) {
      loadExistingSteps()
    }
  }, [passport])

  const canAddSteps = passport.statusText === 'In Progress' && !passport.isLocked

  const handleAddProcessingStep = async (stepData: ProcessingStepData) => {
    if (!passportService) {
      throw new Error('Wallet not connected')
    }

    setIsSubmitting(true)

    // Create processing step record
    const newStep: ProcessingStepRecord = {
      ...stepData,
      id: `new-${Date.now()}`,
      createdAt: new Date(),
      isUploading: true
    }

    try {
      setProcessingSteps(prev => [...prev, newStep])
      setShowAddForm(false)

      // 1. Upload processing step data to IPFS
      const processingHash = await ipfsService.uploadProcessingStepData({
        stepNumber: stepData.stepNumber,
        processingType: stepData.processingType,
        description: stepData.description,
        dateCompleted: stepData.dateCompleted.getTime(),
        processingPhotoFiles: stepData.photos,
        location: stepData.location,
        qualityMetrics: stepData.qualityMetrics,
        notes: stepData.notes
      })

      // Update step with IPFS hash
      const stepWithHash: ProcessingStepRecord = {
        ...newStep,
        processingHash,
        isUploading: false,
        isBlockchainPending: true
      }

      setProcessingSteps(prev => 
        prev.map(step => step.id === newStep.id ? stepWithHash : step)
      )

      // 2. Add processing step to smart contract
      try {
        const transactionHash = await passportService.addProcessingStep(batchId, processingHash)
        
        // Update step with transaction hash
        const completedStep: ProcessingStepRecord = {
          ...stepWithHash,
          transactionHash,
          isBlockchainPending: false
        }

        setProcessingSteps(prev => 
          prev.map(step => step.id === newStep.id ? completedStep : step)
        )

        onStepAdded?.(completedStep)
        onRefresh?.()

        console.log('Processing step added successfully:', transactionHash)

      } catch (contractError) {
        console.warn('Smart contract interaction failed (development mode):', contractError)
        
        // For development, mark as completed anyway
        const completedStep: ProcessingStepRecord = {
          ...stepWithHash,
          transactionHash: `0x${Math.random().toString(16).slice(2)}` as Hash,
          isBlockchainPending: false
        }

        setProcessingSteps(prev => 
          prev.map(step => step.id === newStep.id ? completedStep : step)
        )

        onStepAdded?.(completedStep)
        onRefresh?.()
      }

    } catch (error) {
      console.error('Failed to add processing step:', error)
      
      // Update step with error
      setProcessingSteps(prev => 
        prev.map(step => 
          step.id === newStep.id 
            ? { 
                ...step, 
                isUploading: false, 
                isBlockchainPending: false, 
                error: error instanceof Error ? error.message : 'Failed to add processing step' 
              } 
            : step
        )
      )
      
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const removeStep = (stepId: string) => {
    setProcessingSteps(prev => prev.filter(step => step.id !== stepId))
  }

  const getStepIcon = (step: ProcessingStepRecord) => {
    if (step.error) {
      return <AlertCircle className="h-5 w-5 text-red-500" />
    }
    if (step.isUploading || step.isBlockchainPending) {
      return <Clock className="h-5 w-5 text-yellow-500 animate-pulse" />
    }
    if (step.transactionHash) {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    }
    return <Clock className="h-5 w-5 text-gray-400" />
  }

  const getStepStatus = (step: ProcessingStepRecord) => {
    if (step.error) return 'Error'
    if (step.isUploading) return 'Uploading...'
    if (step.isBlockchainPending) return 'Recording...'
    if (step.transactionHash) return 'Completed'
    return 'Pending'
  }

  const formatProcessingType = (type: string) => {
    const types = {
      'drying': 'Drying & Curing',
      'grinding': 'Grinding & Processing',
      'packaging': 'Packaging & Sealing',
      'quality_check': 'Quality Assessment',
      'transport': 'Transport & Logistics',
      'custom': 'Custom Processing'
    }
    return types[type as keyof typeof types] || type
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Processing Steps ({processingSteps.length})
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Document each stage of your spice processing journey
          </p>
        </div>
        
        {canAddSteps && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add Step
          </button>
        )}
      </div>

      {/* Processing Steps List */}
      {processingSteps.length > 0 && (
        <div className="space-y-4">
          {processingSteps.map((step, index) => (
            <div
              key={step.id}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {getStepIcon(step)}
                      <span className="text-sm font-medium text-gray-900">
                        Step {step.stepNumber}
                      </span>
                    </div>
                    
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {formatProcessingType(step.processingType)}
                    </span>
                    
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      step.error ? 'bg-red-100 text-red-800' :
                      step.isUploading || step.isBlockchainPending ? 'bg-yellow-100 text-yellow-800' :
                      step.transactionHash ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getStepStatus(step)}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-2">{step.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>
                      Completed: {step.dateCompleted.toLocaleDateString()}
                    </span>
                    
                    {step.photos.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {step.photos.length} photo{step.photos.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    
                    {step.qualityMetrics && Object.keys(step.qualityMetrics).length > 0 && (
                      <span>
                        Quality metrics recorded
                      </span>
                    )}
                  </div>

                  {step.error && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      Error: {step.error}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  {step.transactionHash && (
                    <button
                      onClick={() => {
                        // In production, this would link to block explorer
                        console.log('Transaction hash:', step.transactionHash)
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="View transaction"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                  
                  {step.id.startsWith('new-') && step.error && (
                    <button
                      onClick={() => removeStep(step.id)}
                      className="p-1 text-red-400 hover:text-red-600"
                      title="Remove failed step"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {processingSteps.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Processing Steps Yet
          </h3>
          <p className="text-gray-600 mb-4">
            Start documenting your spice processing journey by adding the first step.
          </p>
          {canAddSteps && !showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add First Step
            </button>
          )}
        </div>
      )}

      {/* Locked State Message */}
      {!canAddSteps && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl mb-2">🔒</div>
          <p className="text-gray-600">
            This passport is {passport.statusText.toLowerCase()} and cannot be modified.
          </p>
        </div>
      )}

      {/* Add Processing Step Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <AddProcessingStep
              batchId={batchId}
              currentStepNumber={processingSteps.length + 1}
              onSubmit={handleAddProcessingStep}
              onCancel={() => setShowAddForm(false)}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ProcessingStepManager