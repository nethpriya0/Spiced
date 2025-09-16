import React from 'react'
import Head from 'next/head'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { CredentialVault } from '@/components/credentials/CredentialVault'
import { useWallet } from '@/hooks/useWallet'
import { AlertTriangle } from 'lucide-react'

const CredentialsPage: React.FC = () => {
  const { address, isConnected } = useWallet()

  if (!isConnected || !address) {
    return (
      <>
        <Head>
          <title>Credential Vault | Spiced Marketplace</title>
          <meta name="description" content="Securely store credentials and generate Zero-Knowledge Proofs" />
        </Head>
        
        <DashboardLayout>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Wallet Not Connected
              </h2>
              <p className="text-gray-600 mb-6">
                Please connect your wallet to access your private credential vault.
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
        <title>Credential Vault | Spiced Marketplace</title>
        <meta name="description" content="Securely store credentials and generate Zero-Knowledge Proofs" />
        <meta property="og:title" content="Credential Vault | Spiced Marketplace" />
        <meta property="og:description" content="Securely store credentials and generate Zero-Knowledge Proofs" />
      </Head>
      
      <DashboardLayout>
        <CredentialVault 
          userAddress={address}
          privateKey={address} // In production, derive from actual private key
          onCredentialVerified={(badge) => {
            console.log('New credential verified:', badge)
            // Could show notification or update user's badge collection
          }}
        />
      </DashboardLayout>
    </>
  )
}

export default CredentialsPage