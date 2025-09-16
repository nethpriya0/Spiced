import React, { useState, useRef } from 'react'
import { COMMON_SPICE_TYPES, HARVEST_VALIDATION } from '@/types/passport'
import { cn } from '@/utils/cn'

interface SpiceTypeSelectorProps {
  onSelect: (spiceType: string) => void
}

export function SpiceTypeSelector({ onSelect }: SpiceTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<string>('')
  const [customType, setCustomType] = useState<string>('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [error, setError] = useState<string>('')
  const customInputRef = useRef<HTMLInputElement>(null)

  const handleCommonSpiceSelect = (spiceType: string) => {
    setSelectedType(spiceType)
    setCustomType('')
    setError('')
  }

  const handleCustomTypeToggle = () => {
    setShowCustomInput(!showCustomInput)
    setSelectedType('')
    setError('')
    
    if (!showCustomInput) {
      setTimeout(() => customInputRef.current?.focus(), 100)
    }
  }

  const handleCustomTypeChange = (value: string) => {
    setCustomType(value)
    setError('')
  }

  const handleSubmit = () => {
    const spiceToSubmit = selectedType || customType.trim()
    
    // Validation
    if (!spiceToSubmit) {
      setError('Please select or enter a spice type')
      return
    }

    if (spiceToSubmit.length < HARVEST_VALIDATION.spiceType.minLength) {
      setError(`Spice type must be at least ${HARVEST_VALIDATION.spiceType.minLength} characters`)
      return
    }

    if (spiceToSubmit.length > HARVEST_VALIDATION.spiceType.maxLength) {
      setError(`Spice type must be less than ${HARVEST_VALIDATION.spiceType.maxLength} characters`)
      return
    }

    // Check if it's mostly alphabetic
    if (!/^[a-zA-Z\s]+$/.test(spiceToSubmit)) {
      setError('Spice type should only contain letters and spaces')
      return
    }

    onSelect(spiceToSubmit)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Select Your Spice Type</h3>
        <p className="text-sm text-gray-600 mb-4">
          Choose from common Sri Lankan spices or enter a custom type
        </p>
      </div>

      {/* Common Spice Types Grid */}
      <div className="grid grid-cols-2 gap-2">
        {COMMON_SPICE_TYPES.map((spice) => (
          <button
            key={spice}
            onClick={() => handleCommonSpiceSelect(spice)}
            className={cn(
              'p-3 text-left border rounded-lg transition-colors',
              selectedType === spice
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
            )}
          >
            <div className="font-medium text-sm">{spice}</div>
            {spice.includes('Ceylon') && (
              <div className="text-xs text-gray-500 mt-1">Premium Sri Lankan</div>
            )}
          </button>
        ))}
      </div>

      {/* Custom Type Section */}
      <div className="border-t pt-4">
        <button
          onClick={handleCustomTypeToggle}
          className={cn(
            'w-full p-3 text-left border rounded-lg transition-colors',
            showCustomInput
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">Custom Spice Type</div>
              <div className="text-xs text-gray-500 mt-1">
                Enter your own spice variety
              </div>
            </div>
            <div className="text-gray-400">
              {showCustomInput ? '−' : '+'}
            </div>
          </div>
        </button>

        {showCustomInput && (
          <div className="mt-3 space-y-2">
            <input
              ref={customInputRef}
              type="text"
              value={customType}
              onChange={(e) => handleCustomTypeChange(e.target.value)}
              placeholder="Enter spice type (e.g., Wild Cardamom, Black Pepper)"
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              maxLength={HARVEST_VALIDATION.spiceType.maxLength}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit()
                }
              }}
            />
            <div className="text-xs text-gray-500">
              {customType.length}/{HARVEST_VALIDATION.spiceType.maxLength} characters
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">
          {error}
        </div>
      )}

      {/* Educational Content */}
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
        <div className="text-sm text-blue-800">
          <div className="font-medium mb-1">💡 Spice Quality Tip</div>
          <p>
            Ceylon spices are world-renowned for their exceptional quality. If you&apos;re growing 
            traditional Sri Lankan varieties, highlighting the &quot;Ceylon&quot; origin adds significant 
            value for international buyers.
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!selectedType && !customType.trim()}
        className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        Continue with {selectedType || customType || 'Selected Spice'}
      </button>
    </div>
  )
}

export default SpiceTypeSelector