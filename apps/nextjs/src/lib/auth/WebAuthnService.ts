import {
  startRegistration,
  startAuthentication,
  type RegistrationResponseJSON,
  type AuthenticationResponseJSON,
} from '@simplewebauthn/browser'
import { createWalletClient, http } from 'viem'
import { sepolia, localhost } from 'viem/chains'
import type { Address, WalletClient } from 'viem'

export class WebAuthnError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message)
    this.name = 'WebAuthnError'
  }
}

export interface WebAuthnResult {
  address: Address
  walletClient: WalletClient
  userInfo: {
    email: string
    name?: string
    verified: boolean
  }
}

export interface WebAuthnUser {
  id: string
  email: string
  name?: string
  address: Address
  credentialId: string
  publicKey: string
  verified: boolean
  createdAt: Date
}

export class WebAuthnService {
  private static instance: WebAuthnService | null = null
  private currentUser: WebAuthnUser | null = null
  private readonly storageKey = 'webauthn_user'
  private readonly apiBase = '/api/auth/webauthn'

  static getInstance(): WebAuthnService {
    if (!WebAuthnService.instance) {
      WebAuthnService.instance = new WebAuthnService()
    }
    return WebAuthnService.instance
  }

  async initialize(): Promise<void> {
    console.log('🔑 [WebAuthnService] Initializing WebAuthn service...')
    
    // Check if WebAuthn is supported
    if (!this.isWebAuthnSupported()) {
      throw new WebAuthnError('WebAuthn is not supported in this browser')
    }

    // Load stored user if exists
    this.loadStoredUser()
    console.log('✅ [WebAuthnService] WebAuthn service initialized')
  }

  private isWebAuthnSupported(): boolean {
    return !!(
      window.PublicKeyCredential &&
      window.navigator.credentials &&
      typeof window.navigator.credentials.create === 'function' &&
      typeof window.navigator.credentials.get === 'function'
    )
  }

