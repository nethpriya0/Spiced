import { createWalletClient, http } from 'viem'
import { sepolia, localhost } from 'viem/chains'
import type { Address, WalletClient } from 'viem'
import { createHash } from 'crypto'

export class SimpleEmailAuthError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message)
    this.name = 'SimpleEmailAuthError'
  }
}

export interface SimpleEmailAuthResult {
  address: Address
  walletClient: WalletClient
  userInfo: {
    email: string
    name?: string
    verified: boolean
    loginMethod: string
  }
}

export interface SimpleEmailUser {
  email: string
  name?: string
  address: Address
  verified: boolean
  createdAt: Date
}

export class SimpleEmailAuthService {
  private static instance: SimpleEmailAuthService | null = null
  private currentUser: SimpleEmailUser | null = null
  private readonly storageKey = 'simple_email_user'

  static getInstance(): SimpleEmailAuthService {
    if (!SimpleEmailAuthService.instance) {
      SimpleEmailAuthService.instance = new SimpleEmailAuthService()
    }
    return SimpleEmailAuthService.instance
  }

  async initialize(): Promise<void> {
    console.log('📧 [SimpleEmailAuth] Initializing simple email authentication...')
    
    // Load stored user if exists
    this.loadStoredUser()
    console.log('✅ [SimpleEmailAuth] Simple email authentication initialized')
  }

  private loadStoredUser(): void {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        this.currentUser = JSON.parse(stored)
        console.log('📋 [SimpleEmailAuth] Loaded stored user:', this.currentUser?.email)
      }
    } catch (error) {
      console.warn('Failed to load stored user:', error)
      localStorage.removeItem(this.storageKey)
    }
  }

  private storeUser(user: SimpleEmailUser): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(user))
      this.currentUser = user
    } catch (error) {
      console.warn('Failed to store user:', error)
    }
  }

  private clearStoredUser(): void {
    localStorage.removeItem(this.storageKey)
    this.currentUser = null
  }

  // Generate a deterministic wallet address from email
  private generateWalletAddress(email: string): Address {
    const hash = createHash('sha256')
      .update(email + 'spice_platform_simple_auth_seed')
      .digest('hex')
    // Take first 20 bytes (40 chars) for Ethereum address format
    return `0x${hash.slice(0, 40)}` as Address
  }

  private createWalletClient(address: Address): WalletClient {
    const chain = process.env.NEXT_PUBLIC_CHAIN_ID === '11155111' ? sepolia : localhost
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8545'
    
    return createWalletClient({
      account: address,
      chain,
      transport: http(rpcUrl)
    })
  }

  async register(email: string, name?: string): Promise<SimpleEmailAuthResult> {
    const startTime = Date.now()
    console.log('📧 [SimpleEmailAuth] Starting registration for:', email)

    try {
      if (!email || !email.includes('@')) {
        throw new SimpleEmailAuthError('Valid email address is required')
      }

      // Check if user already exists
      const existingUser = this.getStoredUserByEmail(email)
      if (existingUser) {
        throw new SimpleEmailAuthError('User with this email already exists. Please use login instead.')
      }

      // Generate wallet address
      const address = this.generateWalletAddress(email)

      // Create user object
      const user: SimpleEmailUser = {
        email,
        name,
        address,
        verified: true,
        createdAt: new Date()
      }

      // Store user locally
      this.storeUser(user)

      // Create wallet client
      const walletClient = this.createWalletClient(address)

      console.log(`✅ [SimpleEmailAuth] Registration completed successfully in ${Date.now() - startTime}ms`)
      console.log(`📋 [SimpleEmailAuth] Generated wallet address: ${address}`)
      
      return {
        address,
        walletClient,
        userInfo: {
          email,
          name,
          verified: true,
          loginMethod: 'simple_email'
        }
      }

    } catch (error) {
      console.error(`❌ [SimpleEmailAuth] Registration failed after ${Date.now() - startTime}ms:`, error)
      if (error instanceof SimpleEmailAuthError) {
        throw error
      }
      throw new SimpleEmailAuthError('Registration failed', error)
    }
  }

  async login(email?: string): Promise<SimpleEmailAuthResult> {
    const startTime = Date.now()
    console.log('📧 [SimpleEmailAuth] Starting login...')

    try {
      // If no email provided, try to use stored user
      const loginEmail = email || this.currentUser?.email
      if (!loginEmail) {
        throw new SimpleEmailAuthError('Email is required for login')
      }

      // Check if user exists
      let user: SimpleEmailUser | null = null
      
      if (email) {
        // Looking for specific email
        user = this.getStoredUserByEmail(email)
        if (!user) {
          throw new SimpleEmailAuthError('No account found with this email. Please register first.')
        }
      } else {
        // Use current stored user
        user = this.currentUser
        if (!user) {
          throw new SimpleEmailAuthError('No active session found. Please login with your email.')
        }
      }

      // Update stored user (refresh session)
      this.storeUser(user)

      // Create wallet client
      const walletClient = this.createWalletClient(user.address)

      console.log(`✅ [SimpleEmailAuth] Login completed successfully in ${Date.now() - startTime}ms`)
      console.log(`📋 [SimpleEmailAuth] User address: ${user.address}`)
      
      return {
        address: user.address,
        walletClient,
        userInfo: {
          email: user.email,
          name: user.name,
          verified: user.verified,
          loginMethod: 'simple_email'
        }
      }

    } catch (error) {
      console.error(`❌ [SimpleEmailAuth] Login failed after ${Date.now() - startTime}ms:`, error)
      if (error instanceof SimpleEmailAuthError) {
        throw error
      }
      throw new SimpleEmailAuthError('Login failed', error)
    }
  }

  async logout(): Promise<void> {
    console.log('😪 [SimpleEmailAuth] Starting logout...')
    
    try {
      // Clear stored user
      this.clearStoredUser()
      console.log('✅ [SimpleEmailAuth] Logout successful')
    } catch (error) {
      console.error('❌ [SimpleEmailAuth] Logout error (non-fatal):', error)
    }
  }

  async isConnected(): Promise<boolean> {
    return !!(this.currentUser && this.currentUser.verified)
  }

  async getUserInfo(): Promise<Record<string, unknown> | null> {
    if (!this.currentUser) return null
    
    return {
      email: this.currentUser.email,
      name: this.currentUser.name,
      verified: this.currentUser.verified,
      address: this.currentUser.address,
      loginMethod: 'simple_email'
    }
  }

  async getAddress(): Promise<Address | null> {
    return this.currentUser?.address || null
  }

  private getStoredUserByEmail(email: string): SimpleEmailUser | null {
    try {
      const stored = localStorage.getItem(`simple_email_user_${email}`)
      if (stored) {
        return JSON.parse(stored)
      }
      return null
    } catch (error) {
      console.warn('Failed to get stored user:', error)
      return null
    }
  }

  // Helper method to get user's email
  getEmail(): string | null {
    return this.currentUser?.email || null
  }

  // Helper method to check if email is verified
  async isEmailVerified(): Promise<boolean> {
    return !!(this.currentUser?.verified)
  }

  // Simple recovery - just store user by email for easy retrieval
  async getRecoveryFactors(): Promise<string[]> {
    return ['email'] // Simple email-based recovery
  }

  async startRecovery(method: string): Promise<boolean> {
    console.log(`Starting recovery with method: ${method}`)
    
    if (method === 'email') {
      console.log('Email recovery: User can login again with their email')
      return true
    }
    
    return false
  }
}

// Export singleton instance
export const simpleEmailAuthService = SimpleEmailAuthService.getInstance()