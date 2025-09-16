import React from 'react'
import Head from 'next/head'
import { MarketplaceLayout } from '@/components/marketplace/MarketplaceLayout'
import { CommunityHub } from '@/components/community/CommunityHub'
import { useWallet } from '@/hooks/useWallet'

const CommunityPage: React.FC = () => {
  const { address, isConnected } = useWallet()

  return (
    <>
      <Head>
        <title>Community Knowledge Hub | Spiced Marketplace</title>
        <meta name="description" content="Connect with fellow spice farmers, share knowledge, ask questions, and learn best practices" />
        <meta property="og:title" content="Community Knowledge Hub | Spiced Marketplace" />
        <meta property="og:description" content="Connect with fellow spice farmers, share knowledge, ask questions, and learn best practices" />
      </Head>

      <MarketplaceLayout>
        <CommunityHub 
          userAddress={address || undefined}
          isLoggedIn={isConnected}
        />
      </MarketplaceLayout>
    </>
  )
}

export default CommunityPage