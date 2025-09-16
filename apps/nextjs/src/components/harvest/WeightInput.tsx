import React, { useState } from 'react'
import { 
  WEIGHT_UNITS, 
  type WeightUnit, 
  convertWeight, 
  HARVEST_VALIDATION 
} from '@/types/passport'
import { cn } from '@/utils/cn'

interface WeightInputProps {
  onSubmit: (weight: number, unit: WeightUnit) => void
}

export function WeightInput({ onSubmit }: WeightInputProps) {
  const [weight, setWeight] = useState<string>('')
  const [unit, setUnit] = useState<WeightUnit>('kg')
  const [error, setError] = useState<string>('')

  const handleWeightChange = (value: string) => {
    // Allow numbers and single decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setWeight(value)
      setError('')
    }
  }

  const handleUnitChange = (newUnit: WeightUnit) => {
    setUnit(newUnit)
    setError('')
  }

  const validateAndSubmit = () => {
    const weightValue = parseFloat(weight)
    
    // Basic validation
    if (!weight || isNaN(weightValue)) {
      setError('Please enter a valid weight')
      return
    }

    if (weightValue <= 0) {
      setError('Weight must be greater than 0')
      return
    }

    // Convert to grams for validation
    const weightInGrams = convertWeight(weightValue, unit, 'g')
    
    if (weightInGrams < HARVEST_VALIDATION.weight.min) {
      setError(`Weight must be at least ${HARVEST_VALIDATION.weight.min}g (${(HARVEST_VALIDATION.weight.min / 1000).toFixed(3)}kg)`)
      return
    }

    if (weightInGrams > HARVEST_VALIDATION.weight.max) {
      setError(`Weight must be less than ${HARVEST_VALIDATION.weight.max / 1000}kg`)
      return
    }

    onSubmit(weightValue, unit)
  }

  // Get weight in different units for reference
  const getWeightConversions = () => {
    const weightValue = parseFloat(weight)
    if (isNaN(weightValue) || weightValue <= 0) return null

    const conversions = Object.keys(WEIGHT_UNITS).map(unitKey => {
      const targetUnit = unitKey as WeightUnit
      if (targetUnit === unit) return null
      
      const convertedWeight = convertWeight(weightValue, unit, targetUnit)
      return {
        unit: targetUnit,
        value: convertedWeight,
        display: `${convertedWeight.toFixed(2)} ${WEIGHT_UNITS[targetUnit].symbol}`
      }
    }).filter(Boolean)

    return conversions
  }

  const conversions = getWeightConversions()

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Enter Harvest Weight</h3>
        <p className="text-sm text-gray-600 mb-4">
          How much spice did you harvest? Enter the weight in your preferred unit.
        </p>
      </div>

      {/* Weight Input */}
      <div className="flex space-x-2">
        <div className="flex-1">
          <input
            type="text"
            value={weight}
            onChange={(e) => handleWeightChange(e.target.value)}
            placeholder="Enter weight"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                validateAndSubmit()
              }
            }}
          />
        </div>
        
        {/* Unit Selector */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {Object.entries(WEIGHT_UNITS).map(([unitKey, unitData]) => (
            <button
              key={unitKey}
              onClick={() => handleUnitChange(unitKey as WeightUnit)}
              className={cn(
                'px-3 py-2 rounded text-sm font-medium transition-colors',
                unit === unitKey
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              )}
            >
              {unitData.symbol}
            </button>
          ))}
        </div>
      </div>

      {/* Weight Conversions */}
      {conversions && conversions.length > 0 && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Equivalent weights:</div>
          <div className="flex flex-wrap gap-2">
            {conversions.map((conversion) => conversion && (
              <span
                key={conversion.unit}
                className="inline-flex items-center px-2 py-1 bg-white rounded text-sm text-gray-700 border"
              >
                {conversion.display}
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

      {/* Weight Estimation Guide */}
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
        <div className="text-sm text-blue-800">
          <div className="font-medium mb-2">📏 Weight Estimation Guide</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <strong>Small harvest:</strong>
              <br />100g - 1kg
            </div>
            <div>
              <strong>Medium harvest:</strong>
              <br />1kg - 10kg
            </div>
            <div>
              <strong>Large harvest:</strong>
              <br />10kg - 100kg
            </div>
            <div>
              <strong>Commercial:</strong>
              <br />100kg+
            </div>
          </div>
        </div>
      </div>

      {/* Quick Weight Buttons */}
      <div>
        <div className="text-sm text-gray-600 mb-2">Quick select common weights:</div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: 500, unit: 'g' as WeightUnit },
            { value: 1, unit: 'kg' as WeightUnit },
            { value: 2.5, unit: 'kg' as WeightUnit },
            { value: 5, unit: 'kg' as WeightUnit },
            { value: 10, unit: 'kg' as WeightUnit },
            { value: 25, unit: 'kg' as WeightUnit },
            { value: 50, unit: 'kg' as WeightUnit },
            { value: 100, unit: 'kg' as WeightUnit }
          ].map((quickWeight) => (
            <button
              key={`${quickWeight.value}${quickWeight.unit}`}
              onClick={() => {
                setWeight(quickWeight.value.toString())
                setUnit(quickWeight.unit)
                setError('')
              }}
              className="p-2 text-xs border border-gray-200 rounded hover:border-orange-300 hover:bg-orange-50 transition-colors"
            >
              {quickWeight.value} {WEIGHT_UNITS[quickWeight.unit].symbol}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={validateAndSubmit}
        disabled={!weight || isNaN(parseFloat(weight)) || parseFloat(weight) <= 0}
        className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        Continue with {weight ? `${weight} ${WEIGHT_UNITS[unit].symbol}` : 'Weight'}
      </button>
    </div>
  )
}

export default WeightInput