import React from 'react'
import { Calendar, Weight, MapPin, Camera, FileText, Clock, CheckCircle } from 'lucide-react'
import { QRCodeGenerator } from '@/components/harvest/QRCodeGenerator'
import { type QRCodeData } from '@/types/passport'

interface ProcessingStepSummary {
  stepNumber: number
  description: string
  processingType: string
  dateCompleted: Date
  photoCount: number
  qualityMetrics?: Record<string, number>
}

interface PassportSummaryProps {
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
  }
  processingSteps?: ProcessingStepSummary[]
  farmerName: string
  contractAddress: string
  onEdit?: () => void
  className?: string
}

export function PassportSummary({
  passport,
  processingSteps = [],
  farmerName,
  contractAddress,
  onEdit,
  className = ''
}: PassportSummaryProps) {
  const qrCodeData: QRCodeData = {
    batchId: passport.batchId.toString(),
    contractAddress,
    verificationUrl: `${window.location.origin}/verify/${passport.batchId}`,
    farmer: farmerName,
    spiceType: passport.spiceType,
    harvestDate: passport.dateCreated.toLocaleDateString(),
    weight: `${(passport.totalWeight / 1000).toFixed(2)} kg`
  }

  const journeyDays = Math.ceil((Date.now() - passport.dateCreated.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b bg-gradient-to-r from-green-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Digital Passport Summary
            </h2>
            <p className="text-gray-600 mt-1">
              Complete provenance record for Batch #{passport.batchId}
            </p>
          </div>
          
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              passport.isLocked || passport.statusText === 'Locked'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {passport.isLocked || passport.statusText === 'Locked' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Sealed
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 mr-1" />
                  In Progress
                </>
              )}
            </div>
            
            {!passport.isLocked && onEdit && (
              <button
                onClick={onEdit}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Edit Details
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Basic Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Harvest Information
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <FileText className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{passport.spiceType}</div>
                  <div className="text-sm text-gray-600">Spice Type</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Weight className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {(passport.totalWeight / 1000).toFixed(2)} kg
                  </div>
                  <div className="text-sm text-gray-600">Total Weight</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {passport.dateCreated.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="text-sm text-gray-600">Harvest Date</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{farmerName}</div>
                  <div className="text-sm text-gray-600">Certified Farmer</div>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Verification QR Code
            </h3>
            
            <QRCodeGenerator
              data={qrCodeData}
              size={200}
              className="mb-4"
            />
            
            <div className="text-center text-sm text-gray-600">
              <p className="font-mono">Batch ID: {passport.batchId}</p>
              <p>Scan to verify authenticity</p>
            </div>
          </div>
        </div>

        {/* Processing Journey */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Processing Journey ({processingSteps.length} steps)
            </h3>
            <div className="text-sm text-gray-600">
              {journeyDays} days from harvest to {passport.isLocked ? 'seal' : 'current state'}
            </div>
          </div>

          {processingSteps.length > 0 ? (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gray-200"></div>
              
              <div className="space-y-6">
                {processingSteps.map((step, _index) => (
                  <div key={step.stepNumber} className="relative flex items-start gap-4">
                    {/* Timeline marker */}
                    <div className="relative z-10 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {step.stepNumber}
                    </div>
                    
                    <div className="flex-1 bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {formatProcessingType(step.processingType)}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {step.description}
                          </p>
                        </div>
                        
                        <div className="text-right text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {step.dateCompleted.toLocaleDateString()}
                          </div>
                          
                          {step.photoCount > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <Camera className="h-3 w-3" />
                              {step.photoCount} photo{step.photoCount !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>

                      {step.qualityMetrics && Object.keys(step.qualityMetrics).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="text-xs text-gray-600 mb-2">Quality Metrics:</div>
                          <div className="flex flex-wrap gap-3 text-xs">
                            {Object.entries(step.qualityMetrics).map(([metric, value]) => (
                              <span key={metric} className="bg-white px-2 py-1 rounded border">
                                {formatMetricName(metric)}: {value}{getMetricUnit(metric)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No processing steps recorded</p>
              {!passport.isLocked && (
                <p className="text-sm text-gray-500 mt-1">
                  Add processing steps to create a complete provenance record
                </p>
              )}
            </div>
          )}
        </div>

        {/* Data Integrity */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            Blockchain & IPFS Data Integrity
          </h3>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Harvest data stored on IPFS: {passport.harvestHash.slice(0, 20)}...</span>
            </div>
            
            {passport.processingHashes.length > 0 && (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>
                  {passport.processingHashes.length} processing step{passport.processingHashes.length !== 1 ? 's' : ''} recorded
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>
                Smart contract status: {passport.isLocked ? 'Immutable (Locked)' : 'Modifiable'}
              </span>
            </div>
            
            <div className="mt-3 text-xs text-blue-700">
              Contract Address: {contractAddress}
            </div>
          </div>
        </div>

        {/* Completion Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{processingSteps.length}</div>
            <div className="text-sm text-green-600">Processing Steps</div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">
              {processingSteps.reduce((sum, step) => sum + step.photoCount, 1)}
            </div>
            <div className="text-sm text-blue-600">Photos Documented</div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-700">{journeyDays}</div>
            <div className="text-sm text-purple-600">Days in Journey</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatProcessingType(type: string): string {
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

function formatMetricName(metric: string): string {
  const names = {
    'moisture': 'Moisture',
    'temperature': 'Temperature',
    'humidity': 'Humidity'
  }
  return names[metric as keyof typeof names] || metric
}

function getMetricUnit(metric: string): string {
  const units = {
    'moisture': '%',
    'temperature': '°C',
    'humidity': '%'
  }
  return units[metric as keyof typeof units] || ''
}

export default PassportSummary