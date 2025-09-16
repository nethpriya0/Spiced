import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/useAuth'

interface LoadingSpinnerProps {}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = () => (
  <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#2e6a4f] to-[#1e4a37]">
    <div className="flex flex-col items-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
      <p className="text-white">Loading...</p>
    </div>
  </div>
)

export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function AuthenticatedComponent(props: P) {
    const { user, isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/login')
      }
    }, [isAuthenticated, isLoading, router])

    useEffect(() => {
      if (user && !user.profileComplete) {
        router.push('/onboarding/profile-setup')
      }
    }, [user, router])

    if (isLoading) {
      return <LoadingSpinner />
    }

    if (!isAuthenticated) {
      return null
    }

    return <Component {...props} />
  }
}