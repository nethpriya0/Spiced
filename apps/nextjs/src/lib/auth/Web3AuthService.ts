import { Web3Auth } from '@web3auth/modal'
import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from '@web3auth/base'
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider'
import { createWalletClient, custom } from 'viem'
import { sepolia, localhost } from 'viem/chains'
import type { Address, WalletClient } from 'viem'

export class Web3AuthError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message)
    this.name = 'Web3AuthError'
  }
}

export interface Web3AuthResult {
  address: Address
  walletClient: WalletClient
  userInfo?: Record<string, unknown>
}

export class Web3AuthService {
  private web3auth: Web3Auth | null = null
  private provider: IProvider | null = null
  private static instance: Web3AuthService | null = null

  // Singleton pattern
  static getInstance(): Web3AuthService {
    if (!Web3AuthService.instance) {
      Web3AuthService.instance = new Web3AuthService()
    }
    return Web3AuthService.instance
  }

  async initialize(): Promise<void> {
    const startTime = Date.now()
    console.log('🌐 [Web3AuthService] Starting Web3Auth initialization...')
    
    try {
      const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID
      console.log('📋 [Web3AuthService] Client ID configured:', !!clientId)
      console.log('📋 [Web3AuthService] Client ID length:', clientId?.length || 0)
      
      if (!clientId) {
        throw new Web3AuthError('Web3Auth Client ID not configured')
      }

      // Determine chain based on environment
      const chainId = process.env.NEXT_PUBLIC_CHAIN_ID
      const isProduction = process.env.NODE_ENV === 'production'
      const chain = chainId === '11155111' ? sepolia : localhost

      const chainConfig = {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: `0x${parseInt(chainId || '31337').toString(16)}`,
        rpcTarget: process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8545',
        displayName: chain.name,
        blockExplorer: chain.blockExplorers?.default?.url || '',
        ticker: chain.nativeCurrency.symbol,
        tickerName: chain.nativeCurrency.name,
      }

      const privateKeyProvider = new EthereumPrivateKeyProvider({
        config: { chainConfig }
      })

      this.web3auth = new Web3Auth({
        clientId,
        chainConfig,
        privateKeyProvider,
        web3AuthNetwork: isProduction ? WEB3AUTH_NETWORK.MAINNET : WEB3AUTH_NETWORK.TESTNET,
        uiConfig: {
          appName: 'Spiced3.0',
          mode: 'light',
          logoLight: 'https://spiced3.vercel.app/logo.png',
          logoDark: 'https://spiced3.vercel.app/logo.png',
          defaultLanguage: 'en',
          theme: {
            primary: '#8B5CF6'
          }
        }
      })

      console.log('🌐 [Web3AuthService] Initializing Web3Auth modal...')
      await this.web3auth.initModal()
      console.log(`✅ [Web3AuthService] Web3Auth initialized successfully in ${Date.now() - startTime}ms`)

    } catch (error) {
      console.error(`❌ [Web3AuthService] Web3Auth initialization failed after ${Date.now() - startTime}ms:`, error)
      throw new Web3AuthError('Failed to initialize Web3Auth', error)
    }
  }

