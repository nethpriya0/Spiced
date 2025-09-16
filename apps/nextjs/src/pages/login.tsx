import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { ShoppingCart, Sprout, ArrowLeft, Mail, Wallet, Leaf } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ConnectWallet } from '@/components/auth/ConnectWallet'
import { SimpleEmailAuth } from '@/components/auth/SimpleEmailAuth'

type UserRole = 'farmer' | 'buyer' | null
type AuthMethod = 'email' | 'wallet' | null

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<UserRole>(null)
  const [selectedAuthMethod, setSelectedAuthMethod] = useState<AuthMethod>(null)
  const [authError, setAuthError] = useState<string | null>(null)

  // Get role from query params if redirected from marketplace
  useEffect(() => {
    const role = router.query.role as UserRole
    if (role === 'farmer' || role === 'buyer') {
      setSelectedRole(role)
    }
  }, [router.query])

  // Handle authentication success
  const handleAuthSuccess = (result: { address: string; userInfo: any }) => {
    setAuthError(null)
    
    // Simple redirect based on role
    if (selectedRole === 'farmer') {
      router.push('/onboarding/profile-setup')
    } else if (selectedRole === 'buyer') {
      router.push('/marketplace')
    } else {
      router.push('/dashboard')
    }
  }

  // Handle email authentication success
  const handleEmailAuthSuccess = (result: { address: string; userInfo: any }) => {
    handleAuthSuccess(result)
  }

  // Handle authentication errors
  const handleAuthError = (error: string) => {
    console.error('Authentication error:', error)
    setAuthError(error || 'An unexpected error occurred. Please try again.')
  }

  // Clear role selection to go back
  const handleBackToRoleSelection = () => {
    setSelectedRole(null)
    setSelectedAuthMethod(null)
    setAuthError(null)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is authenticated but no role is selected, allow them to select a role
  // This handles the "Get Started" button case where users want to access the platform

  const renderRoleSelection = () => (
    <div className="max-w-2xl w-full">
      <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Welcome to Spiced
          </h1>
          <p className="text-gray-600 text-lg sm:text-xl">
            What brings you to our authentic spice marketplace?
          </p>
        </div>

        <div className="space-y-4">
          {/* Farmer Option */}
          <button
            onClick={() => setSelectedRole('farmer')}
            className="w-full group relative p-6 border-2 border-gray-200 rounded-xl hover:border-orange-400 hover:shadow-lg transition-all duration-200 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                <Sprout className="h-8 w-8 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  🌾 I grow spices
                </h3>
                <p className="text-gray-600">
                  Sell your authentic Sri Lankan spices directly to buyers worldwide
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    <span>List your spice products</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    <span>Manage inventory & orders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    <span>Track blockchain certificates</span>
                  </div>
                </div>
              </div>
            </div>
          </button>

          {/* Buyer Option */}
          <button
            onClick={() => setSelectedRole('buyer')}
            className="w-full group relative p-6 border-2 border-gray-200 rounded-xl hover:border-green-400 hover:shadow-lg transition-all duration-200 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <ShoppingCart className="h-8 w-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  🛒 I want to buy spices
                </h3>
                <p className="text-gray-600">
                  Discover premium authentic spices with verified quality and provenance
                </p>
              </div>
            </div>
          </button>

          {/* Browse Option */}
          <button
            onClick={() => router.push('/marketplace')}
            className="w-full group relative p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 text-center"
          >
            <div className="text-gray-600 group-hover:text-blue-600">
              <span className="text-sm">👀 Just browsing? </span>
              <span className="text-sm font-medium">Explore our marketplace</span>
            </div>
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Don&apos;t worry - you can always switch roles later in your account settings
          </p>
        </div>
      </div>
    </div>
  )

  const renderAuthMethodSelection = () => (
    <div className="max-w-md w-full">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Back Button */}
        <button
          onClick={handleBackToRoleSelection}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back</span>
        </button>

        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            selectedRole === 'farmer' ? 'bg-orange-100' : 'bg-green-100'
          }`}>
            {selectedRole === 'farmer' ? (
              <Sprout className="h-8 w-8 text-orange-600" />
            ) : (
              <ShoppingCart className="h-8 w-8 text-green-600" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {selectedRole === 'farmer' ? '🌾 Farmer Sign In' : '🛒 Buyer Sign In'}
          </h1>
          <p className="text-gray-600">
            Sign in to get started
          </p>
        </div>

        {/* Auth Method Selection */}
        <div className="space-y-4 mb-8">
          <button
            onClick={() => setSelectedAuthMethod('email')}
            className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-orange-400 hover:shadow-lg transition-all duration-200 text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                <Mail className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Email & Passkey</h3>
                <p className="text-sm text-gray-600">Quick sign in with email verification</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelectedAuthMethod('wallet')}
            className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-amber-500 hover:shadow-lg transition-all duration-200 text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                <Wallet className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Web3 Wallet</h3>
                <p className="text-sm text-gray-600">Connect with social login or existing wallet</p>
              </div>
            </div>
          </button>
        </div>

        <div className="text-xs text-gray-500 text-center space-y-2">
          <p>🔒 Both methods create secure blockchain wallets</p>
          <p>🔑 You maintain full control of your private keys</p>
        </div>
      </div>
    </div>
  )

  const renderEmailAuth = () => (
    <div className="max-w-md w-full">
      {/* Back Button */}
      <button
        onClick={() => setSelectedAuthMethod(null)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm">Back to sign-in options</span>
      </button>

      {authError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {authError}
        </div>
      )}

      <SimpleEmailAuth 
        onSuccess={handleEmailAuthSuccess}
        onError={handleAuthError}
      />
    </div>
  )

  const renderWalletConnection = () => (
    <div className="max-w-md w-full">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Back Button */}
        <button
          onClick={() => setSelectedAuthMethod(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back to sign-in options</span>
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Connect Web3 Wallet
          </h2>
          <p className="text-gray-600">
            Connect using social login or existing Web3 wallets
          </p>
        </div>

        {authError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {authError}
          </div>
        )}
        
        <ConnectWallet />
        
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="text-xs text-gray-500 text-center space-y-2">
            <p>🔒 Your wallet is secured by Web3Auth</p>
            <p>📱 Recover using email or social login</p>
            <p>🔑 You maintain full control of your private keys</p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-center space-y-2">
        <p className="text-sm text-gray-600">
          Can&apos;t access your wallet?{' '}
          <Link href="/recover" className="text-orange-600 hover:text-orange-700 underline">
            Recover your account
          </Link>
        </p>
        <p className="text-sm text-gray-600">
          New to Web3?{' '}
          <a 
            href="https://web3auth.io/docs/auth-provider-setup/social-providers"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-600 hover:text-orange-700 underline"
          >
            Learn how wallet creation works
          </a>
        </p>
      </div>
    </div>
  )

  return (
    <>
      <Head>
        <title>Login - Spice Platform</title>
        <meta name="description" content="Login to your Spice Platform account" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
        {selectedRole === null ? renderRoleSelection() : 
         selectedAuthMethod === null ? renderAuthMethodSelection() :
         selectedAuthMethod === 'email' ? renderEmailAuth() : 
         renderWalletConnection()}
      </div>
    </>
  )
}