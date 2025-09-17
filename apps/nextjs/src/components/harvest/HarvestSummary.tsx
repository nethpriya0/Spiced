import React from 'react'
import { type QRCodeData } from '@/types/passport'
import { QRCodeGenerator } from './QRCodeGenerator'
import { convertWeight, type WeightUnit, WEIGHT_UNITS } from '@/types/passport'

interface HarvestSummaryProps {
  batchId: string
  farmerName: string
  spiceType: string
  harvestWeight: number // in grams
  weightUnit: WeightUnit
  qualityClaims: string[]
  harvestDate: Date
  contractAddress: string
  harvestPhotoPreview?: string
  onNewHarvest?: () => void
  onViewDetails?: (batchId: string) => void
  onBackToDashboard?: () => void
}

export function HarvestSummary({
  batchId,
  farmerName,
  spiceType,
  harvestWeight,
  weightUnit,
  qualityClaims,
  harvestDate,
  contractAddress,
  harvestPhotoPreview,
  onNewHarvest,
  onViewDetails,
  onBackToDashboard
}: HarvestSummaryProps) {
  const displayWeight = convertWeight(harvestWeight, 'g', weightUnit)
  const weightLabel = `${displayWeight.toFixed(weightUnit === 'g' ? 0 : 2)} ${WEIGHT_UNITS[weightUnit].symbol}`
  
  const qrCodeData: QRCodeData = {
    batchId,
    contractAddress,
    verificationUrl: `${window.location.origin}/verify/${batchId}`,
    farmer: farmerName,
    spiceType,
    harvestDate: harvestDate.toLocaleDateString(),
    weight: weightLabel
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Harvest Successfully Logged!
        </h1>
        
        <p className="text-lg text-gray-600">
          Your spice batch has been registered on the blockchain
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Harvest Details */}
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Harvest Details
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Batch ID</div>
                  <div className="text-lg font-mono text-gray-900">{batchId}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-500">Date</div>
                  <div className="text-lg text-gray-900">
                    {harvestDate.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Spice Type</div>
                  <div className="text-lg text-gray-900">{spiceType}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-500">Weight</div>
                  <div className="text-lg text-gray-900">{weightLabel}</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500">Farmer</div>
                <div className="text-lg text-gray-900">{farmerName}</div>
              </div>
            </div>
          </div>

          {/* Quality Claims */}
          {qualityClaims.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Quality Claims
              </h3>
              <div className="flex flex-wrap gap-2">
                {qualityClaims.map((claim) => (
                  <span
                    key={claim}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                  >
                    {claim}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Harvest Photo */}
          {harvestPhotoPreview && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Harvest Photo
              </h3>
              <div className="relative w-full h-48 rounded-lg overflow-hidden">
                <img
                  src={harvestPhotoPreview}
                  alt="Harvest photo"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>

        {/* QR Code */}
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Digital Passport
            </h2>
            
            <QRCodeGenerator
              data={qrCodeData}
              size={280}
              className="w-full"
            />
          </div>

          {/* Blockchain Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Stored on Blockchain
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Your harvest data has been permanently recorded on the blockchain 
                    and stored on IPFS for tamper-proof verification.
                  </p>
                  <div className="mt-2 font-mono text-xs break-all">
                    Contract: {contractAddress}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onBackToDashboard}
          className="px-8 py-3 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-lg"
        >
          📊 Back to Dashboard
        </button>

        <button
          onClick={() => onViewDetails?.(batchId)}
          className="px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Full Details
        </button>

        <button
          onClick={onNewHarvest}
          className="px-6 py-3 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
        >
          Log New Harvest
        </button>
      </div>

      {/* Help Text */}
      <div className="mt-6 text-center text-sm text-gray-600">
        <p>
          Share the QR code with buyers to verify authenticity. 
          The verification link will show all harvest details and processing history.
        </p>
      </div>
    </div>
  )
}

export default HarvestSummary