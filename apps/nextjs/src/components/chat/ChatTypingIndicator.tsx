import React from 'react'
import { cn } from '@/utils/cn'

interface ChatTypingIndicatorProps {
  isVisible: boolean
  message?: string
  className?: string
}

export function ChatTypingIndicator({ 
  isVisible, 
  message = 'Field Assistant is typing...', 
  className 
}: ChatTypingIndicatorProps) {
  if (!isVisible) return null

  return (
    <div className={cn('flex justify-start mb-4 animate-fade-in', className)}>
      <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-gray-100 border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-spice-green rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm">🌱</span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-spice-green mb-2">
              Field Assistant
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-gray-600 text-sm">{message}</span>
              <div className="flex space-x-1 ml-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatTypingIndicator