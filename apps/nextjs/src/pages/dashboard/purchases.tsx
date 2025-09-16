import React from 'react'
import Head from 'next/head'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { EscrowManagement } from '@/components/marketplace/EscrowManagement'
import { useWallet } from '@/hooks/useWallet'
import { ShoppingBag, AlertTriangle } from 'lucide-react'

const PurchasesPage: React.FC = () => {
  const { address, walletClient, isConnected } = useWallet()

  if (!isConnected || !address) {
    return (
      <>
        <Head>
          <title>My Purchases | Spiced Marketplace</title>
          <meta name="description" content="Track your spice purchases and manage escrow transactions" />
        </Head>
        
        <DashboardLayout>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Wallet Not Connected
              </h2>
              <p className="text-gray-600 mb-6">
                Please connect your wallet to view your purchases.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </DashboardLayout>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>My Purchases | Spiced Marketplace</title>
        <meta name="description" content="Track your spice purchases and manage escrow transactions" />
      </Head>
      
      <DashboardLayout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <ShoppingBag className="h-8 w-8 text-orange-600" />
              <h1 className="text-3xl font-bold text-gray-900">My Purchases</h1>
            </div>
            <p className="text-gray-600 max-w-2xl">
              Track your spice purchases, confirm deliveries, and manage any disputes through our secure escrow system.
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              How Secure Purchases Work
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
              <div>
                <div className="font-medium mb-1">1. Payment in Escrow</div>
                <p>Your payment is held securely until you confirm receipt of your order.</p>
              </div>
              <div>
                <div className="font-medium mb-1">2. Confirm Delivery</div>
                <p>Once you receive your spices, confirm delivery to release funds to the seller.</p>
              </div>
              <div>
                <div className="font-medium mb-1">3. Dispute Protection</div>
                <p>If there&apos;s an issue, initiate a dispute within 30 days for community arbitration.</p>
              </div>
            </div>
          </div>

          {/* Escrow Management */}
          <EscrowManagement 
            userAddress={address}
            walletClient={walletClient}
            role="buyer"
          />
        </div>
      </DashboardLayout>
    </>
  )
}

export default PurchasesPage