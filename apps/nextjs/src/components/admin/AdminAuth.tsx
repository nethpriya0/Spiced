import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/useAuth'
import { useFarmerRegistry } from '@/hooks/useFarmerRegistry'
import { ConnectWallet } from '@/components/auth/ConnectWallet'

interface AdminAuthProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'verifier'
}

export function AdminAuth({ children, requiredRole = 'verifier' }: AdminAuthProps) {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const { isVerifier, isInitialized } = useFarmerRegistry()
  const [isChecking, setIsChecking] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (authLoading || !isInitialized) {
        return
      }

      setIsChecking(true)

      try {
        // Check if user is authenticated
        if (!isAuthenticated || !user) {
          setHasAccess(false)
          setIsChecking(false)
          return
        }

        // Check admin wallet address if configured
        const adminWalletAddress = process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS
        const isAdminWallet = adminWalletAddress && 
          user.address.toLowerCase() === adminWalletAddress.toLowerCase()

        // For now, check if user has verifier role or is admin wallet
        const hasVerifierAccess = isVerifier || !!isAdminWallet

        if (requiredRole === 'admin') {
          // Stricter check for admin role - must be admin wallet
          setHasAccess(!!isAdminWallet)
        } else if (requiredRole === 'verifier') {
          // Verifier role check
          setHasAccess(!!hasVerifierAccess)
        }

      } catch (error) {
        console.error('Error checking admin access:', error)
        setHasAccess(false)
      } finally {
        setIsChecking(false)
      }
    }

    checkAdminAccess()
  }, [isAuthenticated, user, isVerifier, isInitialized, authLoading, requiredRole])

  if (authLoading || isChecking || !isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-spice-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Checking admin permissions...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔐</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Admin Access Required
              </h1>
              <p className="text-gray-600">
                Connect your admin wallet to access this area
              </p>
            </div>
            
            <ConnectWallet />
          </div>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    const roleText = requiredRole === 'admin' ? 'administrator' : 'verifier'
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⛔</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h1>
            <p className="text-gray-600 mb-6">
              You don&apos;t have {roleText} permissions to access this area.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">
                <strong>Connected as:</strong><br />
                {user?.name || 'Unknown'}<br />
                <span className="font-mono text-xs">{user?.address}</span>
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-2 px-4 bg-spice-green text-white rounded-lg hover:bg-spice-green-dark"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full py-2 px-4 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}

export default AdminAuth