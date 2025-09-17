import React, { useState } from 'react'
import { COMMON_SPICE_TYPES } from '@/types/passport'
import { cn } from '@/utils/cn'

interface SpiceTypeSelectorProps {
  onSelect: (spiceType: string) => void
}

export function SpiceTypeSelector({ onSelect }: SpiceTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<string>('')
  const [customType, setCustomType] = useState<string>('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  const handleCommonSpiceSelect = (spiceType: string) => {
    setSelectedType(spiceType)
    setCustomType('')
    // Auto-submit when spice is selected
    onSelect(spiceType)
  }

  const handleCustomTypeSubmit = () => {
    if (customType.trim()) {
      onSelect(customType.trim())
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">What spice are you harvesting?</h3>
        <p className="text-sm text-gray-600">
          Click a spice type below to continue
        </p>
      </div>

      {/* Common Spice Types Grid - Auto-submit on click */}
      <div className="grid grid-cols-2 gap-3">
        {COMMON_SPICE_TYPES.map((spice) => (
          <button
            key={spice}
            onClick={() => handleCommonSpiceSelect(spice)}
            className="p-4 text-left border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 group"
          >
            <div className="font-medium text-sm group-hover:text-orange-700">{spice}</div>
            {spice.includes('Ceylon') && (
              <div className="text-xs text-gray-500 mt-1">Premium Quality</div>
            )}
          </button>
        ))}
      </div>

      {/* Simple Custom Type Input */}
      <div className="border-t pt-4">
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700">Or enter a custom spice:</div>
          <div className="flex gap-2">
            <input
              type="text"
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
              placeholder="e.g., Wild Cardamom"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCustomTypeSubmit()
                }
              }}
            />
            <button
              onClick={handleCustomTypeSubmit}
              disabled={!customType.trim()}
              className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpiceTypeSelector