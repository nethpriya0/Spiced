import React, { useState, useEffect, useRef, useCallback } from 'react'
import { type ChatMessage, type ChatConversationState, type ConversationStep } from '@/types/chat'
import { ChatMessage as ChatMessageComponent } from './ChatMessage'
import { ChatTypingIndicator } from './ChatTypingIndicator'
import { ChatInput } from './ChatInput'
import { cn } from '@/utils/cn'

interface ChatbotInterfaceProps {
  initialStep?: ConversationStep
  onStepChange?: (step: ConversationStep) => void
  onMessageSend?: (message: ChatMessage) => void
  onComplete?: (responses: ChatConversationState['userResponses']) => void
  className?: string
}

export function ChatbotInterface({
  initialStep = 'welcome',
  onStepChange,
  onMessageSend,
  onComplete,
  className
}: ChatbotInterfaceProps) {
  const [conversationState, setConversationState] = useState<ChatConversationState>({
    step: initialStep,
    messages: [],
    userResponses: {},
    isComplete: false,
    isLoading: false
  })

  const [isTyping, setIsTyping] = useState(false)
  const [inputDisabled, setInputDisabled] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversationState.messages, isTyping])

  // Generate unique message ID
  const generateMessageId = () => `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // Add a new message to the conversation
  const addMessage = useCallback((content: string | React.ReactNode, sender: 'bot' | 'user', type: ChatMessage['type'] = 'text', metadata?: ChatMessage['metadata']) => {
    const newMessage: ChatMessage = {
      id: generateMessageId(),
      content,
      sender,
      timestamp: new Date(),
      type,
      metadata
    }

    setConversationState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }))

    onMessageSend?.(newMessage)
    return newMessage
  }, [onMessageSend])

  // Simulate bot typing and then send message
  const sendBotMessage = useCallback(async (content: string | React.ReactNode, delay: number = 1000, type?: ChatMessage['type']) => {
    setIsTyping(true)
    setInputDisabled(true)

    await new Promise(resolve => setTimeout(resolve, delay))

    setIsTyping(false)
    addMessage(content, 'bot', type)
    
    // Small delay before enabling input
    setTimeout(() => setInputDisabled(false), 300)
  }, [addMessage])

  // Handle user message and advance conversation
  const handleUserMessage = async (message: string) => {
    addMessage(message, 'user')
    await advanceConversation(message)
  }

  // Main conversation flow logic
  const advanceConversation = async (userInput: string) => {
    const { step, userResponses } = conversationState

    switch (step) {
      case 'welcome':
        // Update state to name step
        setConversationState(prev => ({ ...prev, step: 'name' }))
        await sendBotMessage(
          "Great to meet you! I'm excited to help you join our community of verified farmers. Let's start with the basics - what would you like to be called? This will be your public farmer name that buyers see on the platform.",
          1500
        )
        break

      case 'name':
        if (userInput.trim().length < 2) {
          await sendBotMessage(
            "I'd love to know your name! Please tell me what you'd like to be called - it should be at least 2 characters long.",
            800
          )
          return
        }

        // Save name and move to bio step
        const updatedResponses = { ...userResponses, name: userInput.trim() }
        setConversationState(prev => ({ 
          ...prev, 
          step: 'bio',
          userResponses: updatedResponses
        }))

        await sendBotMessage(
          `Nice to meet you, ${userInput.trim()}! 🌱 Now, tell us a bit about yourself and your farming journey. What spices do you grow? Where are you located? What makes your farming special? This helps buyers understand your story and connect with you personally.`,
          1500
        )
        break

      case 'bio':
        if (userInput.trim().length < 10) {
          await sendBotMessage(
            "That's a good start! Could you tell me a bit more? Think of this as your elevator pitch to buyers. They love to know: Where are you farming? What spices are you passionate about? Is your farm family-owned? Do you use organic methods? What makes your spices special? 🌶️",
            1200
          )
          return
        }

        // Save bio and move to profile picture step
        const updatedBio = { ...userResponses, bio: userInput.trim() }
        setConversationState(prev => ({ 
          ...prev, 
          step: 'profile-picture',
          userResponses: updatedBio
        }))

        await sendBotMessage(
          "Wonderful! That gives buyers a great sense of who you are and your farming passion. 📸 Now let's add a profile picture - this is where the magic happens! Buyers love seeing the face behind their food. A friendly photo of you in your fields or with your spices works great.",
          1500
        )
        break

      case 'profile-picture':
        // This step handles file uploads differently
        await sendBotMessage(
          "Perfect! Let me help you upload that. The file upload interface will appear below.",
          800
        )
        break

      case 'review':
        if (userInput.toLowerCase().includes('yes') || userInput.toLowerCase().includes('confirm') || userInput.toLowerCase().includes('looks good')) {
          setConversationState(prev => ({ 
            ...prev, 
            step: 'saving',
            isLoading: true
          }))

          await sendBotMessage(
            "Perfect! I&apos;m now saving your profile securely on the blockchain. This might take a moment...",
            800,
            'loading'
          )

          // Trigger the completion callback
          onComplete?.(conversationState.userResponses)
        } else {
          await sendBotMessage(
            "No problem! What would you like to change? You can tell me and we&apos;ll go back to update that information.",
            800
          )
        }
        break

      case 'saving':
        // This step is handled externally
        break

      case 'complete':
        await sendBotMessage(
          "🎉 Congratulations! Your farmer profile is now live on the blockchain and visible to buyers worldwide! You've just taken the first step towards building direct relationships with spice lovers who value authenticity and quality. Your dashboard awaits - let's explore what's next on your journey! 🚀",
          1500
        )
        break

      default:
        await sendBotMessage(
          "I&apos;m not sure how to help with that. Let me guide you through the profile setup process.",
          800
        )
    }

    // Notify parent of step change
    onStepChange?.(conversationState.step)
  }

  // Initialize welcome message
  useEffect(() => {
    if (conversationState.messages.length === 0) {
      const initializeChat = async () => {
        await sendBotMessage(
          "🌱 Welcome to the Spice Platform! I'm your Field Assistant, and I'm thrilled you're here! I'll help you create an amazing farmer profile that tells your story and helps buyers discover your incredible spices. This journey takes just a few minutes, but it's the foundation of your success here. Ready to plant the seeds of your digital presence?",
          2500
        )
      }
      
      initializeChat()
    }
  }, [conversationState.messages.length, sendBotMessage])

  // Handle file upload for profile picture
  const handleFileUpload = (file: File) => {
    // Create image preview URL
    const imagePreview = URL.createObjectURL(file)
    
    // Add user message with file
    addMessage(
      `Uploaded: ${file.name}`,
      'user',
      'image',
      {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        imagePreview
      }
    )

    // Update conversation state with file
    setConversationState(prev => ({
      ...prev,
      step: 'review',
      userResponses: {
        ...prev.userResponses,
        profilePictureFile: file
      }
    }))

    // Show review step
    setTimeout(async () => {
      const { name, bio } = conversationState.userResponses
      await sendBotMessage(
        <div>
          <p className="mb-3">Excellent! Here&apos;s your profile preview:</p>
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex items-start space-x-3">
              <img 
                src={imagePreview} 
                alt="Profile preview"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h4 className="font-semibold text-gray-900">{name}</h4>
                <p className="text-gray-600 text-sm mt-1">{bio}</p>
              </div>
            </div>
          </div>
          <p className="mt-3">Does everything look good? Type &quot;yes&quot; to save your profile!</p>
        </div>,
        1500
      )
    }, 500)
  }

  const currentStep = conversationState.step

  return (
    <div className={cn('flex flex-col h-full bg-gradient-to-b from-green-50 to-white', className)}>
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-spice-green rounded-full flex items-center justify-center">
            <span className="text-white text-lg">🌱</span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Profile Setup Assistant</h2>
            <p className="text-sm text-gray-600">Let&apos;s get you set up on the platform</p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>
              {currentStep === 'welcome' && '0/4'}
              {currentStep === 'name' && '1/4'}
              {currentStep === 'bio' && '2/4'}
              {currentStep === 'profile-picture' && '3/4'}
              {(currentStep === 'review' || currentStep === 'saving' || currentStep === 'complete') && '4/4'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-spice-green h-2 rounded-full transition-all duration-500"
              style={{
                width: 
                  currentStep === 'welcome' ? '0%' :
                  currentStep === 'name' ? '25%' :
                  currentStep === 'bio' ? '50%' :
                  currentStep === 'profile-picture' ? '75%' :
                  '100%'
              }}
            />
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-2"
        style={{ minHeight: '300px', maxHeight: '60vh' }}
      >
        {conversationState.messages.map((message, index) => (
          <ChatMessageComponent
            key={message.id}
            message={message}
            isLatest={index === conversationState.messages.length - 1}
          />
        ))}
        
        <ChatTypingIndicator isVisible={isTyping} />
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {currentStep === 'profile-picture' && !conversationState.userResponses.profilePictureFile ? (
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(file)
              }}
              className="hidden"
              id="profile-picture-upload"
            />
            <label
              htmlFor="profile-picture-upload"
              className="cursor-pointer block"
            >
              <div className="text-4xl mb-2">📷</div>
              <p className="text-gray-600 font-medium">Click to upload profile picture</p>
              <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 5MB</p>
            </label>
          </div>
        </div>
      ) : (
        <ChatInput
          onSend={handleUserMessage}
          disabled={inputDisabled || conversationState.isLoading}
          placeholder={
            currentStep === 'name' ? 'Enter your farmer name...' :
            currentStep === 'bio' ? 'Tell us about yourself and your farming...' :
            currentStep === 'review' ? 'Type &quot;yes&quot; to confirm or tell me what to change...' :
            'Type your response...'
          }
          multiline={currentStep === 'bio'}
          maxLength={currentStep === 'bio' ? 1000 : 100}
        />
      )}
    </div>
  )
}

export default ChatbotInterface