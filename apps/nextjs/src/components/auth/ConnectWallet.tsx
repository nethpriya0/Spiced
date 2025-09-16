import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface ConnectWalletProps {
  className?: string
}

export function ConnectWallet({ className = '' }: ConnectWalletProps) {
  const { login, isLoading, error, isInitialized } = useAuth()
  const [isConnecting, setIsConnecting] = useState(false)
  
  // Debug authentication state
  console.log('🔘 [ConnectWallet] Auth state:', { isLoading, isInitialized, hasError: !!error })
  

  const handleConnect = async () => {
    console.log('🔘 [ConnectWallet] Button clicked - starting connection...')
    setIsConnecting(true)
    try {
      console.log('🔘 [ConnectWallet] Calling login function...')
      await login()
      console.log('✅ [ConnectWallet] Login completed successfully!')
    } catch (err) {
      console.error('❌ [ConnectWallet] Login failed:', err)
    } finally {
      setIsConnecting(false)
      console.log('🔘 [ConnectWallet] Connection attempt finished')
    }
  }

  const buttonText = isConnecting || isLoading ? 'Connecting...' : 'Connect Wallet'
  const isDisabled = isConnecting || isLoading

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <button
        onClick={handleConnect}
        disabled={isDisabled}
        className={`
          px-8 py-4 rounded-lg font-semibold text-white
          transition-all duration-200 transform
          ${
            isDisabled
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-spice-green hover:bg-spice-green-dark hover:scale-105 active:scale-95'
          }
          focus:outline-none focus:ring-4 focus:ring-spice-green/20
          disabled:transform-none
        `}
      >
        {isConnecting || isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>{buttonText}</span>
          </div>
        ) : (
          buttonText
        )}
      </button>
      
      {!isInitialized && !isLoading && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm max-w-md text-center">
          Authentication is initializing... Please wait.
        </div>
      )}
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm max-w-md text-center">
          {error}
        </div>
      )}
      
      <p className="text-sm text-gray-600 max-w-md text-center">
        Connect your wallet using email or social login. Your wallet is secured by Web3Auth and you maintain full control.
      </p>
    </div>
  )
}