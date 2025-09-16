import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/router'
import { withAuth } from '@/middleware/withAuth'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { ProductCard } from '@/components/products/ProductCard'
import { ProductFilters } from '@/components/products/ProductFilters'
import { useMyProducts } from '@/hooks/useMyProducts'
import { Package, Plus, Loader2 } from 'lucide-react'
import { useSpicePassportService } from '@/hooks/useSpicePassportService'
import { toast } from 'sonner'

const ProductsPage: React.FC = () => {
  const router = useRouter()
  const { passports, loading, error, refetch } = useMyProducts()
  const spicePassportService = useSpicePassportService()
  const [sealingPassports, setSealingPassports] = useState<Set<number>>(new Set())
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [spiceFilter, setSpiceFilter] = useState('')
  
  // Filtered passports
  const filteredPassports = useMemo(() => {
    return passports.filter(passport => {
      const matchesSearch = searchQuery === '' || 
        passport.batchId.toString().includes(searchQuery) ||
        passport.spiceType.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === '' || passport.statusText === statusFilter
      const matchesSpice = spiceFilter === '' || passport.spiceType === spiceFilter
      
      return matchesSearch && matchesStatus && matchesSpice
    })
  }, [passports, searchQuery, statusFilter, spiceFilter])
  
  const handleEditPassport = (batchId: number) => {
    router.push(`/products/edit/${batchId}`)
  }
  
  const handleViewPassport = (batchId: number) => {
    router.push(`/products/view/${batchId}`)
  }
  
  const handleCreateNew = () => {
    router.push('/harvest/log-new')
  }
  
  const handleSealPassport = async (batchId: number) => {
    if (!spicePassportService) {
      toast.error('Wallet not connected')
      return
    }
    
    setSealingPassports(prev => new Set(prev).add(batchId))
    
    try {
      toast.info('Sealing passport...', {
        description: `Submitting transaction for Batch #${batchId}`
      })
      
      const result = await spicePassportService.lockPassport(batchId)
      
      toast.success('Passport sealed successfully!', {
        description: `Batch #${batchId} is now immutable and ready for sale`,
        action: {
          label: 'View Transaction',
          onClick: () => {
            const explorerUrl = `https://sepolia.etherscan.io/tx/${result.transactionHash}`
            window.open(explorerUrl, '_blank')
          }
        }
      })
      
      // Refresh the products list to show updated status
      await refetch()
      
    } catch (error) {
      console.error('Failed to seal passport:', error)
      toast.error('Failed to seal passport', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setSealingPassports(prev => {
        const newSet = new Set(prev)
        newSet.delete(batchId)
        return newSet
      })
    }
  }
  
  if (error) {
    return (
      <DashboardLayout title="My Products">
        <div className="flex-1 p-6 bg-slate-50">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8">
              <div className="text-4xl mb-4">⚠️</div>
              <h1 className="text-xl font-bold text-red-900 mb-2">
                Failed to Load Products
              </h1>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={refetch}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }
  
  return (
    <DashboardLayout title="My Products">
      <div className="flex-1 p-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
                <p className="text-gray-600 mt-1">
                  Manage your spice digital passports and track product provenance
                </p>
              </div>
              
              <button
                onClick={handleCreateNew}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Log New Harvest
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-4" />
                <p className="text-gray-600">Loading your products...</p>
              </div>
            </div>
          ) : passports.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md mx-auto">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  No Products Yet
                </h2>
                <p className="text-gray-600 mb-6">
                  Start by logging your first harvest to create a digital passport for your spices.
                </p>
                <button
                  onClick={handleCreateNew}
                  className="px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors flex items-center gap-2 mx-auto"
                >
                  <Plus className="h-5 w-5" />
                  Log Your First Harvest
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Filters */}
              <ProductFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                spiceFilter={spiceFilter}
                onSpiceFilterChange={setSpiceFilter}
                totalCount={passports.length}
                filteredCount={filteredPassports.length}
              />
              
              {/* Products Grid */}
              {filteredPassports.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">
                    <Package className="h-8 w-8 mx-auto mb-2" />
                    <p>No products match your current filters.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPassports.map(passport => (
                    <div key={passport.batchId} className="relative">
                      <ProductCard
                        passport={passport}
                        onEdit={handleEditPassport}
                        onView={handleViewPassport}
                        onSeal={handleSealPassport}
                      />
                      
                      {/* Sealing Progress Overlay */}
                      {sealingPassports.has(passport.batchId) && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-2" />
                            <p className="text-sm font-medium text-green-700">Sealing Passport...</p>
                            <p className="text-xs text-green-600">Please confirm in wallet</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default withAuth(ProductsPage)