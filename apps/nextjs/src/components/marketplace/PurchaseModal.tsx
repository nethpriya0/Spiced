import React, { useState, useEffect } from 'react'
import { 
  ShoppingCart, 
  Loader2, 
  AlertTriangle, 
  CheckCircle, 
  Shield, 
  Clock,
  Calculator,
  CreditCard,
  X
} from 'lucide-react'
import { EscrowService, type CreateEscrowResult } from '@/lib/contracts/EscrowService'
import { type Address } from 'viem'

interface PurchaseModalProps {
  product: {
    batchId: string
    spiceType: string
    price: number
    totalWeight: number
    farmerAddress: Address
    farmerName: string
    photos: string[]
  }
  onClose: () => void
  onPurchaseSuccess: (escrowId: number) => void
  walletClient?: any
}

interface CostBreakdown {
  productPrice: bigint
  arbitrationFee: bigint
  totalCost: bigint
  totalCostEth: string
}

type PurchaseStep = 'review' | 'processing' | 'success' | 'error'

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  product,
  onClose,
  onPurchaseSuccess,
  walletClient
}) => {
  const [step, setStep] = useState<PurchaseStep>('review')
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(null)
  const [loadingCosts, setLoadingCosts] = useState(true)
  const [purchaseResult, setPurchaseResult] = useState<CreateEscrowResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [escrowService, setEscrowService] = useState<EscrowService | null>(null)

  // Initialize escrow service
  useEffect(() => {
    if (walletClient && !escrowService) {
      try {
        const contractAddress = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS as Address
        console.log('Initializing EscrowService with:', { contractAddress, hasWallet: !!walletClient })
        
        if (!contractAddress) {
          throw new Error('NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS not set')
        }
        
        const service = new EscrowService({
          contractAddress,
          walletClient
        })
        setEscrowService(service)
        console.log('EscrowService initialized successfully')
      } catch (err) {
        setError('Failed to initialize escrow service')
        console.error('Escrow service initialization failed:', err)
      }
    }
  }, [walletClient, escrowService])

  // Load cost breakdown
  useEffect(() => {
    if (escrowService && loadingCosts) {
      loadCostBreakdown()
    }
  }, [escrowService, loadingCosts])

  const loadCostBreakdown = async () => {
    if (!escrowService) {
      console.log('No escrowService available')
      return
    }

    try {
      console.log('Starting cost calculation for product price:', product.price)
      setLoadingCosts(true)
      
      // Try to get costs from contract, fallback to default values
      let costs
      try {
        console.log('Attempting contract call for transaction cost...')
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Contract call timeout')), 5000) // 5 second timeout
        })
        
        costs = await Promise.race([
          escrowService.calculateTransactionCost(product.price),
          timeoutPromise
        ]) as any
        console.log('Contract call succeeded:', costs)
      } catch (contractError) {
        console.warn('Contract call failed, using fallback values:', contractError)
        
        // Fallback calculation with fixed arbitration fee
        const productPriceWei = BigInt(Math.floor(product.price * 1e18))
        const arbitrationFeeWei = BigInt(Math.floor(0.001 * 1e18)) // 0.001 ETH
        const totalCostWei = productPriceWei + arbitrationFeeWei
        
        costs = {
          productPrice: productPriceWei,
          arbitrationFee: arbitrationFeeWei,
          totalCost: totalCostWei,
          totalCostEth: ((Number(totalCostWei) / 1e18).toFixed(6))
        }
        console.log('Using fallback costs:', costs)
      }
      
      setCostBreakdown(costs)
      console.log('Cost breakdown set successfully')
    } catch (err) {
      console.error('Failed to calculate costs:', err)
      setError('Failed to calculate transaction costs')
    } finally {
      setLoadingCosts(false)
      console.log('Cost calculation completed')
    }
  }

  const handlePurchase = async () => {
    console.log('Purchase button clicked!')
    console.log('EscrowService available:', !!escrowService)
    console.log('Cost breakdown available:', !!costBreakdown)
    console.log('Wallet client available:', !!walletClient)
    
    if (!escrowService || !costBreakdown) {
      const errorMsg = `Service not ready - escrowService: ${!!escrowService}, costBreakdown: ${!!costBreakdown}`
      console.error(errorMsg)
      setError(errorMsg)
      return
    }

    console.log('Starting purchase process...')
    setStep('processing')
    setError(null)

    try {
      console.log('Creating escrow with params:', {
        farmerAddress: product.farmerAddress,
        batchId: product.batchId,
        price: product.price,
        confirmationPeriod: 30
      })
      
      const result = await escrowService.createEscrow(
        product.farmerAddress,
        product.batchId,
        product.price,
        30 // 30 days confirmation period
      )

      console.log('Escrow created successfully:', result)
      setPurchaseResult(result)
      setStep('success')
      onPurchaseSuccess(result.escrowId)

    } catch (err) {
      console.error('Purchase failed:', err)
      const errorMessage = err instanceof Error ? err.message : 'Purchase failed'
      console.error('Error details:', errorMessage)
      setError(errorMessage)
      setStep('error')
    }
  }

  const formatEthAmount = (amount: string) => {
    const num = parseFloat(amount)
    return num.toFixed(6)
  }

  const renderReviewStep = () => (
    <div className="space-y-6">
      {/* Product Summary */}
      <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
        <img 
          src={product.photos[0] || '/placeholder-spice.jpg'} 
          alt={product.spiceType}
          className="w-20 h-20 object-cover rounded-lg"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{product.spiceType}</h3>
          <p className="text-sm text-gray-600">Batch #{product.batchId}</p>
          <p className="text-sm text-gray-600">By {product.farmerName}</p>
          <p className="text-sm text-gray-600">{product.totalWeight}g total</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">${product.price}</p>
        </div>
      </div>

      {/* Cost Breakdown */}
      {loadingCosts ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
          <span className="ml-2 text-gray-600">Calculating costs...</span>
        </div>
      ) : costBreakdown ? (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="h-5 w-5 text-gray-400" />
            <h4 className="font-medium text-gray-900">Cost Breakdown</h4>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Product Price:</span>
              <span className="font-medium">{formatEthAmount(product.price.toString())} ETH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Arbitration Fee:</span>
              <span className="font-medium">{formatEthAmount(costBreakdown.totalCostEth)} ETH</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Total Cost:</span>
              <span>{formatEthAmount(costBreakdown.totalCostEth)} ETH</span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Security Features */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <h4 className="font-medium text-blue-900">Protected Purchase</h4>
        </div>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <span>Funds held securely in escrow until delivery confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span>30-day confirmation period for disputes</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-600" />
            <span>Community arbitration for dispute resolution</span>
          </div>
        </div>
      </div>

      {/* Purchase Actions */}
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handlePurchase}
          disabled={loadingCosts || !costBreakdown}
          className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <CreditCard className="h-4 w-4" />
          Purchase with Escrow
        </button>
      </div>
    </div>
  )

  const renderProcessingStep = () => (
    <div className="text-center py-12">
      <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Processing Purchase
      </h3>
      <p className="text-gray-600 mb-4">
        Creating escrow transaction on the blockchain...
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
        <p className="text-sm text-blue-800">
          Please confirm the transaction in your wallet and wait for blockchain confirmation.
        </p>
      </div>
    </div>
  )

  const renderSuccessStep = () => (
    <div className="text-center py-8">
      <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
      <h3 className="text-2xl font-bold text-green-900 mb-2">
        Purchase Successful!
      </h3>
      <p className="text-green-700 mb-6">
        Your payment has been securely placed in escrow.
      </p>
      
      {purchaseResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-green-700">Escrow ID:</span>
              <span className="font-mono font-bold text-green-900">
                #{purchaseResult.escrowId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Transaction Hash:</span>
              <span className="font-mono text-green-900">
                {purchaseResult.transactionHash.slice(0, 10)}...
              </span>
            </div>
            <div className="pt-2 border-t border-green-200">
              <p className="text-green-800 font-medium">Next Steps:</p>
              <ul className="mt-2 space-y-1 text-left text-green-700">
                <li>• Seller will be notified of your purchase</li>
                <li>• Track your order in "My Purchases"</li>
                <li>• Confirm delivery when you receive the product</li>
                <li>• Funds will be released automatically after 30 days</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={onClose}
        className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
      >
        Continue Shopping
      </button>
    </div>
  )

  const renderErrorStep = () => (
    <div className="text-center py-8">
      <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
      <h3 className="text-2xl font-bold text-red-900 mb-2">
        Purchase Failed
      </h3>
      <p className="text-red-700 mb-6">
        {error || 'An error occurred while processing your purchase.'}
      </p>
      
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-red-800">
          Your funds have not been charged. Please try again or contact support.
        </p>
      </div>

      <div className="flex gap-3 justify-center">
        <button
          onClick={() => {
            setStep('review')
            setError(null)
          }}
          className="px-4 py-2 text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {step === 'review' && 'Complete Purchase'}
                {step === 'processing' && 'Processing...'}
                {step === 'success' && 'Purchase Complete'}
                {step === 'error' && 'Purchase Failed'}
              </h2>
              <p className="text-sm text-gray-600">
                Secure escrow transaction
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {step === 'review' && renderReviewStep()}
          {step === 'processing' && renderProcessingStep()}
          {step === 'success' && renderSuccessStep()}
          {step === 'error' && renderErrorStep()}
        </div>
      </div>
    </div>
  )
}

export default PurchaseModal