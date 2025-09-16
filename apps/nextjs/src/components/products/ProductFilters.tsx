import React from 'react'
import { Search, Filter, X } from 'lucide-react'

interface ProductFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  statusFilter: string
  onStatusFilterChange: (status: string) => void
  spiceFilter: string
  onSpiceFilterChange: (spice: string) => void
  totalCount: number
  filteredCount: number
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Locked', label: 'Locked' },
  { value: 'Withdrawn', label: 'Withdrawn' }
]

const SPICE_OPTIONS = [
  { value: '', label: 'All Spices' },
  { value: 'Ceylon Cinnamon', label: 'Ceylon Cinnamon' },
  { value: 'Ceylon Cardamom', label: 'Ceylon Cardamom' },
  { value: 'Ceylon Pepper', label: 'Ceylon Pepper' },
  { value: 'Ceylon Cloves', label: 'Ceylon Cloves' },
  { value: 'Ceylon Nutmeg', label: 'Ceylon Nutmeg' },
  { value: 'Ceylon Mace', label: 'Ceylon Mace' },
  { value: 'Vanilla', label: 'Vanilla' },
  { value: 'Turmeric', label: 'Turmeric' },
  { value: 'Ginger', label: 'Ginger' }
]

export function ProductFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  spiceFilter,
  onSpiceFilterChange,
  totalCount,
  filteredCount
}: ProductFiltersProps) {
  const hasActiveFilters = searchQuery || statusFilter || spiceFilter
  
  const clearAllFilters = () => {
    onSearchChange('')
    onStatusFilterChange('')
    onSpiceFilterChange('')
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by batch ID or spice name..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
        
        {/* Status Filter */}
        <div className="w-full lg:w-48">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            {STATUS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Spice Filter */}
        <div className="w-full lg:w-48">
          <select
            value={spiceFilter}
            onChange={(e) => onSpiceFilterChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            {SPICE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>
      
      {/* Results Count */}
      <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span>
            Showing {filteredCount} of {totalCount} products
          </span>
        </div>
        
        {hasActiveFilters && (
          <div className="flex items-center gap-2 text-orange-600">
            <span>• Filters active</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductFilters