import { useState } from 'react'
import { Mail, UserPlus, LogIn, CheckCircle } from 'lucide-react'
import { simpleEmailAuthService } from '@/lib/auth/SimpleEmailAuthService'

interface SimpleEmailAuthProps {
  onSubmit: (email: string, name?: string, isRegistering?: boolean) => Promise<void>
  onError: (error: string) => void
  isLoading?: boolean
}

export function SimpleEmailAuth({ onSubmit, onError, isLoading = false }: SimpleEmailAuthProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isLogin, setIsLogin] = useState(true)

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

    try {
      await onSubmit(email, name, !isLogin)
    } catch (error: any) {
      console.error('❌ [SimpleEmailAuth] Authentication failed:', error)

      // Handle specific errors
      if (error.message?.includes('already exists')) {
        onError('An account with this email already exists. Please use login instead.')
        setIsLogin(true)
      } else if (error.message?.includes('not found')) {
        onError('No account found with this email. Please register first.')
        setIsLogin(false)
      } else {
        onError(error.message || 'Authentication failed. Please try again.')
      }
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
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Sign In' : 'Create Account'}
          </h2>
          <p className="text-gray-600">
            {isLogin 
              ? 'Sign in with your email address' 
              : 'Create a secure account with your email'
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
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {isLogin ? 'Signing In...' : 'Creating Account...'}
              </>
            ) : (
              <>
                {isLogin ? <LogIn className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                {isLogin ? 'Sign In' : 'Create Account'}
              </>
            )}
          </button>

          {/* Toggle Mode */}
          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-green-600 hover:text-green-800 underline"
              disabled={isLoading}
            >
              {isLogin 
                ? "Don't have an account? Create one" 
                : 'Already have an account? Sign in'
              }
            </button>
          </div>
        </form>

        {/* Features */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="space-y-3 text-xs text-gray-500">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
              <div>
                <p className="font-medium text-gray-700">Secure Wallet Generation</p>
                <p>Your wallet address is generated deterministically from your email</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
              <div>
                <p className="font-medium text-gray-700">Easy Recovery</p>
                <p>Access your wallet anytime with just your email address</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
              <div>
                <p className="font-medium text-gray-700">No Complex Setup</p>
                <p>No seed phrases, no wallet downloads - just your email</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-6 text-center text-xs text-gray-500 space-y-1">
        <p>🔒 <strong>Secure:</strong> Your wallet is generated using cryptographic hashing</p>
        <p>🔑 <strong>Deterministic:</strong> Same email always generates the same wallet address</p>
        <p>💾 <strong>Local Storage:</strong> Your session is stored locally in your browser</p>
      </div>
    </div>
  )
}