import { useState, useCallback } from 'react'
import { type ToastProps } from '@/components/common/Toast'

export interface ToastOptions {
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const addToast = useCallback((type: ToastProps['type'], options: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9)
    
    const toast: ToastProps = {
      id,
      type,
      ...options,
      onClose: () => removeToast(id)
    }

    setToasts(prev => [...prev, toast])
    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const success = useCallback((options: ToastOptions) => {
    return addToast('success', options)
  }, [addToast])

  const error = useCallback((options: ToastOptions) => {
    return addToast('error', { duration: 0, ...options }) // Errors don't auto-dismiss
  }, [addToast])

  const warning = useCallback((options: ToastOptions) => {
    return addToast('warning', options)
  }, [addToast])

  const info = useCallback((options: ToastOptions) => {
    return addToast('info', options)
  }, [addToast])

  const clearAll = useCallback(() => {
    setToasts([])
  }, [])

  return {
    toasts,
    success,
    error,
    warning,
    info,
    removeToast,
    clearAll
  }
}