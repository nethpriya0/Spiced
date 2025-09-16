import { useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/useAuth'
import { ShoppingCart, Loader2, Shield, Clock } from 'lucide-react'
import { PurchaseModal } from './PurchaseModal'

interface Product {
  batchId: string
  spiceType: string
  price: number
  weight: number
  unit: string
  farmerName: string
  farmerAddress: string
  images?: string[]
}

interface PurchaseButtonProps {
  product: Product
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary'
}

export function PurchaseButton({ 
  product, 
  className = '', 
  size = 'md',
  variant = 'primary'
}: PurchaseButtonProps) {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const totalPrice = product.price * product.weight
  const isOwnProduct = user?.address === product.farmerAddress
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base', 
    lg: 'px-6 py-3 text-lg'
  }
  
  const variantClasses = {
    primary: 'bg-orange-600 hover:bg-orange-700 text-white',
    secondary: 'bg-white hover:bg-gray-50 text-orange-600 border border-orange-600'
  }
  
  const handlePurchaseClick = async () => {
    if (!isAuthenticated) {
      router.push('/login?role=buyer&redirect=' + encodeURIComponent(router.asPath))
      return
    }
    
    if (isOwnProduct) {
      return // Should not be clickable anyway
    }
    
    setShowModal(true)
  }
  
  if (isOwnProduct) {
    return (
      <button
        disabled
        className={`
          ${sizeClasses[size]} ${className}
          bg-gray-100 text-gray-500 rounded-lg font-medium cursor-not-allowed
          flex items-center justify-center gap-2
        `}
      >
        Your Product
      </button>
    )
  }
  
  return (
    <>
      <button
        onClick={handlePurchaseClick}
        disabled={loading}
        className={`
          ${sizeClasses[size]} ${variantClasses[variant]} ${className}
          rounded-lg font-medium transition-all duration-200
          flex items-center justify-center gap-2
          disabled:opacity-50 disabled:cursor-not-allowed
          hover:transform hover:scale-105 active:scale-95
        `}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4" />
            {size === 'lg' ? `Buy for $${totalPrice.toFixed(2)}` : 'Buy Now'}
          </>
        )}
      </button>
      
      {!isAuthenticated && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          <div className="flex items-center justify-center gap-1">
            <Shield className="h-3 w-3" />
            Login required to purchase
          </div>
        </div>
      )}
      
      {isAuthenticated && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          <div className="flex items-center justify-center gap-1">
            <Shield className="h-3 w-3 text-green-500" />
            Protected by smart contract escrow
          </div>
        </div>
      )}
      
      {showModal && (
        <PurchaseModal
          product={product}
          onClose={() => setShowModal(false)}
          onPurchaseStart={() => setLoading(true)}
          onPurchaseComplete={() => {
            setLoading(false)
            setShowModal(false)
          }}
        />
      )}
    </>
  )
}

// Quick Buy Button for marketplace grid
export function QuickBuyButton({ product, className = '' }: { product: Product, className?: string }) {
  return (
    <PurchaseButton 
      product={product} 
      size="sm" 
      variant="primary"
      className={className}
    />
  )
}

// Detailed Buy Button for product pages  
export function DetailedBuyButton({ product, className = '' }: { product: Product, className?: string }) {
  return (
    <div className={className}>
      <PurchaseButton 
        product={product} 
        size="lg" 
        variant="primary"
        className="w-full"
      />
      
      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
        <div className="flex items-start gap-2 mb-2">
          <Shield className="h-4 w-4 text-green-500 mt-0.5" />
          <div>
            <div className="font-medium text-gray-700">Secure Purchase Process</div>
            <div className="mt-1 space-y-1">
              <div>• Payment held in smart contract escrow</div>
              <div>• 30-day confirmation period</div>
              <div>• Dispute resolution available</div>
              <div>• Automatic release or refund</div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
          <Clock className="h-4 w-4 text-blue-500" />
          <span className="text-gray-600">
            Funds released automatically after 30 days or upon confirmation
          </span>
        </div>
      </div>
    </div>
  )
}