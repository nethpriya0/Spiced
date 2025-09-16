import React, { useState, useMemo, useEffect, useCallback } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { MarketplaceLayout } from '@/components/marketplace/MarketplaceLayout'
import { MarketplaceProductGrid } from '@/components/marketplace/MarketplaceProductGrid'
import { MarketplaceHero } from '@/components/marketplace/MarketplaceHero'
import { MarketplaceStats } from '@/components/marketplace/MarketplaceStats'
import { useMarketplaceProducts } from '@/hooks/useMarketplaceProducts'
import { Search, SlidersHorizontal, MapPin, Award, ArrowUpDown, ChevronDown } from 'lucide-react'
import { type MarketplaceSortOption } from '@/types/marketplace'

const MarketplacePage: React.FC = () => {
  const { products, loading, error } = useMarketplaceProducts()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpiceTypes, setSelectedSpiceTypes] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified'>('all')
  const [sortOption, setSortOption] = useState<MarketplaceSortOption>({ field: 'sealedAt', direction: 'desc' })
  const [showSortMenu, setShowSortMenu] = useState(false)

  // Fuzzy search implementation
  const fuzzySearch = useCallback((query: string, text: string): boolean => {
    if (!query.trim()) return true
    
    const normalizedQuery = query.toLowerCase().replace(/[^a-zA-Z0-9]/g, '')
    const normalizedText = text.toLowerCase().replace(/[^a-zA-Z0-9]/g, '')
    
    // Direct match
    if (normalizedText.includes(normalizedQuery)) return true
    
    // Fuzzy match - allow for character variations
    let queryIndex = 0
    for (let i = 0; i < normalizedText.length && queryIndex < normalizedQuery.length; i++) {
      if (normalizedText[i] === normalizedQuery[queryIndex]) {
        queryIndex++
      }
    }
    return queryIndex >= normalizedQuery.length * 0.8 // 80% character match threshold
  }, [])

  // Filter, search, and sort logic
  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    // Search by spice type or farmer name with fuzzy matching
    if (searchQuery.trim()) {
      filtered = filtered.filter(product => 
        fuzzySearch(searchQuery, product.spiceType) ||
        fuzzySearch(searchQuery, product.farmerName) ||
        product.spiceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.farmerName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by selected spice types
    if (selectedSpiceTypes.length > 0) {
      filtered = filtered.filter(product => 
        selectedSpiceTypes.includes(product.spiceType)
      )
    }

    // Filter by verification status
    if (verificationFilter === 'verified') {
      filtered = filtered.filter(product => 
        product.status === 'sealed' && product.certifications?.includes('Blockchain Verified')
      )
    }

    // Sort products
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortOption.field) {
        case 'price':
          comparison = a.price - b.price
          break
        case 'sealedAt':
        case 'harvestDate':
          const dateA = new Date(a[sortOption.field]).getTime()
          const dateB = new Date(b[sortOption.field]).getTime()
          comparison = dateA - dateB
          break
        case 'weight':
          comparison = a.weight - b.weight
          break
        case 'qualityGrade':
          const gradeOrder = { 'AAA': 6, 'AA': 5, 'A+': 4, 'A': 3, 'B+': 2, 'B': 1 }
          comparison = (gradeOrder[a.qualityGrade] || 0) - (gradeOrder[b.qualityGrade] || 0)
          break
        default:
          return 0
      }
      
      return sortOption.direction === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [products, searchQuery, selectedSpiceTypes, verificationFilter, sortOption, fuzzySearch])

  // Get unique spice types for filter options
  const availableSpiceTypes = useMemo(() => {
    const types = [...new Set(products.map(p => p.spiceType))]
    return types.sort()
  }, [products])

  // URL state management
  useEffect(() => {
    const { q, types, verified, sort, dir } = router.query
    
    if (q && typeof q === 'string') setSearchQuery(q)
    if (types && typeof types === 'string') {
      setSelectedSpiceTypes(types.split(',').filter(Boolean))
    }
    if (verified === 'true') setVerificationFilter('verified')
    if (sort && typeof sort === 'string' && dir && typeof dir === 'string') {
      setSortOption({ 
        field: sort as MarketplaceSortOption['field'], 
        direction: dir as 'asc' | 'desc' 
      })
    }
  }, [router.query])

  const updateURL = useCallback((params: Record<string, string | string[] | undefined>) => {
    const query = { ...router.query }
    
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
        delete query[key]
      } else {
        query[key] = value
      }
    })
    
    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true })
  }, [router])

  const handleSpiceTypeToggle = (spiceType: string) => {
    const newTypes = selectedSpiceTypes.includes(spiceType) 
      ? selectedSpiceTypes.filter(t => t !== spiceType)
      : [...selectedSpiceTypes, spiceType]
    
    setSelectedSpiceTypes(newTypes)
    updateURL({ types: newTypes.length > 0 ? newTypes : undefined })
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    updateURL({ q: query || undefined })
  }

  const handleVerificationFilter = (filter: 'all' | 'verified') => {
    setVerificationFilter(filter)
    updateURL({ verified: filter === 'verified' ? 'true' : undefined })
  }

  const handleSortChange = (field: MarketplaceSortOption['field'], direction: 'asc' | 'desc') => {
    const newSort = { field, direction }
    setSortOption(newSort)
    updateURL({ sort: field, dir: direction })
    setShowSortMenu(false)
  }

  const clearAllFilters = () => {
    setSelectedSpiceTypes([])
    setVerificationFilter('all')
    setSearchQuery('')
    setSortOption({ field: 'sealedAt', direction: 'desc' })
    router.replace(router.pathname, undefined, { shallow: true })
  }

  return (
    <>
      <Head>
        <title>Spiced Marketplace - Authentic Sri Lankan Spices | Blockchain Verified</title>
        <meta 
          name="description" 
          content="Discover authentic Sri Lankan spices with complete provenance tracking. Every product is blockchain-verified for quality and authenticity." 
        />
        <meta name="keywords" content="Sri Lankan spices, Ceylon cinnamon, authentic spices, blockchain verified, provenance, marketplace" />
        <meta property="og:title" content="Spiced Marketplace - Authentic Sri Lankan Spices" />
        <meta property="og:description" content="Discover authentic Sri Lankan spices with complete blockchain-verified provenance." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/marketplace" />
      </Head>

      <MarketplaceLayout>
        {/* Hero Section */}
        <MarketplaceHero 
          totalProducts={products.length}
          featuredSpices={availableSpiceTypes.slice(0, 4)}
        />

        {/* Stats Section */}
        <MarketplaceStats products={products} />

        {/* Search and Filter Section */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
              {/* Search Bar */}
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search spices or farmers... (try fuzzy matching!)"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Filter Toggle, Sort, & Results Count */}
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  {filteredProducts.length} of {products.length} products
                </div>
                
                {/* Sort Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                    Sort
                    <ChevronDown className={`h-4 w-4 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showSortMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <div className="p-2">
                        <div className="text-xs font-medium text-gray-500 mb-2 px-2">Sort by:</div>
                        {[
                          { field: 'sealedAt' as const, label: 'Date Added', asc: 'Oldest First', desc: 'Newest First' },
                          { field: 'harvestDate' as const, label: 'Harvest Date', asc: 'Oldest First', desc: 'Newest First' },
                          { field: 'price' as const, label: 'Price', asc: 'Low to High', desc: 'High to Low' },
                          { field: 'weight' as const, label: 'Weight', asc: 'Light to Heavy', desc: 'Heavy to Light' },
                          { field: 'qualityGrade' as const, label: 'Quality', asc: 'B to AAA', desc: 'AAA to B' }
                        ].map(option => (
                          <div key={option.field}>
                            <div className="text-xs font-medium text-gray-700 px-2 py-1">{option.label}</div>
                            <button
                              onClick={() => handleSortChange(option.field, 'asc')}
                              className={`w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-50 ${
                                sortOption.field === option.field && sortOption.direction === 'asc' 
                                  ? 'text-orange-600 bg-orange-50' 
                                  : 'text-gray-700'
                              }`}
                            >
                              {option.asc}
                            </button>
                            <button
                              onClick={() => handleSortChange(option.field, 'desc')}
                              className={`w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-50 mb-2 ${
                                sortOption.field === option.field && sortOption.direction === 'desc' 
                                  ? 'text-orange-600 bg-orange-50' 
                                  : 'text-gray-700'
                              }`}
                            >
                              {option.desc}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {(selectedSpiceTypes.length > 0 || verificationFilter === 'verified') && (
                    <span className="ml-1 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                      {selectedSpiceTypes.length + (verificationFilter === 'verified' ? 1 : 0)}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Spice Type Filter */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Spice Types</h3>
                    <div className="space-y-2">
                      {availableSpiceTypes.map(spiceType => (
                        <label key={spiceType} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedSpiceTypes.includes(spiceType)}
                            onChange={() => handleSpiceTypeToggle(spiceType)}
                            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{spiceType}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Verification Filter */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Verification</h3>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="verification"
                          checked={verificationFilter === 'all'}
                          onChange={() => handleVerificationFilter('all')}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          All Products
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="verification"
                          checked={verificationFilter === 'verified'}
                          onChange={() => handleVerificationFilter('verified')}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700 flex items-center gap-1">
                          <Award className="h-3 w-3 text-green-600" />
                          Blockchain Verified Only
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Origin</h3>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          defaultChecked
                          disabled
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-blue-600" />
                          Sri Lanka
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Clear Filters */}
                {(selectedSpiceTypes.length > 0 || verificationFilter === 'verified' || searchQuery.trim()) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Clear all filters & search
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Product Grid Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error ? (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
                <div className="text-red-600 mb-2">⚠️ Unable to load products</div>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          ) : (
            <MarketplaceProductGrid 
              products={filteredProducts}
              loading={loading}
              emptyMessage={
                searchQuery || selectedSpiceTypes.length > 0 
                  ? "No products match your current filters."
                  : "No products available yet. Check back soon!"
              }
            />
          )}
        </div>

        {/* Call to Action Section */}
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Are you a spice farmer?
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Join our platform to showcase your authentic Sri Lankan spices with blockchain-verified provenance. 
                Build trust with buyers and get fair prices for your quality products.
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 transition-colors"
              >
                Join as a Farmer
              </Link>
            </div>
          </div>
        </div>
      </MarketplaceLayout>
    </>
  )
}

export default MarketplacePage