import { useState } from 'react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import LogHarvestChatbot from '@/components/harvest/LogHarvestChatbot'
import HarvestSummary from '@/components/harvest/HarvestSummary'
import { type HarvestConversationState } from '@/types/passport'
import { withAuth } from '@/middleware/withAuth'
import { IPFSService } from '@/lib/ipfs/IPFSService'
import { SpicePassportService } from '@/lib/contracts/SpicePassportService'
import { useWallet } from '@/hooks/useWallet'

interface CompletedHarvest {
  harvestData: HarvestConversationState['harvestData']
  batchId: string
  contractAddress: string
  farmerName: string
}

const LogNewHarvestPage: NextPage = () => {
  const router = useRouter()
  const { walletClient, address } = useWallet()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>('')
  const [completedHarvest, setCompletedHarvest] = useState<CompletedHarvest | null>(null)
  
  // Services
  const [ipfsService] = useState(() => new IPFSService())
  const [passportService] = useState(() => {
    if (walletClient && address) {
      return new SpicePassportService({
        contractAddress: process.env.NEXT_PUBLIC_SPICE_PASSPORT_CONTRACT_ADDRESS as `0x${string}` || '0x123...contract',
        walletClient
      })
    }
    return null
  })

  const handleHarvestComplete = async (
    harvestData: HarvestConversationState['harvestData'], 
    batchId: string
  ) => {
    setIsProcessing(true)
    setError('')

    try {
      if (!harvestData.spiceType || !harvestData.harvestWeight || !harvestData.harvestPhotoFile) {
        throw new Error('Missing required harvest data')
      }

      // 1. Upload harvest data to IPFS
      const harvestIpfsUrl = await ipfsService.uploadHarvestData({
        spiceType: harvestData.spiceType,
        harvestWeight: harvestData.harvestWeight,
        qualityClaims: harvestData.qualityClaims || [],
        harvestPhotoFile: harvestData.harvestPhotoFile,
        dateHarvested: Date.now(),
        location: harvestData.location
      })

      // 2. Create passport on blockchain (simulate for development)
      if (passportService) {
        try {
          const result = await passportService.createPassport(
            harvestData.spiceType,
            harvestData.harvestWeight,
            harvestIpfsUrl
          )
          console.log('Passport created with transaction:', result.transactionHash)
        } catch (contractError) {
          // For development, continue without contract interaction
          console.warn('Contract interaction failed (development mode):', contractError)
        }
      }

      // 3. Set completed harvest data for summary display
      setCompletedHarvest({
        harvestData,
        batchId,
        contractAddress: process.env.NEXT_PUBLIC_SPICE_PASSPORT_CONTRACT_ADDRESS || '0x123...contract',
        farmerName: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Anonymous Farmer'
      })
      
      setIsProcessing(false)
      
    } catch (err) {
      console.error('Harvest completion error:', err)
      setError(err instanceof Error ? err.message : 'Failed to create digital passport')
      setIsProcessing(false)
    }
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
    setIsProcessing(false)
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <h2 className="text-xl font-semibold text-gray-900">Creating Your Digital Passport</h2>
          <p className="text-gray-600">Please wait while we process your harvest data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900 mr-4"
              >
                ← Back
              </button>
              <h1 className="text-lg font-semibold text-gray-900">Log New Harvest</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!completedHarvest ? (
          <div className="bg-white rounded-lg shadow-lg">
            <LogHarvestChatbot
              onComplete={handleHarvestComplete}
              onError={handleError}
              farmerAddress={address || '0x123...farmer'}
              className="h-[600px]"
            />
          </div>
        ) : (
          <HarvestSummary
            batchId={completedHarvest.batchId}
            farmerName={completedHarvest.farmerName}
            spiceType={completedHarvest.harvestData.spiceType!}
            harvestWeight={completedHarvest.harvestData.harvestWeight!}
            weightUnit={completedHarvest.harvestData.weightUnit || 'g'}
            qualityClaims={completedHarvest.harvestData.qualityClaims || []}
            harvestDate={new Date()}
            contractAddress={completedHarvest.contractAddress}
            harvestPhotoPreview={completedHarvest.harvestData.harvestPhotoPreview}
            onNewHarvest={() => {
              setCompletedHarvest(null)
              setError('')
            }}
            onViewDetails={(batchId) => {
              router.push(`/harvest/view/${batchId}`)
            }}
            onBackToDashboard={() => {
              router.push('/dashboard')
            }}
          />
        )}

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-500">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setError('')}
                    className="bg-red-100 px-2 py-1 text-xs font-medium text-red-800 rounded-md hover:bg-red-200"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default withAuth(LogNewHarvestPage)