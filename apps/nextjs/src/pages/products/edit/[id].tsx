import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { withAuth } from '@/middleware/withAuth'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { useMyProducts } from '@/hooks/useMyProducts'
import { ProcessingStepManager } from '@/components/processing/ProcessingStepManager'
import { ImmutableStateGuard } from '@/components/passport/ImmutableStateGuard'
import { SealForSaleButton } from '@/components/finalization/SealForSaleButton'
import { SpicePassportService } from '@/lib/contracts/SpicePassportService'
import { useAuth } from '@/hooks/useAuth'
import { useWallet } from '@/hooks/useWallet'
import { 
  ArrowLeft, 
  Save, 
  Plus,
  X,
  Package, 
  Camera,
  FileText,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface ProcessingStep {
  id: string
  stepNumber: number
  description: string
  dateCompleted: Date
  photoFile?: File
  photoPreview?: string
  isNew?: boolean
}

const PassportEditPage: React.FC = () => {
  const router = useRouter()
  const { id, section } = router.query
  const { passports, loading, refetch: refreshPassports } = useMyProducts()
  const { user, isAuthenticated } = useAuth()
  const currentAddress = user?.address
  const { walletClient } = useWallet()
  
  const passport = passports.find(p => p.batchId.toString() === id)
  
  // Form states
  const [spiceType, setSpiceType] = useState('')
  const [weight, setWeight] = useState('')
  const [harvestDate, setHarvestDate] = useState('')
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([])
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState<'basic' | 'processing' | 'finalize'>('basic')
  const [passportService, setPassportService] = useState<SpicePassportService | null>(null)
  const [sealingComplete, setSealingComplete] = useState(false)
  
  // Initialize form data when passport loads
  useEffect(() => {
    if (passport) {
      setSpiceType(passport.spiceType)
      setWeight(passport.weightInKg.toString())
      setHarvestDate(passport.createdDate.toISOString().split('T')[0] || '')
      
      // Initialize processing steps (mock data for now)
      const mockSteps: ProcessingStep[] = Array.from({ length: passport.processingStepCount }).map((_, index) => ({
        id: `step-${index + 1}`,
        stepNumber: index + 1,
        description: index === 0 ? 'Harvest Collection' : `Processing Step ${index}`,
        dateCompleted: new Date(passport.createdDate.getTime() + (index * 86400000))
      }))
      setProcessingSteps(mockSteps)
      
      // Set active section based on URL parameter
      if (section === 'processing') {
        setActiveSection('processing')
      } else if (section === 'finalize') {
        setActiveSection('finalize')
      }
      
      // Initialize passport service
      if (walletClient && currentAddress && isAuthenticated) {
        try {
          const service = new SpicePassportService({
            contractAddress: process.env.NEXT_PUBLIC_SPICE_PASSPORT_CONTRACT as `0x${string}`,
            walletClient,
          })
          setPassportService(service)
        } catch (error) {
          console.error('Failed to initialize passport service:', error)
        }
      }
    }
  }, [passport, section, walletClient, currentAddress, isAuthenticated])
  
  if (loading) {
    return (
      <DashboardLayout title="Edit Product">
        <div className="flex-1 p-6 bg-slate-50">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="bg-white rounded-lg p-6">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-4">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }
  
  if (!passport || passport.statusText !== 'In Progress') {
    return (
      <DashboardLayout title="Cannot Edit Product">
        <div className="flex-1 p-6 bg-slate-50">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                Cannot Edit Product
              </h1>
              <p className="text-gray-600 mb-6">
                This product cannot be edited because it&apos;s {passport ? passport.statusText.toLowerCase() : 'not found'} or you don&apos;t have permission.
              </p>
              <button
                onClick={() => router.push('/products')}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
              >
                Back to My Products
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }
  
  const addProcessingStep = () => {
    const newStep: ProcessingStep = {
      id: `new-${Date.now()}`,
      stepNumber: processingSteps.length + 1,
      description: '',
      dateCompleted: new Date(),
      isNew: true
    }
    setProcessingSteps([...processingSteps, newStep])
    setHasChanges(true)
  }
  
  const updateProcessingStep = (id: string, field: keyof ProcessingStep, value: any) => {
    setProcessingSteps(steps => 
      steps.map(step => 
        step.id === id ? { ...step, [field]: value } : step
      )
    )
    setHasChanges(true)
  }
  
  const removeProcessingStep = (id: string) => {
    setProcessingSteps(steps => steps.filter(step => step.id !== id))
    setHasChanges(true)
  }
  
  const handleSealPassport = async (batchId: number) => {
    if (!passportService) {
      throw new Error('Passport service not available')
    }
    
    try {
      const result = await passportService.lockPassport(batchId)
      console.log('Passport sealed successfully:', result)
      
      // Refresh passport data
      await refreshPassports()
      setSealingComplete(true)
      
      // Redirect to view page after short delay
      setTimeout(() => {
        router.push(`/products/view/${batchId}`)
      }, 2000)
      
    } catch (error) {
      console.error('Failed to seal passport:', error)
      throw error
    }
  }
  
  const handleGasEstimate = async (batchId: number) => {
    if (!passportService) {
      throw new Error('Passport service not available')
    }
    
    return await passportService.getLockPassportGasEstimate(batchId)
  }
  
  const handlePhotoUpload = (stepId: string, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      updateProcessingStep(stepId, 'photoFile', file)
      updateProcessingStep(stepId, 'photoPreview', e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }
  
  const handleSave = async () => {
    setSaving(true)
    try {
      // TODO: Implement actual save logic
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setHasChanges(false)
      router.push(`/products/view/${passport.batchId}`)
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setSaving(false)
    }
  }
  
  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        router.back()
      }
    } else {
      router.back()
    }
  }

  // Convert passport data to PassportData format for ImmutableStateGuard
  const passportData = passport ? {
    batchId: BigInt(passport.batchId),
    owner: passport.owner as `0x${string}`,
    spiceType: passport.spiceType,
    totalWeight: BigInt(passport.totalWeight * 1000), // Convert kg to grams
    dateCreated: BigInt(Math.floor(passport.createdDate.getTime() / 1000)),
    isLocked: passport.isLocked,
    harvestHash: passport.harvestHash,
    processingHashes: [], // This would be loaded from IPFS
    packageHash: '',
    status: passport.status
  } : null
  
  return (
    <DashboardLayout title={`Edit Product ${passport?.batchId || 'Loading'}`}>
      <ImmutableStateGuard passport={passportData} loading={loading} redirectUrl="/products">
      <div className="flex-1 p-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-md transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Edit {passport.spiceType}
                </h1>
                <p className="text-gray-600">Batch ID: {passport.batchId}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {hasChanges && (
                <span className="text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded">
                  Unsaved changes
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
          
          {/* Section Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                <button
                  onClick={() => setActiveSection('basic')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeSection === 'basic'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Package className="h-4 w-4 inline mr-2" />
                  Basic Details
                </button>
                <button
                  onClick={() => setActiveSection('processing')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeSection === 'processing'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FileText className="h-4 w-4 inline mr-2" />
                  Processing Steps ({processingSteps.length})
                </button>
                
                {passport.statusText === 'In Progress' && passport.processingStepCount > 0 && (
                  <button
                    onClick={() => setActiveSection('finalize')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeSection === 'finalize'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <CheckCircle className="h-4 w-4 inline mr-2" />
                    Finalize & Seal
                  </button>
                )}
              </nav>
            </div>
            
            {/* Basic Details Section */}
            {activeSection === 'basic' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Product Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Spice Type
                    </label>
                    <select
                      value={spiceType}
                      onChange={(e) => {
                        setSpiceType(e.target.value)
                        setHasChanges(true)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="Ceylon Cinnamon">Ceylon Cinnamon</option>
                      <option value="Ceylon Cardamom">Ceylon Cardamom</option>
                      <option value="Ceylon Pepper">Ceylon Pepper</option>
                      <option value="Ceylon Cloves">Ceylon Cloves</option>
                      <option value="Ceylon Nutmeg">Ceylon Nutmeg</option>
                      <option value="Ceylon Mace">Ceylon Mace</option>
                      <option value="Vanilla">Vanilla</option>
                      <option value="Turmeric">Turmeric</option>
                      <option value="Ginger">Ginger</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={weight}
                      onChange={(e) => {
                        setWeight(e.target.value)
                        setHasChanges(true)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Harvest Date
                    </label>
                    <input
                      type="date"
                      value={harvestDate}
                      onChange={(e) => {
                        setHarvestDate(e.target.value)
                        setHasChanges(true)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Processing Steps Section */}
            {activeSection === 'processing' && (
              <div className="p-6">
                <ProcessingStepManager
                  batchId={passport.batchId}
                  passport={{
                    batchId: passport.batchId,
                    spiceType: passport.spiceType,
                    statusText: passport.statusText,
                    processingStepCount: passport.processingStepCount,
                    processingHashes: passport.processingHashes,
                    isLocked: passport.isLocked
                  }}
                  onStepAdded={(step) => {
                    console.log('Processing step added:', step)
                    setHasChanges(true)
                  }}
                  onRefresh={() => {
                    // Refresh passport data
                    router.reload()
                  }}
                />
                
                {processingSteps.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm mb-4">No processing steps added yet</p>
                    <button
                      onClick={addProcessingStep}
                      className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors flex items-center gap-2 mx-auto"
                    >
                      <Plus className="h-4 w-4" />
                      Add First Step
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {processingSteps.map((step, index) => (
                      <div key={step.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </div>
                            <span className="font-medium text-gray-900">Step {index + 1}</span>
                          </div>
                          
                          {step.isNew && (
                            <button
                              onClick={() => removeProcessingStep(step.id)}
                              className="text-red-600 hover:text-red-700 p-1"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <textarea
                              value={step.description}
                              onChange={(e) => updateProcessingStep(step.id, 'description', e.target.value)}
                              placeholder="Describe what was done in this step..."
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date Completed
                              </label>
                              <input
                                type="date"
                                value={step.dateCompleted.toISOString().split('T')[0]}
                                onChange={(e) => updateProcessingStep(step.id, 'dateCompleted', new Date(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Photo
                              </label>
                              <div className="flex items-center gap-3">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handlePhotoUpload(step.id, file)
                                  }}
                                  className="hidden"
                                  id={`photo-${step.id}`}
                                />
                                <label
                                  htmlFor={`photo-${step.id}`}
                                  className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors cursor-pointer flex items-center gap-2 text-sm"
                                >
                                  <Camera className="h-4 w-4" />
                                  {step.photoFile ? 'Change Photo' : 'Add Photo'}
                                </label>
                                {step.photoPreview && (
                                  <Image
                                    src={step.photoPreview}
                                    alt="Step photo"
                                    width={48}
                                    height={48}
                                    className="w-12 h-12 object-cover rounded-md border"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Finalization Section */}
            {activeSection === 'finalize' && (
              <div className="p-6">
                <div className="max-w-2xl">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Finalize & Seal Your Passport
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Ready to seal your passport? This will make it immutable and available for marketplace listing.
                  </p>
                  
                  {sealingComplete ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-green-900 mb-2">
                        Passport Successfully Sealed!
                      </h3>
                      <p className="text-green-700 mb-4">
                        Your spice passport is now immutable and ready for the marketplace.
                      </p>
                      <div className="text-sm text-green-600">
                        Redirecting to product view...
                      </div>
                    </div>
                  ) : (
                    <SealForSaleButton
                      passport={{
                        batchId: passport.batchId,
                        spiceType: passport.spiceType,
                        totalWeight: passport.totalWeight,
                        dateCreated: passport.createdDate,
                        harvestHash: passport.harvestHash,
                        processingHashes: passport.processingHashes || [],
                        isLocked: passport.isLocked,
                        statusText: passport.statusText,
                        owner: passport.owner,
                        totalSteps: passport.processingStepCount
                      }}
                      farmerName={`Farmer ${currentAddress?.slice(0, 6)}...${currentAddress?.slice(-4)}`}
                      contractAddress={process.env.NEXT_PUBLIC_SPICE_PASSPORT_CONTRACT || ''}
                      currentAddress={currentAddress}
                      onSeal={handleSealPassport}
                      onGasEstimate={handleGasEstimate}
                      variant="default"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </ImmutableStateGuard>
    </DashboardLayout>
  )
}

export default withAuth(PassportEditPage)