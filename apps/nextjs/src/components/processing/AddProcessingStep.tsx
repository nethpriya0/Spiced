import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Plus, Upload, X, AlertCircle, Check } from 'lucide-react'
import { type IpfsUrl } from '@/types/passport'

export interface ProcessingStepData {
  stepNumber: number
  description: string
  processingType: 'drying' | 'grinding' | 'packaging' | 'quality_check' | 'transport' | 'custom'
  dateCompleted: Date
  photos: File[]
  photoPreview: string[]
  location?: {
    latitude: number
    longitude: number
  }
  notes?: string
  qualityMetrics?: {
    moisture?: number
    temperature?: number
    humidity?: number
  }
}

interface AddProcessingStepProps {
  batchId: number
  currentStepNumber: number
  onSubmit: (stepData: ProcessingStepData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
  className?: string
}

const PROCESSING_TYPES = [
  { value: 'drying', label: 'Drying & Curing', icon: '🌞' },
  { value: 'grinding', label: 'Grinding & Processing', icon: '⚙️' },
  { value: 'packaging', label: 'Packaging & Sealing', icon: '📦' },
  { value: 'quality_check', label: 'Quality Assessment', icon: '🔍' },
  { value: 'transport', label: 'Transport & Logistics', icon: '🚛' },
  { value: 'custom', label: 'Custom Processing', icon: '⚡' }
]

export function AddProcessingStep({
  batchId,
  currentStepNumber,
  onSubmit,
  onCancel,
  isSubmitting = false,
  className = ''
}: AddProcessingStepProps) {
  const [formData, setFormData] = useState<ProcessingStepData>({
    stepNumber: currentStepNumber,
    description: '',
    processingType: 'drying',
    dateCompleted: new Date(),
    photos: [],
    photoPreview: [],
    notes: ''
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [dragActive, setDragActive] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters'
    }
    
    if (formData.dateCompleted > new Date()) {
      newErrors.dateCompleted = 'Date cannot be in the future'
    }
    
    if (formData.photos.length > 5) {
      newErrors.photos = 'Maximum 5 photos allowed'
    }
    
    // Validate quality metrics if provided
    if (formData.qualityMetrics) {
      const { moisture, temperature, humidity } = formData.qualityMetrics
      if (moisture !== undefined && (moisture < 0 || moisture > 100)) {
        newErrors.moisture = 'Moisture must be between 0-100%'
      }
      if (temperature !== undefined && (temperature < -50 || temperature > 100)) {
        newErrors.temperature = 'Temperature must be between -50°C and 100°C'
      }
      if (humidity !== undefined && (humidity < 0 || humidity > 100)) {
        newErrors.humidity = 'Humidity must be between 0-100%'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return
    
    const newFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) return false
      if (file.size > 10 * 1024 * 1024) return false // 10MB limit
      return true
    })
    
    if (formData.photos.length + newFiles.length > 5) {
      setErrors({ ...errors, photos: 'Maximum 5 photos allowed' })
      return
    }
    
    // Create preview URLs
    const previews = newFiles.map(file => URL.createObjectURL(file))
    
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...newFiles],
      photoPreview: [...prev.photoPreview, ...previews]
    }))
    
    // Clear photo error if it existed
    if (errors.photos) {
      const newErrors = { ...errors }
      delete newErrors.photos
      setErrors(newErrors)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
      photoPreview: prev.photoPreview.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Failed to add processing step:', error)
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to add processing step' })
    }
  }

  const updateQualityMetric = (metric: keyof NonNullable<ProcessingStepData['qualityMetrics']>, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value)
    setFormData(prev => ({
      ...prev,
      qualityMetrics: {
        ...prev.qualityMetrics,
        [metric]: numValue
      }
    }))
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Add Processing Step #{currentStepNumber}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Document the next stage in your spice processing journey
            </p>
          </div>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Processing Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Processing Type *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PROCESSING_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, processingType: type.value as any }))}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  formData.processingType === type.value
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="text-lg mb-1">{type.icon}</div>
                <div className="font-medium text-sm">{type.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description * 
            <span className="text-xs text-gray-500 ml-1">
              ({formData.description.length}/500)
            </span>
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe what was done in this processing step..."
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
            maxLength={500}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.description}
            </p>
          )}
        </div>

        {/* Date Completed */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="dateCompleted" className="block text-sm font-medium text-gray-700 mb-2">
              Date Completed *
            </label>
            <input
              type="date"
              id="dateCompleted"
              value={formData.dateCompleted.toISOString().split('T')[0]}
              onChange={(e) => setFormData(prev => ({ ...prev, dateCompleted: new Date(e.target.value) }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                errors.dateCompleted ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
              max={new Date().toISOString().split('T')[0]}
            />
            {errors.dateCompleted && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.dateCompleted}
              </p>
            )}
          </div>
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Processing Photos
            <span className="text-xs text-gray-500 ml-1">
              (Optional, max 5 photos)
            </span>
          </label>
          
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-300 bg-gray-50'
            } ${errors.photos ? 'border-red-300' : ''}`}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isSubmitting}
            />
            
            <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              Drag photos here or click to browse
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, WebP up to 10MB each
            </p>
          </div>

          {errors.photos && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.photos}
            </p>
          )}

          {/* Photo Previews */}
          {formData.photoPreview.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {formData.photoPreview.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Processing photo ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600"
                    disabled={isSubmitting}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quality Metrics */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Quality Metrics (Optional)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Moisture %</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.qualityMetrics?.moisture || ''}
                onChange={(e) => updateQualityMetric('moisture', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="0-100"
                disabled={isSubmitting}
              />
              {errors.moisture && (
                <p className="mt-1 text-xs text-red-600">{errors.moisture}</p>
              )}
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 mb-1">Temperature °C</label>
              <input
                type="number"
                min="-50"
                max="100"
                step="0.1"
                value={formData.qualityMetrics?.temperature || ''}
                onChange={(e) => updateQualityMetric('temperature', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="-50 to 100"
                disabled={isSubmitting}
              />
              {errors.temperature && (
                <p className="mt-1 text-xs text-red-600">{errors.temperature}</p>
              )}
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 mb-1">Humidity %</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.qualityMetrics?.humidity || ''}
                onChange={(e) => updateQualityMetric('humidity', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="0-100"
                disabled={isSubmitting}
              />
              {errors.humidity && (
                <p className="mt-1 text-xs text-red-600">{errors.humidity}</p>
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={formData.notes || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Any additional observations or notes..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            disabled={isSubmitting}
            maxLength={1000}
          />
        </div>

        {/* Error Display */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center text-red-700">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-red-600 text-sm mt-1">{errors.submit}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Adding Step...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Processing Step
              </>
            )}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 sm:flex-initial px-6"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

export default AddProcessingStep