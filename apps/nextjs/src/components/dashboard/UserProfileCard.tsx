import React from 'react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { useFarmerDashboard } from '@/hooks/useFarmerDashboard'
import { User, Loader } from 'lucide-react'

interface UserProfileCardProps {
  className?: string
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({ className }) => {
  const { user } = useAuth()
  const { profile, isLoading } = useFarmerDashboard()

  if (!user) {
    return null
  }

  if (isLoading) {
    return (
      <div className={`p-4 ${className || ''}`}>
        <div className="flex flex-col items-center space-y-3">
          <div className="h-16 w-16 bg-slate-200 rounded-full flex items-center justify-center animate-pulse">
            <Loader className="h-6 w-6 text-slate-400 animate-spin" />
          </div>
          <div className="text-center">
            <div className="h-4 w-24 bg-slate-200 rounded animate-pulse mb-2"></div>
            <div className="h-3 w-16 bg-slate-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  const userData = profile || {
    name: "Loading...",
    profilePictureHash: "",
    reputationScore: 0,
    isVerified: user.isVerified
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <div className={`p-4 ${className || ''}`}>
      <div className="flex flex-col items-center space-y-3">
        <Avatar className="h-16 w-16">
          <AvatarImage 
            src={userData.profilePictureHash ? `https://ipfs.io/ipfs/${userData.profilePictureHash}` : undefined}
            alt={userData.name}
          />
          <AvatarFallback className="bg-[#2e6a4f] text-white">
            {userData.name ? getInitials(userData.name) : <User className="h-8 w-8" />}
          </AvatarFallback>
        </Avatar>
        
        <div className="text-center">
          <h3 className="font-semibold text-slate-800">
            {userData.name}
          </h3>
          {userData.isVerified && (
            <div className="flex items-center justify-center gap-1 text-sm text-green-600">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Verified
            </div>
          )}
          <div className="text-sm text-slate-600">
            Reputation: {userData.reputationScore}/5.0
          </div>
        </div>
        
        <Link href="/profile" className="w-full">
          <Button variant="outline" size="sm" className="w-full">
            View Public Profile
          </Button>
        </Link>
      </div>
    </div>
  )
}