import React from 'react'
import { useRouter } from 'next/router'
import { withAuth } from '@/middleware/withAuth'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { useMyProducts } from '@/hooks/useMyProducts'
import { QRCodeGenerator } from '@/components/harvest/QRCodeGenerator'
import { ImmutableStateGuard } from '@/components/passport/ImmutableStateGuard'
import { SealForSaleButton } from '@/components/finalization/SealForSaleButton'
import { type QRCodeData } from '@/types/passport'
import { useAuth } from '@/hooks/useAuth'
import { useWallet } from '@/hooks/useWallet'
import { SpicePassportService } from '@/lib/contracts/SpicePassportService'
import { 
  ArrowLeft, 
  Edit3, 
  Calendar, 
  Weight, 
  Package, 
  MapPin, 
  Camera,
  FileText,
  Lock,
  Plus,
  ExternalLink,
  Shield,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

const PassportViewPage: React.FC = () => {
  const router = useRouter()
  const { id } = router.query
  const { passports, loading, refetch: refreshPassports } = useMyProducts()
  const { user } = useAuth()
  const currentAddress = user?.address
  const { walletClient } = useWallet()
  
  const passport = passports.find(p => p.batchId.toString() === id)
  
  if (loading) {
    return (
      <DashboardLayout title="Product Details">
        <div className="flex-1 p-6 bg-slate-50">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="bg-white rounded-lg p-6">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }
  
  if (!passport) {
    return (
      <DashboardLayout title="Product Not Found">
        <div className="flex-1 p-6 bg-slate-50">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                Product Not Found
              </h1>
              <p className="text-gray-600 mb-6">
                The product you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
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
  
  const qrCodeData: QRCodeData = {
    batchId: passport.batchId.toString(),
    contractAddress: process.env.NEXT_PUBLIC_SPICE_PASSPORT_CONTRACT || '0x123...contract',
    verificationUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${passport.batchId}`,
    farmer: `Farmer ${currentAddress?.slice(0, 6)}...${currentAddress?.slice(-4)}` || 'Demo Farmer',
    spiceType: passport.spiceType,
    harvestDate: passport.createdDate.toLocaleDateString(),
    weight: `${passport.weightInKg.toFixed(2)} kg`
  }
  
  const canEdit = passport.statusText === 'In Progress'
  const isSealed = passport.statusText === 'Locked' || passport.isLocked
  const readyToSeal = passport.statusText === 'In Progress' && passport.processingStepCount > 0
  
  // Convert passport data for ImmutableStateGuard
  const passportData = {
    batchId: BigInt(passport.batchId),
    owner: passport.owner as `0x${string}`,
    spiceType: passport.spiceType,
    totalWeight: BigInt(passport.totalWeight * 1000), // Convert kg to grams
    dateCreated: BigInt(Math.floor(passport.createdDate.getTime() / 1000)),
    isLocked: passport.isLocked,
    harvestHash: passport.harvestHash,
    processingHashes: passport.processingHashes || [],
    packageHash: '',
    status: passport.statusText === 'Locked' ? 1 : passport.statusText === 'Withdrawn' ? 2 : 0
  }
  
  const handleSealPassport = async (batchId: number) => {
    if (!walletClient || !currentAddress) {
      throw new Error('Wallet not connected')
    }
    
    try {
      const service = new SpicePassportService({
        contractAddress: process.env.NEXT_PUBLIC_SPICE_PASSPORT_CONTRACT as `0x${string}`,
        walletClient,
      })
      
      const result = await service.lockPassport(batchId)
      console.log('Passport sealed successfully:', result)
      
      // Refresh passport data
      await refreshPassports()
      
      // Redirect to updated view
      router.replace(`/products/view/${batchId}`)
      
    } catch (error) {
      console.error('Failed to seal passport:', error)
      throw error
    }
  }
  
  const handleGasEstimate = async (batchId: number) => {
    if (!walletClient || !currentAddress) {
      throw new Error('Wallet not connected')
    }
    
    const service = new SpicePassportService({
      contractAddress: process.env.NEXT_PUBLIC_SPICE_PASSPORT_CONTRACT as `0x${string}`,
      walletClient,
    })
    
    return await service.getLockPassportGasEstimate(batchId)
  }
  
  return (
    <DashboardLayout title={`Product ${passport.batchId}`}>
      <ImmutableStateGuard 
        passport={passportData}
        allowView={true}
        showBlockchainProof={isSealed}
        onEditAttempt={() => console.log('Edit attempt on sealed passport')}
      >
      <div className="flex-1 p-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-md transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {passport.spiceType}
                </h1>
                <p className="text-gray-600">Batch ID: {passport.batchId}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {isSealed && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                  <Shield className="h-4 w-4" />
                  Sealed & Verified
                </div>
              )}
              
              {canEdit && (
                <button
                  onClick={() => router.push(`/products/edit/${passport.batchId}`)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors flex items-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Product
                </button>
              )}
              
              {readyToSeal && (
                <button
                  onClick={() => router.push(`/products/edit/${passport.batchId}?section=finalize`)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Lock className="h-4 w-4" />
                  Ready to Seal
                </button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Package className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Spice Type</div>
                      <div className="text-gray-900">{passport.spiceType}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Weight className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Weight</div>
                      <div className="text-gray-900">{passport.weightInKg.toFixed(2)} kg</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Calendar className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Harvest Date</div>
                      <div className="text-gray-900">{passport.createdDate.toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      passport.statusText === 'In Progress' ? 'bg-yellow-100' :
                      passport.statusText === 'Locked' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Lock className={`h-4 w-4 ${
                        passport.statusText === 'In Progress' ? 'text-yellow-600' :
                        passport.statusText === 'Locked' ? 'text-green-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Status</div>
                      <div className="text-gray-900">{passport.statusText}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Processing Steps */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Processing Steps</h2>
                  {canEdit && (
                    <button
                      onClick={() => router.push(`/products/edit/${passport.batchId}?section=processing`)}
                      className="px-3 py-1 bg-orange-50 text-orange-600 rounded-md hover:bg-orange-100 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Plus className="h-3 w-3" />
                      Add Step
                    </button>
                  )}
                </div>
                
                {passport.processingStepCount === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">No processing steps added yet</p>
                    {canEdit && (
                      <button
                        onClick={() => router.push(`/products/edit/${passport.batchId}?section=processing`)}
                        className="mt-2 text-orange-600 hover:text-orange-700 text-sm"
                      >
                        Add your first processing step
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Mock processing steps */}
                    {Array.from({ length: passport.processingStepCount }).map((_, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-medium mt-1">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {index === 0 ? 'Harvest Collection' : `Processing Step ${index}`}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {index === 0 ? 'Initial harvest and quality assessment completed' : `Additional processing completed on ${new Date(Date.now() - (index * 86400000)).toLocaleDateString()}`}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Camera className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">Photo attached</span>
                            <ExternalLink className="h-3 w-3 text-blue-500" />
                            <span className="text-xs text-blue-600">View on IPFS</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Harvest Details */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Harvest Details</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Location</div>
                      <div className="text-sm text-gray-600">Kandy, Sri Lanka (Approximate)</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Camera className="h-4 w-4 text-gray-500 mt-1" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Harvest Photo</div>
                      <div className="text-sm text-gray-600">Stored securely on IPFS</div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 mt-1">
                        <ExternalLink className="h-3 w-3" />
                        View Original
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* QR Code and Actions */}
            <div className="space-y-6">
              {/* QR Code */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Digital Passport</h2>
                <QRCodeGenerator
                  data={qrCodeData}
                  size={200}
                  className="w-full"
                />
              </div>
              
              {/* Status & Actions Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Status & Actions</h2>
                
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg border-2 ${
                    passport.statusText === 'In Progress' ? 'bg-yellow-50 border-yellow-200' :
                    passport.statusText === 'Locked' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      {passport.statusText === 'In Progress' && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
                      {passport.statusText === 'Locked' && <CheckCircle className="h-5 w-5 text-green-600" />}
                      {passport.statusText === 'Withdrawn' && <Lock className="h-5 w-5 text-gray-600" />}
                      <span className="font-semibold text-gray-900">
                        {passport.statusText}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      {passport.statusText === 'In Progress' 
                        ? readyToSeal 
                          ? 'This product is ready to be sealed for marketplace listing.'
                          : 'Add processing steps to prepare for sealing.'
                        : passport.statusText === 'Locked' 
                        ? 'This product is permanently sealed and ready for buyers.'
                        : 'This product has been withdrawn from the marketplace.'
                      }
                    </p>
                    
                    {isSealed && (
                      <div className="flex items-center gap-2 text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                        <Shield className="h-3 w-3" />
                        <span>Blockchain secured & tamper-proof</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  {canEdit && (
                    <div className="space-y-2">
                      <button
                        onClick={() => router.push(`/products/edit/${passport.batchId}`)}
                        className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Edit3 className="h-4 w-4" />
                        Continue Editing
                      </button>
                      
                      {readyToSeal && (
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
                          farmerName={`Farmer ${currentAddress?.slice(0, 6)}...${currentAddress?.slice(-4)}` || 'Demo Farmer'}
                          contractAddress={process.env.NEXT_PUBLIC_SPICE_PASSPORT_CONTRACT || ''}
                          currentAddress={currentAddress}
                          onSeal={handleSealPassport}
                          onGasEstimate={handleGasEstimate}
                          variant="default"
                        />
                      )}
                    </div>
                  )}
                  
                  {isSealed && (
                    <div className="text-center py-4">
                      <div className="text-lg font-semibold text-green-700 mb-2">
                        🎆 Ready for Marketplace!
                      </div>
                      <p className="text-sm text-green-600 mb-4">
                        Your sealed passport is now available to buyers.
                      </p>
                      <button 
                        onClick={() => alert('Marketplace coming soon!')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        List on Marketplace (Coming Soon)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </ImmutableStateGuard>
    </DashboardLayout>
  )
}

export default withAuth(PassportViewPage)