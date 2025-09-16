import React, { useState } from 'react'
import { QUALITY_CLAIM_OPTIONS, HARVEST_VALIDATION } from '@/types/passport'
import { cn } from '@/utils/cn'

interface QualityClaimsInputProps {
  onSubmit: (claims: string[]) => void
}

export function QualityClaimsInput({ onSubmit }: QualityClaimsInputProps) {
  const [selectedClaims, setSelectedClaims] = useState<string[]>([])
  const [customClaim, setCustomClaim] = useState<string>('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [error, setError] = useState<string>('')

  const handleClaimToggle = (claim: string) => {
    setSelectedClaims(prev => {
      if (prev.includes(claim)) {
        return prev.filter(c => c !== claim)
      } else {
        if (prev.length >= HARVEST_VALIDATION.qualityClaims.max) {
          setError(`You can select up to ${HARVEST_VALIDATION.qualityClaims.max} quality claims`)
          return prev
        }
        setError('')
        return [...prev, claim]
      }
    })
  }

  const handleCustomClaimAdd = () => {
    const trimmedClaim = customClaim.trim()
    
    // Validation
    if (!trimmedClaim) {
      setError('Please enter a custom quality claim')
      return
    }

    if (trimmedClaim.length < HARVEST_VALIDATION.qualityClaims.customClaimMinLength) {
      setError(`Custom claim must be at least ${HARVEST_VALIDATION.qualityClaims.customClaimMinLength} characters`)
      return
    }

    if (trimmedClaim.length > HARVEST_VALIDATION.qualityClaims.customClaimMaxLength) {
      setError(`Custom claim must be less than ${HARVEST_VALIDATION.qualityClaims.customClaimMaxLength} characters`)
      return
    }

    if (selectedClaims.includes(trimmedClaim)) {
      setError('This claim has already been added')
      return
    }

    if (selectedClaims.length >= HARVEST_VALIDATION.qualityClaims.max) {
      setError(`You can add up to ${HARVEST_VALIDATION.qualityClaims.max} quality claims`)
      return
    }

    setSelectedClaims(prev => [...prev, trimmedClaim])
    setCustomClaim('')
    setShowCustomInput(false)
    setError('')
  }

  const handleSubmit = () => {
    onSubmit(selectedClaims)
  }

  // Quality claim descriptions for tooltips/help
  const claimDescriptions: Record<string, string> = {
    'Organic': 'Grown without synthetic fertilizers, pesticides, or GMOs',
    'Fair Trade': 'Farmers receive fair compensation and work in good conditions', 
    'Single Origin': 'Sourced from a single farm or specific geographic region',
    'Hand-picked': 'Manually harvested for optimal quality and ripeness',
    'Sundried': 'Naturally dried using solar energy, no artificial processing',
    'Non-GMO': 'Not genetically modified, preserving natural plant varieties',
    'Rain-fed': 'Grown using natural rainfall, not irrigation systems',
    'Traditional Methods': 'Cultivated using time-tested, ancestral farming techniques',
    'High Altitude': 'Grown at elevation, often resulting in concentrated flavors',
    'Premium Grade': 'Meets highest quality standards for color, aroma, and taste'
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Quality Claims</h3>
        <p className="text-sm text-gray-600 mb-4">
          Select quality attributes that make your spice special. This helps buyers understand what makes your product unique.
        </p>
      </div>

      {/* Selected Claims Counter */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">
          Selected: {selectedClaims.length}/{HARVEST_VALIDATION.qualityClaims.max}
        </span>
        {selectedClaims.length > 0 && (
          <button
            onClick={() => setSelectedClaims([])}
            className="text-orange-600 hover:text-orange-700"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Quality Claims Grid */}
      <div className="grid grid-cols-2 gap-2">
        {QUALITY_CLAIM_OPTIONS.map((claim) => (
          <button
            key={claim}
            onClick={() => handleClaimToggle(claim)}
            disabled={!selectedClaims.includes(claim) && selectedClaims.length >= HARVEST_VALIDATION.qualityClaims.max}
            className={cn(
              'p-3 text-left border rounded-lg transition-colors group relative',
              selectedClaims.includes(claim)
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50',
              !selectedClaims.includes(claim) && selectedClaims.length >= HARVEST_VALIDATION.qualityClaims.max
                ? 'opacity-50 cursor-not-allowed'
                : ''
            )}
            title={claimDescriptions[claim] || ''}
          >
            <div className="flex items-center justify-between">
              <div className="font-medium text-sm">{claim}</div>
              {selectedClaims.includes(claim) && (
                <div className="text-orange-600">✓</div>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1 line-clamp-2">
              {claimDescriptions[claim] || 'Quality attribute'}
            </div>
          </button>
        ))}
      </div>

      {/* Custom Claim Section */}
      <div className="border-t pt-4">
        {!showCustomInput ? (
          <button
            onClick={() => setShowCustomInput(true)}
            disabled={selectedClaims.length >= HARVEST_VALIDATION.qualityClaims.max}
            className={cn(
              'w-full p-3 text-left border rounded-lg transition-colors',
              selectedClaims.length >= HARVEST_VALIDATION.qualityClaims.max
                ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-100'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Add Custom Quality Claim</div>
                <div className="text-xs text-gray-500 mt-1">
                  Describe a unique quality of your spice
                </div>
              </div>
              <div className="text-gray-400">+</div>
            </div>
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={customClaim}
                onChange={(e) => setCustomClaim(e.target.value)}
                placeholder="e.g., Wild harvested, Family recipe, 3rd generation..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                maxLength={HARVEST_VALIDATION.qualityClaims.customClaimMaxLength}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCustomClaimAdd()
                  }
                }}
              />
              <button
                onClick={handleCustomClaimAdd}
                disabled={!customClaim.trim()}
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">
                {customClaim.length}/{HARVEST_VALIDATION.qualityClaims.customClaimMaxLength} characters
              </span>
              <button
                onClick={() => {
                  setShowCustomInput(false)
                  setCustomClaim('')
                  setError('')
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selected Claims Preview */}
      {selectedClaims.length > 0 && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600 mb-2">Your quality claims:</div>
          <div className="flex flex-wrap gap-2">
            {selectedClaims.map((claim) => (
              <span
                key={claim}
                className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm"
              >
                {claim}
                <button
                  onClick={() => handleClaimToggle(claim)}
                  className="ml-1 text-orange-600 hover:text-orange-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">
          {error}
        </div>
      )}

      {/* Educational Content */}
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
        <div className="text-sm text-blue-800">
          <div className="font-medium mb-1">💡 Quality Claims Tip</div>
          <p>
            Quality claims help buyers understand what makes your spice special and can justify 
            premium pricing. Be honest and accurate - buyers value transparency and authenticity.
            You can also skip this step if you prefer not to make specific claims.
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex space-x-3">
        <button
          onClick={() => onSubmit([])}
          className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Skip Quality Claims
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors"
        >
          Continue {selectedClaims.length > 0 ? `(${selectedClaims.length} selected)` : ''}
        </button>
      </div>
    </div>
  )
}

export default QualityClaimsInput