import React from 'react'
import { type ChatMessage } from '@/types/chat'
import { cn } from '@/utils/cn'

interface ChatMessageProps {
  message: ChatMessage
  isLatest?: boolean
  className?: string
}

export function ChatMessage({ message, isLatest = false, className }: ChatMessageProps) {
  const isBot = message.sender === 'bot'
  const isUser = message.sender === 'user'

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  return (
    <div 
      className={cn(
        'flex mb-4 animate-fade-in',
        isBot ? 'justify-start' : 'justify-end',
        className
      )}
    >
      <div 
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3 shadow-sm',
          isBot 
            ? 'bg-white border border-gray-200 text-gray-800' 
            : 'bg-spice-green text-white',
          isLatest && 'animate-slide-in-up'
        )}
      >
        {/* Avatar for bot messages */}
        {isBot && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-spice-green rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-white text-sm">🌱</span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-spice-green mb-1">
                Field Assistant
              </div>
              <div className="text-gray-700 leading-relaxed">
                {typeof message.content === 'string' 
                  ? message.content 
                  : message.content
                }
              </div>
            </div>
          </div>
        )}

        {/* User messages */}
        {isUser && (
          <div className="text-white leading-relaxed">
            {message.type === 'image' && message.metadata?.imagePreview && (
              <div className="mb-2">
                <img 
                  src={message.metadata.imagePreview} 
                  alt="Profile preview"
                  className="w-20 h-20 rounded-lg object-cover border-2 border-white/20"
                />
                {message.metadata.fileName && (
                  <p className="text-xs text-white/80 mt-1">
                    {message.metadata.fileName}
                  </p>
                )}
              </div>
            )}
            
            {typeof message.content === 'string' 
              ? message.content 
              : message.content
            }
          </div>
        )}

        {/* Timestamp */}
        <div 
          className={cn(
            'text-xs mt-2 opacity-60',
            isBot ? 'text-gray-500' : 'text-white/70'
          )}
        >
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  )
}

export default ChatMessage