  async login(): Promise<Web3AuthResult> {
    const startTime = Date.now()
    console.log('🔑 [Web3AuthService] Starting Web3Auth login...')
    
    try {
      if (!this.web3auth) {
        throw new Web3AuthError('Web3Auth not initialized')
      }

      console.log('🌐 [Web3AuthService] Connecting to Web3Auth...')
      this.provider = await this.web3auth.connect()
      if (!this.provider) {
        throw new Web3AuthError('Failed to get provider')
      }
      console.log('✅ [Web3AuthService] Web3Auth provider obtained')

      // Get user account
      console.log('📋 [Web3AuthService] Fetching user accounts...')
      const accounts = await this.provider.request({ method: 'eth_accounts' }) as Address[]
      if (!accounts || accounts.length === 0) {
        throw new Web3AuthError('No accounts found')
      }

      const address = accounts[0]
      console.log('📋 [Web3AuthService] User address:', address)
      if (!address) {
        throw new Web3AuthError('Invalid account address')
      }

      // Create viem wallet client
      const walletClient = createWalletClient({
        account: address,
        chain: process.env.NEXT_PUBLIC_CHAIN_ID === '11155111' ? sepolia : localhost,
        transport: custom(this.provider)
      })

      // Get user info
      console.log('📋 [Web3AuthService] Fetching user info...')
      const userInfo = await this.web3auth.getUserInfo()
      console.log('📋 [Web3AuthService] User info obtained:', !!userInfo)
      console.log('📋 [Web3AuthService] User email:', userInfo?.email || 'not available')
      console.log(`✅ [Web3AuthService] Login completed successfully in ${Date.now() - startTime}ms`)

      return {
        address,
        walletClient,
        userInfo
      }

    } catch (error) {
      console.error(`❌ [Web3AuthService] Web3Auth login failed after ${Date.now() - startTime}ms:`, error)
      throw new Web3AuthError('Login failed', error)
    }
  }

  async logout(): Promise<void> {
    try {
      if (!this.web3auth) {
        throw new Web3AuthError('Web3Auth not initialized')
      }

      await this.web3auth.logout()
      this.provider = null
      console.log('✅ Logged out successfully')

    } catch (error) {
      console.error('Logout failed:', error)
      throw new Web3AuthError('Logout failed', error)
    }
  }

  async isConnected(): Promise<boolean> {
    try {
      return this.web3auth?.connected || false
    } catch {
      return false
    }
  }

  async getUserInfo(): Promise<Record<string, unknown> | null> {
    try {
      if (!this.web3auth?.connected) {
        return null
      }
      
      return await this.web3auth.getUserInfo()
    } catch {
      return null
    }
  }

  getProvider(): IProvider | null {
    return this.provider
  }

  // Helper method to check if user is authenticated with email
  async isEmailVerified(): Promise<boolean> {
    try {
      const userInfo = await this.getUserInfo()
      return !!(userInfo?.email && userInfo?.emailVerified)
    } catch {
      return false
    }
  }

  // Get user's wallet address if connected
  async getAddress(): Promise<Address | null> {
    try {
      if (!this.provider) return null
      
      const accounts = await this.provider.request({ method: 'eth_accounts' }) as Address[]
      return accounts?.[0] || null
    } catch {
      return null
    }
  }

  // Get available recovery factors for the user
  async getRecoveryFactors(): Promise<string[]> {
    try {
      if (!this.web3auth?.connected) {
        console.log('Web3Auth not connected - cannot get recovery factors')
        return []
      }
      
      // Web3Auth doesn't expose recovery factors directly
      // We return common factors that Web3Auth supports
      const factors: string[] = []
      const userInfo = await this.getUserInfo()
      
      if (userInfo?.email) {
        factors.push('email')
      }
      if (userInfo?.verifier && userInfo.verifier !== 'torus-direct') {
        factors.push('social')
      }
      
      console.log('Available recovery factors:', factors)
      return factors
    } catch (error) {
      console.error('Failed to get recovery factors:', error)
      return ['email', 'social'] // Return default options
    }
  }

  // Start recovery process
  async startRecovery(method: string): Promise<boolean> {
    try {
      console.log(`Starting recovery with method: ${method}`)
      
      if (!this.web3auth) {
        throw new Web3AuthError('Web3Auth not initialized')
      }

      // Web3Auth handles recovery through the login modal
      // The user will be prompted to use their recovery method
      console.log('Initiating Web3Auth recovery flow...')
      return true // Web3Auth will handle the recovery in the modal
    } catch (error) {
      console.error('Recovery start failed:', error)
      throw new Web3AuthError('Failed to start recovery process', error)
    }
  }
}

// Export singleton instance
export const web3AuthService = Web3AuthService.getInstance()