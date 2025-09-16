// Central service configuration for the Spice Platform
import { IPFSService } from './ipfs/IPFSService'
import { FarmerRegistryService } from './contracts/FarmerRegistryService'
import { SpicePassportService } from './contracts/SpicePassportService'
import { EscrowService } from './contracts/EscrowService'

// Environment configuration
export const APP_CONFIG = {
  chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 1337,
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8545',
  contracts: {
    diamondProxy: process.env.NEXT_PUBLIC_DIAMOND_PROXY_ADDRESS as `0x${string}`,
    farmerRegistry: process.env.NEXT_PUBLIC_FARMER_REGISTRY_ADDRESS as `0x${string}`,
    adminWallet: process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS as `0x${string}`,
  },
  ipfs: {
    gatewayUrl: process.env.NEXT_PUBLIC_IPFS_GATEWAY,
    apiKey: process.env.PINATA_API_KEY,
    secretKey: process.env.PINATA_SECRET_API_KEY,
  }
}

// Service instances
export const ipfsService = new IPFSService({
  gatewayUrl: APP_CONFIG.ipfs.gatewayUrl,
  apiKey: APP_CONFIG.ipfs.apiKey,
  projectId: process.env.IPFS_PROJECT_ID,
})

// Contract service factory - requires wallet client
export const createContractServices = (walletClient: any) => {
  const config = {
    contractAddress: APP_CONFIG.contracts.diamondProxy,
    walletClient,
  }

  // Initialize singleton services
  const farmerRegistry = FarmerRegistryService.getInstance()
  farmerRegistry.initialize(config)

  const spicePassport = new SpicePassportService(config)
  const escrow = new EscrowService(config)

  return {
    farmerRegistry,
    spicePassport,
    escrow,
  }
}

export type ContractServices = ReturnType<typeof createContractServices>