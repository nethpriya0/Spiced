import { useState } from 'react'
import Head from 'next/head'
import { EmailAuth } from '@/components/auth/EmailAuth'

export default function TestLoginPage() {
  const [authError, setAuthError] = useState<string | null>(null)
  const [authSuccess, setAuthSuccess] = useState<boolean>(false)

  const handleEmailAuthSuccess = (result: { address: string; userInfo: any }) => {
    console.log('✅ Test Login - Email authentication successful:', result)
    setAuthError(null)
    setAuthSuccess(true)
  }

  const handleAuthError = (error: string) => {
    console.error('❌ Test Login - Authentication error:', error)
    setAuthError(error)
    setAuthSuccess(false)
  }

  return (
    <>
      <Head>
        <title>Test Login - WebAuthn Email Authentication</title>
        <meta name="description" content="Test page for WebAuthn email authentication" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🧪 WebAuthn Test Page
            </h1>
            <p className="text-gray-600">
              Direct test of email authentication
            </p>
          </div>

          {authSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              <h3 className="font-semibold">✅ Authentication Successful!</h3>
              <p className="text-sm mt-1">WebAuthn email authentication is working correctly.</p>
            </div>
          )}

          {authError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <h3 className="font-semibold">❌ Authentication Error</h3>
              <p className="text-sm mt-1">{authError}</p>
            </div>
          )}

          <EmailAuth 
            onSuccess={handleEmailAuthSuccess}
            onError={handleAuthError}
          />

          <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
            <h4 className="font-semibold mb-2">🔍 Debug Info:</h4>
            <ul className="space-y-1">
              <li>• Browser support: {typeof window !== 'undefined' && 'PublicKeyCredential' in window ? '✅ WebAuthn supported' : '❌ WebAuthn not supported'}</li>
              <li>• Page: Direct test (no auth middleware)</li>
              <li>• Console: Check browser console for detailed logs</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}