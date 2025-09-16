import React, { useState } from 'react'
import { type PassportData } from '@/lib/contracts/SpicePassportService'
import { Calendar, Weight, Package, Edit3, Lock, Eye } from 'lucide-react'
import { SealForSaleButton } from '@/components/finalization/SealForSaleButton'
import { PassportSealingManager } from '@/components/finalization/PassportSealingManager'

interface ProductCardProps {
  passport: Omit<PassportData, 'batchId' | 'totalWeight' | 'dateCreated'> & {
    batchId: number
    totalWeight: number
    dateCreated: number
    statusText: string
    weightInKg: number
    createdDate: Date
    processingStepCount: number
  }
  onEdit?: (batchId: number) => void
  onView?: (batchId: number) => void
  onSeal?: (batchId: number) => Promise<void>
}

export function ProductCard({ passport, onEdit, onView, onSeal }: ProductCardProps) {
  const [showSealModal, setShowSealModal] = useState(false)
  
  const handleEdit = () => {
    if (passport.statusText === 'In Progress') {
      onEdit?.(passport.batchId)
    }
  }
  
  const handleView = () => {
    onView?.(passport.batchId)
  }
  
  const handleSeal = async (batchId: number) => {
    setShowSealModal(true)
  }
  
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Locked': return 'bg-green-100 text-green-800 border-green-200'
      case 'Withdrawn': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }
  
  const canEdit = passport.statusText === 'In Progress'
  
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-soft hover:shadow-medium transition-all duration-300 transform hover:-translate-y-1 group overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-spice-green/10">
                <Package className="h-4 w-4 text-spice-green" />
              </div>
              <span className="text-sm font-medium text-gray-600">Batch ID</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 font-mono group-hover:text-spice-green transition-colors">
              #{passport.batchId.toString().padStart(3, '0')}
            </h3>
          </div>
          
          <div className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getStatusColor(passport.statusText)}`}>
            {passport.statusText === 'In Progress' && canEdit && (
              <>🔄 {passport.statusText}</>
            )}
            {passport.statusText === 'Locked' && (
              <>🔒 {passport.statusText}</>
            )}
            {passport.statusText === 'Withdrawn' && (
              <>📤 {passport.statusText}</>
            )}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5">
        <div className="space-y-3">
          {/* Spice Info */}
          <div>
            <h4 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-spice-green-dark transition-colors">
              {passport.spiceType}
            </h4>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-orange-100">
                  <Weight className="h-3 w-3 text-orange-600" />
                </div>
                <span className="font-medium">{passport.weightInKg.toFixed(2)} kg</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-blue-100">
                  <Calendar className="h-3 w-3 text-blue-600" />
                </div>
                <span className="font-medium">{passport.createdDate.toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          {/* Processing Steps */}
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse-soft"></div>
            <span className="font-medium">
              {passport.processingStepCount} processing step{passport.processingStepCount !== 1 ? 's' : ''} added
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span className="font-medium">Completion Status</span>
              <span className="font-bold text-spice-green">
                {passport.statusText === 'In Progress' ? '75%' : 
                 passport.statusText === 'Locked' ? '100%' : '25%'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  passport.statusText === 'In Progress' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                  passport.statusText === 'Locked' ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gray-400'
                }`}
                style={{
                  width: passport.statusText === 'In Progress' ? '75%' : 
                         passport.statusText === 'Locked' ? '100%' : '25%'
                }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="p-5 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="space-y-3">
          {/* Primary Actions Row */}
          <div className="flex gap-2">
            <button
              onClick={handleView}
              className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View Details
            </button>
            
            {canEdit && (
              <button
                onClick={handleEdit}
                className="flex-1 px-3 py-2 text-sm font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100 transition-colors flex items-center justify-center gap-2"
              >
                <Edit3 className="h-4 w-4" />
                Edit
              </button>
            )}
            
            {!canEdit && passport.statusText === 'Locked' && (
              <button
                disabled
                className="flex-1 px-3 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-md cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Lock className="h-4 w-4" />
                Sealed
              </button>
            )}
          </div>
          
          {/* Seal Action */}
          {passport.statusText === 'In Progress' && (
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
                qualityClaims: [],
                totalSteps: passport.processingStepCount,
                processingStepCount: passport.processingStepCount
              }}
              farmerName="Current User"
              contractAddress={process.env.NEXT_PUBLIC_SPICE_PASSPORT_CONTRACT || ''}
              onSeal={handleSeal}
              variant="compact"
            />
          )}
        </div>
        
        {/* Seal Confirmation Modal */}
        {showSealModal && (
          <PassportSealingManager
            batchId={passport.batchId}
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
              qualityClaims: [],
              totalSteps: passport.processingStepCount
            }}
            farmerName="Current User" // TODO: Get from auth context
            contractAddress={process.env.NEXT_PUBLIC_SPICE_PASSPORT_CONTRACT || ''}
            onCancel={() => setShowSealModal(false)}
            onSuccess={(transactionHash) => {
              console.log('Passport sealed successfully:', transactionHash)
              setShowSealModal(false)
              // TODO: Refresh passport data or show success message
            }}
          />
        )}
      </div>
    </div>
  )
}

export default ProductCard