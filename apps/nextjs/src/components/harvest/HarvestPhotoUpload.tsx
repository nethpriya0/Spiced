import React, { useState, useRef } from 'react'
import { HARVEST_VALIDATION } from '@/types/passport'
import { cn } from '@/utils/cn'

interface HarvestPhotoUploadProps {
  onUpload: (file: File) => void
}

export function HarvestPhotoUpload({ onUpload }: HarvestPhotoUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!HARVEST_VALIDATION.photo.allowedTypes.includes(file.type as any)) {
      return `Please upload a valid image file (${HARVEST_VALIDATION.photo.allowedTypes.join(', ')})`
    }

    // Check file size
    if (file.size > HARVEST_VALIDATION.photo.maxSize) {
      const maxSizeMB = HARVEST_VALIDATION.photo.maxSize / (1024 * 1024)
      return `File size must be less than ${maxSizeMB}MB`
    }

    return null
  }

  const validateImageDimensions = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const { width, height } = img
        
        if (width < HARVEST_VALIDATION.photo.minWidth || height < HARVEST_VALIDATION.photo.minHeight) {
          resolve(`Image must be at least ${HARVEST_VALIDATION.photo.minWidth}x${HARVEST_VALIDATION.photo.minHeight} pixels`)
          return
        }

        if (width > HARVEST_VALIDATION.photo.maxWidth || height > HARVEST_VALIDATION.photo.maxHeight) {
          resolve(`Image must be less than ${HARVEST_VALIDATION.photo.maxWidth}x${HARVEST_VALIDATION.photo.maxHeight} pixels`)
          return
        }

        resolve(null)
      }
      
      img.onerror = () => {
        resolve('Invalid image file')
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  const processFile = async (file: File) => {
    setIsProcessing(true)
    setError('')

    // Basic validation
    const basicError = validateFile(file)
    if (basicError) {
      setError(basicError)
      setIsProcessing(false)
      return
    }

    // Image dimension validation
    const dimensionError = await validateImageDimensions(file)
    if (dimensionError) {
      setError(dimensionError)
      setIsProcessing(false)
      return
    }

    setIsProcessing(false)
    onUpload(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (file) processFile(file)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (file) processFile(file)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Upload Harvest Photo</h3>
        <p className="text-sm text-gray-600 mb-4">
          Add a clear photo of your harvested spice. Good photos help build trust with buyers and showcase your product quality.
        </p>
      </div>

      {/* File Upload Area */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          dragActive 
            ? 'border-orange-500 bg-orange-50' 
            : 'border-gray-300 hover:border-gray-400',
          isProcessing && 'opacity-50 cursor-not-allowed'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={HARVEST_VALIDATION.photo.allowedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
          disabled={isProcessing}
        />

        <div className="space-y-3">
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="text-sm text-gray-600">Processing image...</p>
            </>
          ) : (
            <>
              <div className="text-4xl">📷</div>
              <div>
                <button
                  onClick={openFileDialog}
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  Click to upload
                </button>
                <span className="text-gray-600"> or drag and drop</span>
              </div>
              <p className="text-sm text-gray-500">
                PNG, JPG, WebP up to {formatFileSize(HARVEST_VALIDATION.photo.maxSize)}
              </p>
            </>
          )}
        </div>

        {dragActive && (
          <div className="absolute inset-0 bg-orange-50 bg-opacity-80 rounded-lg flex items-center justify-center">
            <p className="text-orange-600 font-medium">Drop your photo here</p>
          </div>
        )}
      </div>

      {/* Image Requirements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div className="bg-gray-50 p-3 rounded">
          <div className="font-medium text-gray-900 mb-1">File Requirements</div>
          <ul className="text-gray-600 text-xs space-y-1">
            <li>• Format: JPG, PNG, or WebP</li>
            <li>• Size: Up to {formatFileSize(HARVEST_VALIDATION.photo.maxSize)}</li>
            <li>• Resolution: {HARVEST_VALIDATION.photo.minWidth}x{HARVEST_VALIDATION.photo.minHeight} - {HARVEST_VALIDATION.photo.maxWidth}x{HARVEST_VALIDATION.photo.maxHeight} pixels</li>
          </ul>
        </div>
        
        <div className="bg-blue-50 p-3 rounded">
          <div className="font-medium text-blue-900 mb-1">Photo Tips</div>
          <ul className="text-blue-800 text-xs space-y-1">
            <li>• Good lighting, avoid shadows</li>
            <li>• Show spice texture and color clearly</li>
            <li>• Include some packaging if available</li>
            <li>• Avoid blurry or low-quality images</li>
          </ul>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
          <div className="font-medium mb-1">Upload Error</div>
          {error}
        </div>
      )}

      {/* Photo Quality Guide */}
      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
        <div className="text-sm text-green-800">
          <div className="font-medium mb-2">📸 Great Harvest Photos Include:</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>✓ Clear, well-lit spice</div>
            <div>✓ Natural colors</div>
            <div>✓ Proper focus</div>
            <div>✓ Clean background</div>
          </div>
          <p className="mt-2 text-xs">
            High-quality photos can increase buyer interest by up to 40% and help justify premium pricing.
          </p>
        </div>
      </div>

      {/* Camera Access Button for Mobile */}
      <div className="sm:hidden">
        <button
          onClick={() => {
            // For mobile devices, try to access camera
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = 'image/*'
            input.capture = 'environment' // Use rear camera
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0]
              if (file) processFile(file)
            }
            input.click()
          }}
          disabled={isProcessing}
          className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          <span>📱</span>
          <span>Take Photo with Camera</span>
        </button>
      </div>
    </div>
  )
}

export default HarvestPhotoUpload