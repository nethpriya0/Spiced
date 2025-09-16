import React from 'react'
import Head from 'next/head'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { EscrowManagement } from '@/components/marketplace/EscrowManagement'
import { useWallet } from '@/hooks/useWallet'
import { TrendingUp, AlertTriangle } from 'lucide-react'

const SalesPage: React.FC = () => {
  const { address, walletClient, isConnected } = useWallet()

  if (!isConnected || !address) {
    return (
      <>
        <Head>
          <title>My Sales | Spiced Marketplace</title>
          <meta name="description" content="Track your spice sales and manage escrow transactions" />
        </Head>
        
        <DashboardLayout>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Wallet Not Connected
              </h2>
              <p className="text-gray-600 mb-6">
                Please connect your wallet to view your sales.
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
        <title>My Sales | Spiced Marketplace</title>
        <meta name="description" content="Track your spice sales and manage escrow transactions" />
      </Head>
      
      <DashboardLayout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-900">My Sales</h1>
            </div>
            <p className="text-gray-600 max-w-2xl">
              Monitor your spice sales, track payment releases, and manage any disputes through our secure escrow system.
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-green-900 mb-3">
              How Secure Sales Work
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-green-800">
              <div>
                <div className="font-medium mb-1">1. Order Received</div>
                <p>Buyer&apos;s payment is held in escrow when they purchase your product.</p>
              </div>
              <div>
                <div className="font-medium mb-1">2. Ship & Deliver</div>
                <p>Ship your spices to the buyer and provide tracking information.</p>
              </div>
              <div>
                <div className="font-medium mb-1">3. Get Paid</div>
                <p>Funds are released when buyer confirms delivery or after 30 days automatically.</p>
              </div>
            </div>
          </div>

          {/* Escrow Management */}
          <EscrowManagement 
            userAddress={address}
            walletClient={walletClient}
            role="seller"
          />
        </div>
      </DashboardLayout>
    </>
  )
}

export default SalesPage