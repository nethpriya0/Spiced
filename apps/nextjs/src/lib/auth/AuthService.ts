import { web3AuthService, type Web3AuthResult } from './Web3AuthService'
import { simpleEmailAuthService, type SimpleEmailAuthResult } from './SimpleEmailAuthService'
import { mockAuthService, type MockAuthResult } from './MockAuthService'
import type { Address, WalletClient } from 'viem'

export class AuthError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message)
    this.name = 'AuthError'
  }
}

export interface AuthResult {
  address: Address
  walletClient: WalletClient
  userInfo?: Record<string, unknown>
}

export type AuthMethod = 'web3auth' | 'simple_email' | 'mock'

export class AuthService {
  private static instance: AuthService | null = null
  private preferredAuthMethod: AuthMethod = 'simple_email'

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  setPreferredAuthMethod(method: AuthMethod): void {
    this.preferredAuthMethod = method
    console.log(`🔧 [AuthService] Preferred auth method set to: ${method}`)
  }

  getPreferredAuthMethod(): AuthMethod {
    return this.preferredAuthMethod
  }

  private isProductionMode(): boolean {
    // Use Web3Auth when we have a valid client ID, regardless of environment
    const hasValidWeb3AuthConfig = !!process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID && 
                                   process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID !== 'demo_client_id' &&
                                   !process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID.startsWith('YOUR_') &&
                                   process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID.length > 20
    
    console.log('📋 [AuthService] Web3Auth config valid:', hasValidWeb3AuthConfig)
    console.log('📋 [AuthService] Environment:', process.env.NODE_ENV)
    console.log('📋 [AuthService] Using Web3Auth:', hasValidWeb3AuthConfig)
    return hasValidWeb3AuthConfig
  }

  async initialize(): Promise<void> {
    const startTime = Date.now()
    console.log('🔧 [AuthService] Starting authentication initialization...')
    
    try {
      // Always initialize SimpleEmailAuth first as it's the preferred method
      console.log('📧 [AuthService] Initializing SimpleEmailAuth service...')
      await simpleEmailAuthService.initialize()
      console.log(`✅ [AuthService] SimpleEmailAuth initialized successfully`)

      // Initialize other auth methods based on Web3Auth client ID validity
      if (this.isProductionMode()) {
        console.log('🌐 [AuthService] Initializing Web3Auth with valid client ID...')
        console.log('📋 [AuthService] Web3Auth Client ID configured:', !!process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID)
        await web3AuthService.initialize()
        console.log(`✅ [AuthService] Web3Auth initialized successfully`)
      } else {
        console.log('🔧 [AuthService] Initializing MockAuth (no valid Web3Auth client ID)...')
        await mockAuthService.initialize()
        console.log(`✅ [AuthService] MockAuth initialized successfully`)
      }

      console.log(`✅ [AuthService] All authentication services initialized in ${Date.now() - startTime}ms`)
    } catch (error) {
      console.error('❌ [AuthService] Auth initialization error:', error)
      console.log('🔄 [AuthService] Falling back to MockAuth due to initialization error...')
      try {
        await mockAuthService.initialize()
        console.log(`✅ [AuthService] Fallback to MockAuth successful in ${Date.now() - startTime}ms`)
      } catch (fallbackError) {
        console.error('❌ [AuthService] Fallback initialization also failed:', fallbackError)
        throw new AuthError('All authentication methods failed to initialize', fallbackError)
      }
    }
  }

  async login(): Promise<AuthResult> {
    const startTime = Date.now()
    console.log('🔑 [AuthService] Starting login process...')
    console.log('📋 [AuthService] Preferred auth method:', this.preferredAuthMethod)
    
    try {
      // Try preferred method first
      if (this.preferredAuthMethod === 'simple_email') {
        const isSimpleEmailConnected = await simpleEmailAuthService.isConnected()
        if (isSimpleEmailConnected) {
          console.log('📧 [AuthService] Using SimpleEmailAuth for login...')
          const result: SimpleEmailAuthResult = await simpleEmailAuthService.login()
          console.log(`✅ [AuthService] SimpleEmailAuth login successful in ${Date.now() - startTime}ms`)
          return {
            address: result.address,
            walletClient: result.walletClient,
            userInfo: result.userInfo
          }
        }
      }

      // Fallback to Web3Auth or Mock based on client ID validity
      const isWeb3AuthConnected = await web3AuthService.isConnected()
      console.log('📋 [AuthService] Web3Auth connection status:', isWeb3AuthConnected)
      console.log('📋 [AuthService] Using Web3Auth:', this.isProductionMode())
      
      if (this.isProductionMode() && isWeb3AuthConnected) {
        console.log('🌐 [AuthService] Using Web3Auth for login...')
        const result: Web3AuthResult = await web3AuthService.login()
        console.log(`✅ [AuthService] Web3Auth login successful in ${Date.now() - startTime}ms`)
        console.log('📋 [AuthService] User address:', result.address)
        console.log('📋 [AuthService] User info available:', !!result.userInfo)
        return {
          address: result.address,
          walletClient: result.walletClient,
          userInfo: result.userInfo
        }
      } else {
        // Use mock auth (either because no valid Web3Auth client ID or Web3Auth failed to initialize)
        const reason = !this.isProductionMode() ? 'no valid Web3Auth client ID' : 'Web3Auth not connected'
        console.log(`🔧 [AuthService] Using MockAuth for login (reason: ${reason})...`)
        const result: MockAuthResult = await mockAuthService.login()
        console.log(`✅ [AuthService] MockAuth login successful in ${Date.now() - startTime}ms`)
        console.log('📋 [AuthService] Mock user address:', result.address)
        return {
          address: result.address,
          walletClient: result.walletClient,
          userInfo: result.userInfo
        }
      }
    } catch (error) {
      console.error('❌ [AuthService] Primary login failed:', error)
      console.log('🔄 [AuthService] Attempting fallback to MockAuth...')
      try {
        const result: MockAuthResult = await mockAuthService.login()
        console.log(`✅ [AuthService] Fallback MockAuth login successful in ${Date.now() - startTime}ms`)
        return {
          address: result.address,
          walletClient: result.walletClient,
          userInfo: result.userInfo
        }
      } catch (fallbackError) {
        console.error('❌ [AuthService] Fallback login also failed:', fallbackError)
        throw new AuthError('All login methods failed', fallbackError)
      }
    }
  }

