export interface ChatMessage {
  id: string
  content: string | React.ReactNode
  sender: 'bot' | 'user'
  timestamp: Date
  type?: 'text' | 'image' | 'file' | 'confirmation' | 'loading'
  metadata?: {
    fileName?: string
    fileSize?: number
    fileType?: string
    imagePreview?: string
  }
}

export interface ChatConversationState {
  step: ConversationStep
  messages: ChatMessage[]
  userResponses: {
    name?: string
    bio?: string
    profilePictureFile?: File
    profilePictureHash?: string
  }
  isComplete: boolean
  isLoading: boolean
  error?: string
}

export type ConversationStep = 
  | 'welcome'
  | 'name'
  | 'bio' 
  | 'profile-picture'
  | 'review'
  | 'saving'
  | 'complete'
  | 'error'

export interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
  maxLength?: number
  multiline?: boolean
}

export interface ChatTypingIndicatorProps {
  isVisible: boolean
  message?: string
}