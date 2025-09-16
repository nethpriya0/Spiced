import React, { useState, useEffect, useRef, useCallback } from 'react'
import { type ChatMessage } from '@/types/chat'
import { 
  type HarvestConversationState, 
  WEIGHT_UNITS,
  type WeightUnit,
  convertWeight
} from '@/types/passport'
import { ChatMessage as ChatMessageComponent } from '@/components/chat/ChatMessage'
import { ChatTypingIndicator } from '@/components/chat/ChatTypingIndicator'
import { ChatInput } from '@/components/chat/ChatInput'
import { cn } from '@/utils/cn'
import { SpiceTypeSelector } from './SpiceTypeSelector'
import { WeightInput } from './WeightInput'
import { QualityClaimsInput } from './QualityClaimsInput'
import { HarvestPhotoUpload } from './HarvestPhotoUpload'
import { generateFarmerBatchId } from '@/lib/utils/batchIdGenerator'

interface LogHarvestChatbotProps {
  onComplete?: (harvestData: HarvestConversationState['harvestData'], batchId: string) => Promise<void>
  onError?: (error: string) => void
  farmerAddress?: string
  className?: string
}

export function LogHarvestChatbot({
  onComplete,
  onError,
  farmerAddress = '0x123...farmer', // Default for development
  className
}: LogHarvestChatbotProps) {
  const [conversationState, setConversationState] = useState<HarvestConversationState>({
    step: 'welcome',
    messages: [],
    harvestData: {},
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
  const addMessage = useCallback((
    content: string | React.ReactNode, 
    sender: 'bot' | 'user', 
    type: ChatMessage['type'] = 'text', 
    metadata?: ChatMessage['metadata']
  ) => {
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

    return newMessage
  }, [])

  // Simulate bot typing and then send message
  const sendBotMessage = useCallback(async (
    content: string | React.ReactNode, 
    delay: number = 1000, 
    type?: ChatMessage['type']
  ) => {
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

  // Handle spice type selection
  const handleSpiceTypeSelect = async (spiceType: string) => {
    addMessage(`Selected: ${spiceType}`, 'user')
    
    setConversationState(prev => ({
      ...prev,
      step: 'harvest-weight',
      harvestData: {
        ...prev.harvestData,
        spiceType
      }
    }))

    await sendBotMessage(
      `Great choice! ${spiceType} is an excellent spice. Now, how much did you harvest? You can enter the weight in kilograms, pounds, or grams - I'll help you convert it.`,
      1200
    )
  }

  // Handle weight input
  const handleWeightInput = async (weight: number, unit: WeightUnit) => {
    const weightInGrams = convertWeight(weight, unit, 'g')
    const displayWeight = `${weight} ${WEIGHT_UNITS[unit].symbol}`
    
    addMessage(`Harvested: ${displayWeight}`, 'user')
    
    setConversationState(prev => ({
      ...prev,
      step: 'quality-claims',
      harvestData: {
        ...prev.harvestData,
        harvestWeight: weightInGrams,
        weightUnit: unit
      }
    }))

    await sendBotMessage(
      `Perfect! ${displayWeight} of ${conversationState.harvestData.spiceType}. Now let's talk about what makes your spice special. What quality attributes would you like to highlight?`,
      1200
    )
  }

  // Handle quality claims selection
  const handleQualityClaimsSelect = async (claims: string[]) => {
    const claimsText = claims.length > 0 ? claims.join(', ') : 'No special claims'
    addMessage(`Quality claims: ${claimsText}`, 'user')
    
    setConversationState(prev => ({
      ...prev,
      step: 'harvest-photo',
      harvestData: {
        ...prev.harvestData,
        qualityClaims: claims
      }
    }))

    await sendBotMessage(
      "Excellent! Those quality attributes will really help buyers understand your product. Now let's add a photo of your harvest. A good photo helps build trust and shows the quality of your spice.",
      1200
    )
  }

  // Handle photo upload
  const handlePhotoUpload = async (file: File) => {
    const imagePreview = URL.createObjectURL(file)
    
    addMessage(
      `Uploaded photo: ${file.name}`,
      'user',
      'image',
      {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        imagePreview
      }
    )

    setConversationState(prev => ({
      ...prev,
      step: 'review-harvest',
      harvestData: {
        ...prev.harvestData,
        harvestPhotoFile: file,
        harvestPhotoPreview: imagePreview
      }
    }))

    // Show review step
    setTimeout(async () => {
      const { spiceType, harvestWeight, weightUnit, qualityClaims } = conversationState.harvestData
      const displayWeight = weightUnit ? 
        `${convertWeight(harvestWeight || 0, 'g', weightUnit).toFixed(2)} ${WEIGHT_UNITS[weightUnit].symbol}` :
        `${harvestWeight}g`

      await sendBotMessage(
        <div>
          <p className="mb-3">Perfect! Here&apos;s your harvest summary:</p>
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Spice Type:</strong>
                <p className="text-gray-700">{spiceType}</p>
              </div>
              <div>
                <strong>Weight:</strong>
                <p className="text-gray-700">{displayWeight}</p>
              </div>
              <div className="col-span-2">
                <strong>Quality Claims:</strong>
                <p className="text-gray-700">{qualityClaims?.join(', ') || 'None specified'}</p>
              </div>
              <div className="col-span-2">
                <strong>Photo:</strong>
                <img 
                  src={imagePreview} 
                  alt="Harvest preview"
                  className="w-full max-w-xs h-24 object-cover rounded border mt-1"
                />
              </div>
            </div>
          </div>
          <p className="mt-3">Does everything look correct? Type &quot;confirm&quot; to create your digital passport on the blockchain!</p>
        </div>,
        1500
      )
    }, 500)
  }

  // Main conversation flow logic
  const advanceConversation = async (userInput: string) => {
    const { step } = conversationState

    switch (step) {
      case 'welcome':
        setConversationState(prev => ({ ...prev, step: 'spice-type' }))
        await sendBotMessage(
          "Wonderful! Let's create your first digital passport. This creates an immutable record of your harvest that buyers can verify. First, what type of spice did you harvest?",
          1500
        )
        break

      case 'spice-type':
        // This step is handled by SpiceTypeSelector component
        break

      case 'harvest-weight':
        // This step is handled by WeightInput component
        break

      case 'quality-claims':
        // This step is handled by QualityClaimsInput component
        break

      case 'harvest-photo':
        // This step is handled by HarvestPhotoUpload component
        break

      case 'review-harvest':
        if (userInput.toLowerCase().includes('confirm') || 
            userInput.toLowerCase().includes('yes') || 
            userInput.toLowerCase().includes('looks good')) {
          
          setConversationState(prev => ({ 
            ...prev, 
            step: 'creating-passport',
            isLoading: true
          }))

          await sendBotMessage(
            "Perfect! I&apos;m now creating your digital passport on the blockchain. This will store your harvest data securely and generate your unique batch ID and QR code. Please wait a moment...",
            800,
            'loading'
          )

          try {
            // Generate batch ID
            const batchId = generateFarmerBatchId(
              farmerAddress,
              conversationState.harvestData.spiceType || 'Unknown',
              new Date()
            )
            
            // Trigger the completion callback with batch ID
            await onComplete?.(conversationState.harvestData, batchId)
            
            // Store batch ID in conversation state for success message
            const sequencePart = batchId.split('-')[2]
            setConversationState(prev => ({ 
              ...prev, 
              batchId: sequencePart ? parseInt(sequencePart) : 1 // Extract numeric sequence
            }))
          } catch (error) {
            setConversationState(prev => ({ 
              ...prev, 
              step: 'error',
              error: error instanceof Error ? error.message : 'Unknown error',
              isLoading: false
            }))
            
            await sendBotMessage(
              "I&apos;m sorry, there was an error creating your digital passport. Please check your wallet connection and try again.",
              800
            )
            
            onError?.(error instanceof Error ? error.message : 'Unknown error')
          }
        } else {
          await sendBotMessage(
            "No problem! What would you like to change? You can tell me which part you'd like to update and we'll go back to fix that.",
            800
          )
        }
        break

      case 'creating-passport':
        // This step is handled externally by onComplete callback
        break

      case 'success':
        const batchIdDisplay = conversationState.batchId 
          ? `Your batch ID is **${conversationState.batchId}**. ` 
          : ''
        
        await sendBotMessage(
          `🎉 Congratulations! Your digital passport has been created successfully. ${batchIdDisplay}You can now view it on your dashboard and use the QR code for product tracking. Great job!`,
          1000
        )
        break

      case 'error':
        await sendBotMessage(
          "Let&apos;s try again. I&apos;m here to help you create your digital passport. What would you like to do?",
          800
        )
        break

      default:
        await sendBotMessage(
          "I&apos;m not sure how to help with that. Let me guide you through the harvest logging process.",
          800
        )
    }
  }

  // Initialize welcome message
  useEffect(() => {
    if (conversationState.messages.length === 0) {
      const initializeChat = async () => {
        await sendBotMessage(
          "🌾 Ready to create your first digital passport? This creates a permanent, verifiable record of your harvest that buyers can trust. It only takes a few minutes and gives your spice a unique identity on the blockchain. Let's get started!",
          2000
        )
      }
      
      initializeChat()
    }
  }, [conversationState.messages.length, sendBotMessage])

  const currentStep = conversationState.step

  return (
    <div className={cn('flex flex-col h-full bg-gradient-to-b from-orange-50 to-white', className)}>
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white text-lg">🌾</span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Harvest Logger</h2>
            <p className="text-sm text-gray-600">Create your digital spice passport</p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>
              {currentStep === 'welcome' && '0/5'}
              {currentStep === 'spice-type' && '1/5'}
              {currentStep === 'harvest-weight' && '2/5'}
              {currentStep === 'quality-claims' && '3/5'}
              {currentStep === 'harvest-photo' && '4/5'}
              {(currentStep === 'review-harvest' || currentStep === 'creating-passport' || currentStep === 'success') && '5/5'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-500"
              style={{
                width: 
                  currentStep === 'welcome' ? '0%' :
                  currentStep === 'spice-type' ? '20%' :
                  currentStep === 'harvest-weight' ? '40%' :
                  currentStep === 'quality-claims' ? '60%' :
                  currentStep === 'harvest-photo' ? '80%' :
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
        style={{ minHeight: '400px', maxHeight: '60vh' }}
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

      {/* Input Area - Dynamic based on conversation step */}
      <div className="bg-white border-t border-gray-200 p-4">
        {currentStep === 'spice-type' && (
          <SpiceTypeSelector onSelect={handleSpiceTypeSelect} />
        )}
        
        {currentStep === 'harvest-weight' && (
          <WeightInput onSubmit={handleWeightInput} />
        )}
        
        {currentStep === 'quality-claims' && (
          <QualityClaimsInput onSubmit={handleQualityClaimsSelect} />
        )}
        
        {currentStep === 'harvest-photo' && (
          <HarvestPhotoUpload onUpload={handlePhotoUpload} />
        )}
        
        {currentStep === 'review-harvest' && (
          <ChatInput
            onSend={handleUserMessage}
            disabled={inputDisabled || conversationState.isLoading}
            placeholder="Type 'confirm' to create your passport or tell me what to change..."
          />
        )}
        
        {currentStep === 'welcome' && (
          <ChatInput
            onSend={handleUserMessage}
            disabled={inputDisabled || conversationState.isLoading}
            placeholder="Type anything to begin..."
          />
        )}
      </div>
    </div>
  )
}

export default LogHarvestChatbot