  // New method for WebAuthn email-based login
  async loginWithEmail(email: string): Promise<AuthResult> {
    const startTime = Date.now()
    console.log('🔑 [AuthService] Starting email-based login for:', email)
    
    try {
      const result: SimpleEmailAuthResult = await simpleEmailAuthService.login(email)
      console.log(`✅ [AuthService] Email login successful in ${Date.now() - startTime}ms`)
      return {
        address: result.address,
        walletClient: result.walletClient,
        userInfo: result.userInfo
      }
    } catch (error) {
      console.error('❌ [AuthService] Email login failed:', error)
      throw new AuthError('Email login failed', error)
    }
  }

  // New method for WebAuthn email-based registration
  async registerWithEmail(email: string, name?: string): Promise<AuthResult> {
    const startTime = Date.now()
    console.log('🔑 [AuthService] Starting email-based registration for:', email)
    
    try {
      const result: SimpleEmailAuthResult = await simpleEmailAuthService.register(email, name)
      console.log(`✅ [AuthService] Email registration successful in ${Date.now() - startTime}ms`)
      return {
        address: result.address,
        walletClient: result.walletClient,
        userInfo: result.userInfo
      }
    } catch (error) {
      console.error('❌ [AuthService] Email registration failed:', error)
      throw new AuthError('Email registration failed', error)
    }
  }

  async logout(): Promise<void> {
    const startTime = Date.now()
    console.log('😪 [AuthService] Starting logout process...')
    
    try {
      // Logout from all possible services
      const logoutPromises = []
      
      // Always try SimpleEmailAuth logout
      logoutPromises.push(
        simpleEmailAuthService.logout().catch(error => 
          console.warn('SimpleEmailAuth logout failed (non-fatal):', error)
        )
      )
      
      if (this.isProductionMode()) {
        console.log('🌐 [AuthService] Logging out from Web3Auth...')
        logoutPromises.push(
          web3AuthService.logout().catch(error => 
            console.warn('Web3Auth logout failed (non-fatal):', error)
          )
        )
      } else {
        console.log('🔧 [AuthService] Logging out from MockAuth...')
        logoutPromises.push(
          mockAuthService.logout().catch(error => 
            console.warn('MockAuth logout failed (non-fatal):', error)
          )
        )
      }
      
      await Promise.allSettled(logoutPromises)
      console.log(`✅ [AuthService] Logout successful in ${Date.now() - startTime}ms`)
    } catch (error) {
      console.error('❌ [AuthService] Logout error (non-fatal):', error)
      // Don't throw on logout errors, just log them
    }
  }

  async isConnected(): Promise<boolean> {
    try {
      // Check SimpleEmailAuth first (preferred method)
      const simpleEmailConnected = await simpleEmailAuthService.isConnected()
      if (simpleEmailConnected) return true

      // Check other auth methods
      if (this.isProductionMode()) {
        return await web3AuthService.isConnected()
      } else {
        return await mockAuthService.isConnected()
      }
    } catch {
      return false
    }
  }

  async getUserInfo(): Promise<Record<string, unknown> | null> {
    try {
      // Try SimpleEmailAuth first
      const simpleEmailInfo = await simpleEmailAuthService.getUserInfo()
      if (simpleEmailInfo) return simpleEmailInfo

      // Fallback to other auth methods
      if (this.isProductionMode()) {
        return await web3AuthService.getUserInfo()
      } else {
        return await mockAuthService.getUserInfo()
      }
    } catch {
      return null
    }
  }

  getProvider() {
    if (this.isProductionMode()) {
      return web3AuthService.getProvider()
    } else {
      return mockAuthService.getProvider()
    }
  }

  async getRecoveryFactors(): Promise<string[]> {
    try {
      if (this.isProductionMode()) {
        return await web3AuthService.getRecoveryFactors()
      } else {
        return await mockAuthService.getRecoveryFactors()
      }
    } catch (error) {
      console.error('Failed to get recovery factors:', error)
      return []
    }
  }

  async startRecovery(method: string): Promise<boolean> {
    try {
      if (this.isProductionMode()) {
        return await web3AuthService.startRecovery(method)
      } else {
        return await mockAuthService.startRecovery(method)
      }
    } catch (error) {
      console.error('Failed to start recovery:', error)
      throw new AuthError('Recovery initiation failed', error)
    }
  }
}

export const authService = AuthService.getInstance()