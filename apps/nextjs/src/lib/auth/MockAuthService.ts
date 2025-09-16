import { createWalletClient, http } from 'viem'
import { localhost } from 'viem/chains'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import type { Address, WalletClient } from 'viem'

export class MockAuthError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message)
    this.name = 'MockAuthError'
  }
}

export interface MockAuthResult {
  address: Address
  walletClient: WalletClient
  userInfo?: Record<string, unknown>
}

export class MockAuthService {
  private account: any = null
  private walletClient: WalletClient | null = null
  private isConnectedState: boolean = false
  private static instance: MockAuthService | null = null

  // Singleton pattern for MockAuthService
  static getInstance(): MockAuthService {
    if (!MockAuthService.instance) {
      MockAuthService.instance = new MockAuthService()
    }
    return MockAuthService.instance
  }

  async initialize(): Promise<void> {
    const startTime = Date.now()
    console.log('🔧 [MockAuthService] Initializing MockAuth for local development...')
    // Mock initialization - always succeeds
    console.log(`✅ [MockAuthService] MockAuth initialized successfully in ${Date.now() - startTime}ms`)
  }

  async login(): Promise<MockAuthResult> {
    const startTime = Date.now()
    console.log('🔑 [MockAuthService] Starting MockAuth login...')
    
    try {
      // Create a mock account for local testing
      if (!this.account) {
        console.log('🔧 [MockAuthService] Creating mock account with fixed private key...')
        // Use a fixed private key for consistent testing
        const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' // First Hardhat account
        this.account = privateKeyToAccount(privateKey as any)
        console.log('📋 [MockAuthService] Mock account created:', this.account.address)
      }

      // Create wallet client with the mock account
      console.log('🔧 [MockAuthService] Creating wallet client...')
      this.walletClient = createWalletClient({
        account: this.account,
        chain: localhost,
        transport: http('http://127.0.0.1:8545')
      })

      this.isConnectedState = true
      console.log('✅ [MockAuthService] Mock wallet client created')

      // Generate realistic mock user data for testing
      const mockUsers = [
        {
          email: 'farmer@spiced.local',
          name: 'Test Farmer',
          profileImage: 'https://via.placeholder.com/150/10B981/FFFFFF?text=F',
          verifier: 'mock'
        },
        {
          email: 'buyer@spiced.local', 
          name: 'Test Buyer',
          profileImage: 'https://via.placeholder.com/150/F97316/FFFFFF?text=B',
          verifier: 'mock'
        }
      ]
      
      // Use the first user by default, could be made dynamic later
      const mockUserInfo = mockUsers[0]
      
      console.log('📋 [MockAuthService] Mock user info created')
      console.log(`✅ [MockAuthService] Login completed successfully in ${Date.now() - startTime}ms`)

      return {
        address: this.account.address,
        walletClient: this.walletClient,
        userInfo: mockUserInfo
      }
    } catch (error) {
      console.error(`❌ [MockAuthService] MockAuth login failed after ${Date.now() - startTime}ms:`, error)
      throw new MockAuthError('Failed to login with mock auth', error)
    }
  }

  async logout(): Promise<void> {
    console.log('😪 [MockAuthService] Logging out from MockAuth...')
    this.account = null
    this.walletClient = null
    this.isConnectedState = false
    console.log('✅ [MockAuthService] MockAuth logout completed')
  }

  async isConnected(): Promise<boolean> {
    return this.isConnectedState
  }

  async getUserInfo(): Promise<Record<string, unknown> | null> {
    if (!this.isConnectedState) {
      return null
    }

    return {
      email: 'farmer@spiced.local',
      name: 'Test Farmer',
      profileImage: 'https://via.placeholder.com/150/10B981/FFFFFF?text=F',
      verifier: 'mock',
      emailVerified: true
    }
  }

  getProvider() {
    return this.walletClient
  }

  // Mock recovery factors
  async getRecoveryFactors(): Promise<string[]> {
    console.log('MockAuth: Getting recovery factors...')
    // In development, we simulate having both email and social recovery
    return ['email', 'social']
  }

  // Mock recovery start
  async startRecovery(method: string): Promise<boolean> {
    console.log(`MockAuth: Starting recovery with method: ${method}`)
    // In development, we simulate successful recovery initiation
    return true
  }
}

// Export singleton instance
export const mockAuthService = MockAuthService.getInstance()