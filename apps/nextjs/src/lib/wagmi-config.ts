import { createConfig, http } from 'wagmi'
import { hardhat, mainnet } from 'wagmi/chains'
import { metaMask, walletConnect, coinbaseWallet } from 'wagmi/connectors'

// Get environment variables with fallbacks
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id'
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8545'

export const wagmiConfig = createConfig({
  chains: [hardhat, mainnet],
  connectors: [
    metaMask(),
    walletConnect({
      projectId,
      metadata: {
        name: 'Spiced Platform',
        description: 'Transparent Spice Marketplace',
        url: 'http://localhost:3000',
        icons: ['https://walletconnect.com/walletconnect-logo.png']
      }
    }),
    coinbaseWallet({
      appName: 'Spiced Platform',
      appLogoUrl: 'https://walletconnect.com/walletconnect-logo.png'
    })
  ],
  transports: {
    [hardhat.id]: http(rpcUrl),
    [mainnet.id]: http()
  }
})