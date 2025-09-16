import { useState, useEffect } from 'react'
import { X, Shield, Clock, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { EscrowService } from '@/lib/contracts/EscrowService'

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

interface PurchaseModalProps {
  product: Product
  onClose: () => void
  onPurchaseStart: () => void
  onPurchaseComplete: () => void
}

export function PurchaseModal({ 
  product, 
  onClose, 
  onPurchaseStart, 
  onPurchaseComplete 
}: PurchaseModalProps) {
  const { user, walletClient } = useAuth()
  const [step, setStep] = useState<'review' | 'confirm' | 'processing' | 'success' | 'error'>('review')
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [purchaseId, setPurchaseId] = useState<number | null>(null)
  const [gasEstimate, setGasEstimate] = useState<string | null>(null)
  
  const totalPrice = product.price * product.weight
  const escrowFee = totalPrice * 0.03 // 3% escrow fee
  const finalAmount = totalPrice + escrowFee
  
  useEffect(() => {
    if (step === 'review') {
      estimateGas()
    }
  }, [step])
  
  const estimateGas = async () => {
    try {
      if (!walletClient) return
      
      // Estimate gas cost for the transaction
      // This is a simplified estimate - real implementation would call the contract
      const estimate = '0.005' // ETH
      setGasEstimate(estimate)
    } catch (err) {
      console.error('Gas estimation failed:', err)
    }
  }
  
  const handlePurchase = async () => {
    if (!user?.address || !walletClient) {
      setError('Wallet not connected')
      return
    }
    
    try {
      setStep('processing')
      onPurchaseStart()
      setError(null)
      
      // Initialize escrow service
      const escrowService = new EscrowService({
        contractAddress: process.env.NEXT_PUBLIC_DIAMOND_PROXY_ADDRESS as `0x${string}`,
        walletClient
      })
      
      // Create escrow transaction
      const result = await escrowService.createEscrow(
        product.farmerAddress as `0x${string}`,
        product.batchId,
        finalAmount,
        30 // 30-day confirmation period
      )
      
      setTxHash(result.transactionHash)
      setPurchaseId(result.escrowId)
      setStep('success')
      
      // Auto-close after success
      setTimeout(() => {
        onPurchaseComplete()
      }, 3000)
      
    } catch (err) {
      console.error('Purchase failed:', err)
      setError(err instanceof Error ? err.message : 'Purchase failed')
      setStep('error')
    }
  }
  
  const handleClose = () => {
    if (step !== 'processing') {
      onClose()
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {step === 'review' && 'Review Purchase'}
            {step === 'confirm' && 'Confirm Purchase'}
            {step === 'processing' && 'Processing...'}
            {step === 'success' && 'Purchase Successful!'}
            {step === 'error' && 'Purchase Failed'}
          </h2>
          <button
            onClick={handleClose}
            disabled={step === 'processing'}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {step === 'review' && (
            <div className="space-y-6">
              {/* Product Summary */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <img 
                  src={product.images?.[0] || '/api/placeholder/80/80'}
                  alt={product.spiceType}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{product.spiceType}</h3>
                  <p className="text-sm text-gray-600">by {product.farmerName}</p>
                  <p className="text-sm text-gray-600">{product.weight}kg × ${product.price}/{product.unit}</p>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">${totalPrice.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Batch #{product.batchId}</div>
                </div>
              </div>
              
              {/* Price Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Product cost</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Escrow fee (3%)</span>
                  <span>${escrowFee.toFixed(2)}</span>
                </div>
                {gasEstimate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Est. gas fee</span>
                    <span>{gasEstimate} ETH</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>Total</span>
                  <span>${finalAmount.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Security Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="text-sm">
                    <h4 className="font-medium text-green-900 mb-1">Secure Escrow Protection</h4>
                    <ul className="text-green-700 space-y-1">
                      <li>• Your payment is held securely in a smart contract</li>
                      <li>• Funds only released when you confirm receipt</li>
                      <li>• 30-day automatic release if no disputes</li>
                      <li>• Dispute resolution available if needed</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Timeline */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <h4 className="font-medium text-blue-900 mb-1">What happens next?</h4>
                    <ol className="text-blue-700 space-y-1">
                      <li>1. Payment held in escrow</li>
                      <li>2. Farmer ships your order</li>
                      <li>3. You confirm receipt</li>
                      <li>4. Payment released to farmer</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {step === 'processing' && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 text-orange-600 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Purchase</h3>
              <p className="text-gray-600 mb-4">
                Creating secure escrow transaction...
              </p>
              <p className="text-sm text-gray-500">
                Please do not close this window
              </p>
            </div>
          )}
          
          {step === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Purchase Successful!</h3>
              <p className="text-gray-600 mb-4">
                Your payment is securely held in escrow.
              </p>
              
              {txHash && (
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-gray-600 mb-1">Transaction Hash:</p>
                  <code className="text-xs font-mono text-gray-800 break-all">{txHash}</code>
                </div>
              )}
              
              {purchaseId && (
                <p className="text-sm text-gray-600">
                  Purchase ID: #{purchaseId}
                </p>
              )}
              
              <p className="text-xs text-gray-500 mt-4">
                Redirecting you shortly...
              </p>
            </div>
          )}
          
          {step === 'error' && (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Purchase Failed</h3>
              <p className="text-gray-600 mb-4">
                {error || 'Something went wrong with your purchase.'}
              </p>
              <button
                onClick={() => setStep('review')}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
        
        {/* Footer */}
        {step === 'review' && (
          <div className="flex items-center justify-between p-6 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handlePurchase}
              className="px-6 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
            >
              Complete Purchase
            </button>
          </div>
        )}
      </div>
    </div>
  )
}