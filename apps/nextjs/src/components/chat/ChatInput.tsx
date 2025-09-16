import React, { useState, useRef } from 'react'
import { cn } from '@/utils/cn'
import { Send } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
  maxLength?: number
  multiline?: boolean
  className?: string
}

export function ChatInput({ 
  onSend, 
  disabled = false, 
  placeholder = 'Type your message...', 
  maxLength = 500,
  multiline = false,
  className 
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const trimmedMessage = message.trim()
    if (!trimmedMessage || disabled) return

    onSend(trimmedMessage)
    setMessage('')
    
    // Focus back to input after sending
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !multiline) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const remainingChars = maxLength - message.length
  const isNearLimit = remainingChars <= 50
  const isOverLimit = remainingChars < 0

  const InputComponent = multiline ? 'textarea' : 'input'

  return (
    <div className={cn('bg-white border-t border-gray-200 p-4', className)}>
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <div className="flex-1">
          <InputComponent
            ref={inputRef}
            type={multiline ? undefined : 'text'}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            rows={multiline ? 3 : undefined}
            className={cn(
              'w-full px-4 py-3 border border-gray-300 rounded-2xl resize-none',
              'focus:outline-none focus:ring-2 focus:ring-spice-green focus:border-transparent',
              'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
              multiline ? 'min-h-[48px]' : 'h-12'
            )}
          />
          
          {/* Character counter */}
          {(isNearLimit || isOverLimit) && (
            <div className={cn(
              'text-xs mt-1 text-right',
              isOverLimit ? 'text-red-500' : 'text-yellow-600'
            )}>
              {remainingChars} characters remaining
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={disabled || !message.trim() || isOverLimit}
          className={cn(
            'h-12 w-12 rounded-full flex items-center justify-center',
            'transition-all duration-200',
            disabled || !message.trim() || isOverLimit
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-spice-green text-white hover:bg-spice-green-dark shadow-md hover:shadow-lg'
          )}
        >
          <Send className="w-5 h-5" />
        </button>
      </form>

      {multiline && (
        <p className="text-xs text-gray-500 mt-2">
          Press Shift + Enter for new line, Enter to send
        </p>
      )}
    </div>
  )
}

export default ChatInput