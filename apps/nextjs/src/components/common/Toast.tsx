import React, { useEffect, useState } from 'react'
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface ToastProps {
  id: string
  title: string
  message?: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  onClose: () => void
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50 border-green-200',
    iconColor: 'text-green-600',
    titleColor: 'text-green-900',
    messageColor: 'text-green-700'
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-50 border-red-200',
    iconColor: 'text-red-600',
    titleColor: 'text-red-900',
    messageColor: 'text-red-700'
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-amber-50 border-amber-200',
    iconColor: 'text-amber-600',
    titleColor: 'text-amber-900',
    messageColor: 'text-amber-700'
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-900',
    messageColor: 'text-blue-700'
  }
}

export const Toast: React.FC<ToastProps> = ({
  id,
  title,
  message,
  type,
  duration = 5000,
  action,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const [isExiting, setIsExiting] = useState(false)
  
  const config = toastConfig[type]
  const Icon = config.icon

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose()
    }, 150) // Animation duration
  }

  if (!isVisible) return null

  return (
    <div
      className={cn(
        'max-w-sm w-full pointer-events-auto overflow-hidden rounded-lg border shadow-lg transition-all duration-150 ease-out',
        config.bgColor,
        isExiting ? 'transform translate-x-full opacity-0' : 'transform translate-x-0 opacity-100'
      )}
      role="alert"
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={cn('h-5 w-5', config.iconColor)} />
          </div>
          
          <div className="ml-3 w-0 flex-1">
            <p className={cn('text-sm font-medium', config.titleColor)}>
              {title}
            </p>
            {message && (
              <p className={cn('mt-1 text-sm', config.messageColor)}>
                {message}
              </p>
            )}
            {action && (
              <div className="mt-3">
                <button
                  onClick={action.onClick}
                  className={cn(
                    'text-sm font-medium underline hover:no-underline transition-colors',
                    type === 'success' ? 'text-green-600 hover:text-green-500' :
                    type === 'error' ? 'text-red-600 hover:text-red-500' :
                    type === 'warning' ? 'text-amber-600 hover:text-amber-500' :
                    'text-blue-600 hover:text-blue-500'
                  )}
                >
                  {action.label}
                </button>
              </div>
            )}
          </div>
          
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleClose}
              className={cn(
                'rounded-md inline-flex hover:opacity-75 transition-opacity',
                config.iconColor
              )}
              aria-label="Close notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Toast Container Component
interface ToastContainerProps {
  toasts: ToastProps[]
  onRemoveToast: (id: string) => void
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemoveToast }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end">
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={() => onRemoveToast(toast.id)}
          />
        ))}
      </div>
    </div>
  )
}

export default Toast