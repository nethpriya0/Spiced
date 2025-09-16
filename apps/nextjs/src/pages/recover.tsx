import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ArrowLeft, Mail, Shield, Smartphone } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/lib/auth/AuthService'

export default function RecoverPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [recoveryMethod, setRecoveryMethod] = useState<'email' | 'social' | null>(null)
  const [isRecovering, setIsRecovering] = useState(false)
  const [recoveryFactors, setRecoveryFactors] = useState<string[]>([])
  const [error, setError] = useState('')

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  const handleRecoveryMethodSelect = async (method: 'email' | 'social') => {
    setRecoveryMethod(method)
    setError('')
    
    try {
      // Get available recovery factors
      const factors = await authService.getRecoveryFactors()
      setRecoveryFactors(factors)
    } catch (error) {
      console.error('Failed to get recovery factors:', error)
      setError('Failed to check available recovery methods')
    }
  }

  const handleRecover = async () => {
    setIsRecovering(true)
    setError('')
    
    try {
      // Initialize Web3Auth if needed
      await authService.initialize()
      
      // Web3Auth handles recovery through its modal
      // The user will go through their recovery flow
      const result = await authService.login()
      
      if (result) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Recovery failed:', error)
      setError('Recovery failed. Please try again or contact support.')
    } finally {
      setIsRecovering(false)
    }
  }

  const renderMethodSelection = () => (
    <div className="max-w-md w-full">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Recover Your Account
          </h1>
          <p className="text-gray-600">
            Choose how you&apos;d like to recover access to your wallet
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleRecoveryMethodSelect('email')}
            className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all duration-200 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Email Recovery</h3>
                <p className="text-sm text-gray-600">
                  Recover using the email address associated with your account
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleRecoveryMethodSelect('social')}
            className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:shadow-lg transition-all duration-200 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Smartphone className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Social Login Recovery</h3>
                <p className="text-sm text-gray-600">
                  Recover using Google, Apple, or other social providers
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Remember your account details?{' '}
              <Link href="/login" className="text-spice-green hover:text-spice-green-dark underline">
                Try logging in
              </Link>
            </p>
            <p className="text-xs text-gray-500">
              Recovery is powered by Web3Auth&apos;s secure infrastructure
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderRecoveryProcess = () => (
    <div className="max-w-md w-full">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Back Button */}
        <button
          onClick={() => setRecoveryMethod(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back to recovery options</span>
        </button>

        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            recoveryMethod === 'email' ? 'bg-blue-100' : 'bg-green-100'
          }`}>
            {recoveryMethod === 'email' ? (
              <Mail className="h-8 w-8 text-blue-600" />
            ) : (
              <Smartphone className="h-8 w-8 text-green-600" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {recoveryMethod === 'email' ? 'Email Recovery' : 'Social Login Recovery'}
          </h1>
          <p className="text-gray-600">
            We'll help you recover access to your wallet securely
          </p>
        </div>

        {recoveryFactors.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-green-800 mb-2">Available Recovery Methods:</h3>
            <ul className="space-y-1">
              {recoveryFactors.map((factor, index) => (
                <li key={index} className="text-sm text-green-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  {factor.charAt(0).toUpperCase() + factor.slice(1)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleRecover}
          disabled={isRecovering}
          className={`
            w-full px-6 py-4 rounded-lg font-semibold text-white
            transition-all duration-200 transform
            ${
              isRecovering
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-spice-green hover:bg-spice-green-dark hover:scale-105 active:scale-95'
            }
            focus:outline-none focus:ring-4 focus:ring-spice-green/20
            disabled:transform-none
          `}
        >
          {isRecovering ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Recovering Account...</span>
            </div>
          ) : (
            `Start ${recoveryMethod === 'email' ? 'Email' : 'Social'} Recovery`
          )}
        </button>

        <div className="mt-6 space-y-3 text-xs text-gray-500 text-center">
          <p>🔒 Your recovery process is secured by Web3Auth</p>
          <p>📱 You'll receive verification through your chosen method</p>
          <p>🔑 Your private keys remain under your control</p>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <Head>
        <title>Account Recovery - Spice Platform</title>
        <meta name="description" content="Recover access to your Spice Platform account" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        {recoveryMethod === null ? renderMethodSelection() : renderRecoveryProcess()}
      </div>
    </>
  )
}