import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { withAuth } from '@/middleware/withAuth'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { useFirstTimeUser } from '@/hooks/useFirstTimeUser'

const DashboardPage: React.FC = () => {
  const router = useRouter()
  const { 
    isFirstTime, 
    isVerified, 
    needsVerification, 
    needsProfileSetup, 
    isLoading 
  } = useFirstTimeUser()

  useEffect(() => {
    // Redirect to profile setup if this is a first-time verified user
    if (needsProfileSetup) {
      router.push('/onboarding/profile-setup')
      return
    }

    // Show verification message if user needs verification
    // (This will be handled by the dashboard layout)
  }, [needsProfileSetup, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-spice-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout 
      title="Dashboard - Your Digital Field Journal" 
      showVerificationBanner={needsVerification}
    />
  )
}

export default withAuth(DashboardPage)