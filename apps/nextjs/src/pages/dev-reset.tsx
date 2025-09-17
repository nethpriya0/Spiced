import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { useAuth } from '@/hooks/useAuth'

// Make this component client-side only to avoid SSR localStorage issues
const DevResetClient = dynamic(() => Promise.resolve(DevResetClientComponent), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-spice-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
})

function DevResetClientComponent() {
  const router = useRouter()
  const { logout } = useAuth()
  const [profileComplete, setProfileComplete] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  // Access localStorage on client side
  useEffect(() => {
    setIsClient(true)
    if (typeof window !== 'undefined') {
      setProfileComplete(localStorage.getItem('user_profile_complete'))
    }
  }, [])

  const handleResetProfile = () => {
    if (typeof window !== 'undefined') {
      // Clear all registration-related localStorage
      localStorage.removeItem('user_profile_complete')
      localStorage.removeItem('buyer_profile_complete')
      localStorage.removeItem('farmer_registered')
      localStorage.clear()
      setProfileComplete(null)
    }

    // Logout current user
    logout()

    // Redirect to homepage
    router.push('/')
  }

  const handleTestFarmerRegistration = () => {
    if (typeof window !== 'undefined') {
      // Clear profile completion flag
      localStorage.removeItem('user_profile_complete')
      setProfileComplete(null)
    }
    
    // Go directly to farmer registration
    router.push('/login?role=farmer&register=true')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          🔧 Development Tools
        </h1>
        
        <div className="space-y-4">
          <button
            onClick={handleResetProfile}
            className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
          >
            🔄 Reset Everything (Logout & Clear Data)
          </button>
          
          <button
            onClick={handleTestFarmerRegistration}
            className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
          >
            🌾 Test Farmer Registration Flow
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
          >
            🏠 Back to Homepage
          </button>
        </div>

{isClient && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
            <p><strong>Debug Info:</strong></p>
            <p>Profile Complete: {profileComplete || 'false'}</p>
            <p>URL: {router.asPath}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DevReset() {
  return <DevResetClient />
}