import { useState } from 'react'
import { Mail, Key, UserPlus, LogIn, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface EmailAuthProps {
  onSuccess: (result: { address: string; userInfo: any }) => void
  onError: (error: string) => void
}

export function EmailAuth({ onSuccess, onError }: EmailAuthProps) {
  const { loginWithEmail, registerWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      onError('Please enter a valid email address')
      return
    }

    if (!isLogin && (!name || name.trim().length < 2)) {
      onError('Please enter your name (at least 2 characters)')
      return
    }

    setIsLoading(true)
    
    try {
      if (isLogin) {
        console.log('🔑 [EmailAuth] Starting login for:', email)
        await loginWithEmail(email)
      } else {
        console.log('🔑 [EmailAuth] Starting registration for:', email)
        await registerWithEmail(email, name)
      }
      
      console.log('✅ [EmailAuth] Authentication successful')
      onSuccess({
        address: 'pending', // Will be set by useAuth hook
        userInfo: { email, name }
      })
      
    } catch (error: any) {
      console.error('❌ [EmailAuth] Authentication failed:', error)
      
      // Handle specific WebAuthn errors
      if (error.message?.includes('already exists')) {
        onError('An account with this email already exists. Please use login instead.')
        setIsLogin(true)
      } else if (error.message?.includes('not found')) {
        onError('No account found with this email. Please register first.')
        setIsLogin(false)
      } else if (error.message?.includes('cancelled')) {
        onError('Authentication was cancelled. Please try again.')
      } else if (error.message?.includes('not supported')) {
        onError('Your browser does not support passkey authentication. Please use a modern browser or Web3Auth instead.')
      } else {
        onError(error.message || 'Authentication failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setName('')
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Sign In' : 'Create Account'}
          </h2>
          <p className="text-gray-600">
            {isLogin 
              ? 'Sign in with your email and passkey' 
              : 'Create a secure account with email and passkey'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Name Input (Registration only) */}
          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserPlus className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your full name"
                  required
                  disabled={isLoading}
                  minLength={2}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {isLogin ? 'Signing In...' : 'Creating Account...'}
              </>
            ) : (
              <>
                {isLogin ? <LogIn className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                {isLogin ? 'Sign In with Passkey' : 'Create Account with Passkey'}
              </>
            )}
          </button>

          {/* Toggle Mode */}
          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
              disabled={isLoading}
            >
              {isLogin 
                ? "Don&apos;t have an account? Create one" 
                : 'Already have an account? Sign in'
              }
            </button>
          </div>
        </form>

        {/* Advanced Options */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            {showAdvanced ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showAdvanced ? 'Hide' : 'Show'} advanced options
          </button>
          
          {showAdvanced && (
            <div className="mt-4 space-y-3 text-xs text-gray-500">
              <div className="flex items-start gap-2">
                <Key className="h-4 w-4 mt-0.5 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-700">Passkey Authentication</p>
                  <p>Uses your device's built-in security (Face ID, Touch ID, Windows Hello, or security key)</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 text-green-500" />
                <div>
                  <p className="font-medium text-gray-700">Email Recovery</p>
                  <p>Your email can be used to register new passkeys if you lose access to your device</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 mt-0.5 text-purple-500">🔒</span>
                <div>
                  <p className="font-medium text-gray-700">Privacy & Security</p>
                  <p>Your private keys are generated locally and never leave your device</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Browser Support Info */}
      <div className="mt-6 text-center text-xs text-gray-500 space-y-1">
        <p>💡 Passkey authentication works best on:</p>
        <p>iPhone/iPad (iOS 16+), Mac (macOS Monterey+), Android (9+), Windows (10+)</p>
        <p>Chrome, Safari, Firefox, and Edge browsers</p>
      </div>
    </div>
  )
}