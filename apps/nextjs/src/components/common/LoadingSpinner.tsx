import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
  className?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  message, 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} border-2 border-spice-green border-t-transparent rounded-full animate-spin`} />
      {message && (
        <p className="text-sm text-gray-600 text-center max-w-xs">
          {message}
        </p>
      )}
    </div>
  )
}

export function PageLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <LoadingSpinner size="lg" message={message} />
    </div>
  )
}

export function InlineLoader({ message }: { message?: string }) {
  return (
    <div className="flex items-center justify-center p-4">
      <LoadingSpinner size="sm" message={message} />
    </div>
  )
}