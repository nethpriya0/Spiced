import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface RecoveryMethod {
  id: string
  name: string
  description: string
  icon: string
  enabled: boolean
}

interface RecoverySetupProps {
  onComplete?: () => void
  onSkip?: () => void
}

export function RecoverySetup({ onComplete, onSkip }: RecoverySetupProps) {
  const { user } = useAuth()
  const [recoveryMethods, setRecoveryMethods] = useState<RecoveryMethod[]>([
    {
      id: 'email',
      name: 'Email Recovery',
      description: 'Recover your wallet using your email address',
      icon: '📧',
      enabled: !!user?.email
    },
    {
      id: 'google',
      name: 'Google Account',
      description: 'Link your Google account for easy recovery',
      icon: '🔍',
      enabled: false
    },
    {
      id: 'device',
      name: 'Device Backup',
      description: 'Store recovery information on this device',
      icon: '📱',
      enabled: false
    }
  ])
  
  const [isSetupComplete, setIsSetupComplete] = useState(false)
  const [selectedMethods, setSelectedMethods] = useState<string[]>([])
  
  useEffect(() => {
    // Auto-select email if available
    if (user?.email) {
      setSelectedMethods(['email'])
    }
  }, [user?.email])

  useEffect(() => {
    // Check if setup is complete (at least 2 methods enabled)
    const enabledCount = selectedMethods.length + (user?.email ? 1 : 0)
    setIsSetupComplete(enabledCount >= 2)
  }, [selectedMethods, user?.email])

  const handleMethodToggle = (methodId: string) => {
    if (methodId === 'email') return // Email is always enabled if available
    
    setSelectedMethods(prev => 
      prev.includes(methodId) 
        ? prev.filter(id => id !== methodId)
        : [...prev, methodId]
    )
  }

  const handleEnableDevice = async () => {
    try {
      // Simulate device backup setup
      await new Promise(resolve => setTimeout(resolve, 1000))
      setRecoveryMethods(prev => 
        prev.map(method => 
          method.id === 'device' 
            ? { ...method, enabled: true }
            : method
        )
      )
      if (!selectedMethods.includes('device')) {
        setSelectedMethods(prev => [...prev, 'device'])
      }
    } catch (error) {
      console.error('Failed to enable device backup:', error)
    }
  }

  const handleEnableGoogle = async () => {
    try {
      // Simulate Google account linking
      await new Promise(resolve => setTimeout(resolve, 1000))
      setRecoveryMethods(prev => 
        prev.map(method => 
          method.id === 'google' 
            ? { ...method, enabled: true }
            : method
        )
      )
      if (!selectedMethods.includes('google')) {
        setSelectedMethods(prev => [...prev, 'google'])
      }
    } catch (error) {
      console.error('Failed to enable Google recovery:', error)
    }
  }

  const handleCompleteSetup = () => {
    if (isSetupComplete) {
      onComplete?.()
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔐</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Secure Your Wallet
        </h2>
        <p className="text-gray-600">
          Set up recovery methods to ensure you never lose access to your wallet
        </p>
      </div>

      <div className="space-y-4 mb-6">
        {recoveryMethods.map((method) => {
          const isSelected = selectedMethods.includes(method.id) || (method.id === 'email' && user?.email)
          const isEmailMethod = method.id === 'email'
          
          return (
            <div
              key={method.id}
              className={`
                p-4 border-2 rounded-lg cursor-pointer transition-all
                ${isSelected 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300'
                }
                ${isEmailMethod && user?.email ? 'opacity-75 cursor-not-allowed' : ''}
              `}
              onClick={() => !isEmailMethod && handleMethodToggle(method.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{method.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{method.name}</h3>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {isSelected && (
                    <span className="text-green-500 text-xl">✓</span>
                  )}
                  
                  {!method.enabled && !isEmailMethod && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (method.id === 'device') handleEnableDevice()
                        if (method.id === 'google') handleEnableGoogle()
                      }}
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Setup
                    </button>
                  )}
                </div>
              </div>
              
              {isEmailMethod && user?.email && (
                <div className="mt-2 text-sm text-gray-500">
                  Connected: {user.email}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <div className={`w-4 h-4 rounded-full ${isSetupComplete ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className={`text-sm ${isSetupComplete ? 'text-green-600' : 'text-gray-500'}`}>
            Recovery setup {isSetupComplete ? 'complete' : 'incomplete'}
          </span>
        </div>
        <p className="text-xs text-gray-500">
          We recommend setting up at least 2 recovery methods for maximum security
        </p>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={handleCompleteSetup}
          disabled={!isSetupComplete}
          className={`
            flex-1 py-3 px-6 rounded-lg font-semibold
            ${isSetupComplete
              ? 'bg-spice-green text-white hover:bg-spice-green-dark'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          Complete Setup
        </button>
        
        {onSkip && (
          <button
            onClick={onSkip}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            Skip for now
          </button>
        )}
      </div>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <span className="text-yellow-500 text-sm">⚠️</span>
          <p className="text-xs text-yellow-700">
            Without recovery methods, you may permanently lose access to your wallet if you forget your login credentials.
          </p>
        </div>
      </div>
    </div>
  )
}