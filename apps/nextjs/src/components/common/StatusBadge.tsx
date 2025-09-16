import React from 'react'
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react'

type StatusType = 'success' | 'pending' | 'error' | 'warning'

interface StatusBadgeProps {
  status: StatusType
  text: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function StatusBadge({ 
  status, 
  text, 
  size = 'md',
  className = '' 
}: StatusBadgeProps) {
  const configs = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      iconColor: 'text-green-600'
    },
    pending: {
      icon: Clock,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-600'
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      iconColor: 'text-red-600'
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-800',
      iconColor: 'text-orange-600'
    }
  }

  const sizes = {
    sm: {
      padding: 'px-2 py-1',
      text: 'text-xs',
      icon: 'w-3 h-3'
    },
    md: {
      padding: 'px-3 py-1',
      text: 'text-sm',
      icon: 'w-4 h-4'
    },
    lg: {
      padding: 'px-4 py-2',
      text: 'text-base',
      icon: 'w-5 h-5'
    }
  }

  const config = configs[status]
  const sizeConfig = sizes[size]
  const Icon = config.icon

  return (
    <span className={`
      inline-flex items-center gap-1.5 rounded-full font-medium
      ${config.bgColor} ${config.textColor} ${sizeConfig.padding} ${sizeConfig.text}
      ${className}
    `}>
      <Icon className={`${config.iconColor} ${sizeConfig.icon}`} />
      {text}
    </span>
  )
}

// Preset badges for common statuses
export const StatusBadges = {
  Verified: () => <StatusBadge status="success" text="Verified" />,
  Pending: () => <StatusBadge status="pending" text="Pending Verification" />,
  InProgress: () => <StatusBadge status="pending" text="In Progress" />,
  Locked: () => <StatusBadge status="success" text="Locked" />,
  ReadyForSale: () => <StatusBadge status="success" text="Ready for Sale" />,
  Sold: () => <StatusBadge status="warning" text="Sold" />,
  Failed: () => <StatusBadge status="error" text="Failed" />,
}