  private loadStoredUser(): void {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        this.currentUser = JSON.parse(stored)
        console.log('📋 [WebAuthnService] Loaded stored user:', this.currentUser?.email)
      }
    } catch (error) {
      console.warn('Failed to load stored user:', error)
      localStorage.removeItem(this.storageKey)
    }
  }

  private storeUser(user: WebAuthnUser): void {
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

  async register(email: string, name?: string): Promise<WebAuthnResult> {
    const startTime = Date.now()
    console.log('🔑 [WebAuthnService] Starting WebAuthn registration for:', email)

    try {
      if (!email || !email.includes('@')) {
        throw new WebAuthnError('Valid email address is required')
      }

      // Check if user already exists
      const existingUser = await this.checkUserExists(email)
      if (existingUser) {
        throw new WebAuthnError('User with this email already exists. Please use login instead.')
      }

      // Get registration options from server
      console.log('🌐 [WebAuthnService] Requesting registration options...')
      const optionsResponse = await fetch(`${this.apiBase}/registration/begin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      })

      if (!optionsResponse.ok) {
        const error = await optionsResponse.text()
        throw new WebAuthnError(`Registration options failed: ${error}`)
      }

      const options = await optionsResponse.json()
      console.log('📋 [WebAuthnService] Received registration options')

      // Start WebAuthn registration
      console.log('🔑 [WebAuthnService] Starting browser registration ceremony...')
      const attResp = await startRegistration(options)

      // Verify registration with server
      console.log('🌐 [WebAuthnService] Verifying registration...')
      const verificationResponse = await fetch(`${this.apiBase}/registration/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, attResp })
      })

      if (!verificationResponse.ok) {
        const error = await verificationResponse.text()
        throw new WebAuthnError(`Registration verification failed: ${error}`)
      }

      const verificationResult = await verificationResponse.json()
      if (!verificationResult.verified) {
        throw new WebAuthnError('Registration verification failed')
      }

      // Create user object
      const user: WebAuthnUser = {
        id: verificationResult.user.id,
        email,
        name,
        address: verificationResult.user.address,
        credentialId: verificationResult.credential.id,
        publicKey: verificationResult.credential.publicKey,
        verified: true,
        createdAt: new Date()
      }

      // Store user locally
      this.storeUser(user)

      // Create wallet client
      const walletClient = this.createWalletClient(user.address)

      console.log(`✅ [WebAuthnService] Registration completed successfully in ${Date.now() - startTime}ms`)
      
      return {
        address: user.address,
        walletClient,
        userInfo: {
          email: user.email,
          name: user.name,
          verified: user.verified
        }
      }

    } catch (error) {
      console.error(`❌ [WebAuthnService] Registration failed after ${Date.now() - startTime}ms:`, error)
      if (error instanceof WebAuthnError) {
        throw error
      }
      throw new WebAuthnError('Registration failed', error)
    }
  }

  async login(email?: string): Promise<WebAuthnResult> {
    const startTime = Date.now()
    console.log('🔑 [WebAuthnService] Starting WebAuthn login...')

    try {
      // If no email provided, try to use stored user
      const loginEmail = email || this.currentUser?.email
      if (!loginEmail) {
        throw new WebAuthnError('Email is required for login')
      }

      // Get authentication options from server
      console.log('🌐 [WebAuthnService] Requesting authentication options...')
      const optionsResponse = await fetch(`${this.apiBase}/authentication/begin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail })
      })

      if (!optionsResponse.ok) {
        const error = await optionsResponse.text()
        throw new WebAuthnError(`Authentication options failed: ${error}`)
      }

      const options = await optionsResponse.json()
      console.log('📋 [WebAuthnService] Received authentication options')

      // Start WebAuthn authentication
      console.log('🔑 [WebAuthnService] Starting browser authentication ceremony...')
      const authResp = await startAuthentication(options)

      // Verify authentication with server
      console.log('🌐 [WebAuthnService] Verifying authentication...')
      const verificationResponse = await fetch(`${this.apiBase}/authentication/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, authResp })
      })

      if (!verificationResponse.ok) {
        const error = await verificationResponse.text()
        throw new WebAuthnError(`Authentication verification failed: ${error}`)
      }

      const verificationResult = await verificationResponse.json()
      if (!verificationResult.verified) {
        throw new WebAuthnError('Authentication verification failed')
      }

      // Update stored user
      const user: WebAuthnUser = {
        id: verificationResult.user.id,
        email: loginEmail,
        name: verificationResult.user.name,
        address: verificationResult.user.address,
        credentialId: verificationResult.credential.id,
        publicKey: verificationResult.credential.publicKey,
        verified: true,
        createdAt: new Date(verificationResult.user.createdAt)
      }

      this.storeUser(user)

      // Create wallet client
      const walletClient = this.createWalletClient(user.address)

      console.log(`✅ [WebAuthnService] Login completed successfully in ${Date.now() - startTime}ms`)
      
      return {
        address: user.address,
        walletClient,
        userInfo: {
          email: user.email,
          name: user.name,
          verified: user.verified
        }
      }

    } catch (error) {
      console.error(`❌ [WebAuthnService] Login failed after ${Date.now() - startTime}ms:`, error)
      if (error instanceof WebAuthnError) {
        throw error
      }
      throw new WebAuthnError('Login failed', error)
    }
  }

  async logout(): Promise<void> {
    console.log('😪 [WebAuthnService] Starting logout...')
    
    try {
      // Clear stored user
      this.clearStoredUser()
      
      // Optionally notify server about logout
      try {
        await fetch(`${this.apiBase}/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      } catch (error) {
        console.warn('Server logout notification failed (non-fatal):', error)
      }

      console.log('✅ [WebAuthnService] Logout successful')
    } catch (error) {
      console.error('❌ [WebAuthnService] Logout error (non-fatal):', error)
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
      loginMethod: 'webauthn'
    }
  }

  async getAddress(): Promise<Address | null> {
    return this.currentUser?.address || null
  }

  private async checkUserExists(email: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBase}/user/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      if (response.ok) {
        const result = await response.json()
        return result.exists
      }
      
      return false
    } catch (error) {
      console.warn('Failed to check user existence:', error)
      return false
    }
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

  // Helper method to get user's email
  getEmail(): string | null {
    return this.currentUser?.email || null
  }

  // Helper method to check if email is verified
  async isEmailVerified(): Promise<boolean> {
    return !!(this.currentUser?.verified)
  }

  // Recovery methods - since WebAuthn doesn't have traditional recovery
  async getRecoveryFactors(): Promise<string[]> {
    return ['email', 'passkey'] // WebAuthn uses email and device-based passkeys
  }

  async startRecovery(method: string): Promise<boolean> {
    console.log(`Starting recovery with method: ${method}`)
    
    if (method === 'email' && this.currentUser?.email) {
      // For email recovery, user can register a new passkey with the same email
      console.log('Email recovery: User can register a new passkey with their email')
      return true
    }
    
    if (method === 'passkey') {
      // For passkey recovery, show available authenticators
      console.log('Passkey recovery: User can use any registered authenticator')
      return true
    }
    
    return false
  }
}

// Export singleton instance
export const webAuthnService = WebAuthnService.getInstance()