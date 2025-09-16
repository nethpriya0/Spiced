/**
 * Comprehensive error handling utilities for presentation-ready error messages
 */

export interface UserFriendlyError {
  title: string
  message: string
  action?: string
  type: 'error' | 'warning' | 'info'
}

// Web3 Error Types
export const WEB3_ERROR_CODES = {
  USER_REJECTED: 4001,
  UNAUTHORIZED: 4100,
  UNSUPPORTED_METHOD: 4200,
  DISCONNECTED: 4900,
  CHAIN_DISCONNECTED: 4901,
  INSUFFICIENT_FUNDS: -32000,
  NETWORK_ERROR: -32002,
  RESOURCE_UNAVAILABLE: -32005,
  TRANSACTION_REJECTED: -32003
} as const

// IPFS Error Types
export const IPFS_ERROR_TYPES = {
  UPLOAD_FAILED: 'IPFS_UPLOAD_FAILED',
  DOWNLOAD_FAILED: 'IPFS_DOWNLOAD_FAILED',
  INVALID_HASH: 'IPFS_INVALID_HASH',
  SIZE_LIMIT_EXCEEDED: 'IPFS_SIZE_LIMIT_EXCEEDED',
  NETWORK_ERROR: 'IPFS_NETWORK_ERROR'
} as const

/**
 * Convert technical errors into user-friendly messages
 */
export function getUserFriendlyError(error: any): UserFriendlyError {
  // Handle null/undefined
  if (!error) {
    return {
      title: 'Unknown Error',
      message: 'Something unexpected happened. Please try again.',
      type: 'error'
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      title: 'Error',
      message: error,
      type: 'error'
    }
  }

  // Handle Web3 wallet errors
  if (error.code && typeof error.code === 'number') {
    return handleWeb3Error(error)
  }

  // Handle IPFS errors
  if (error.type && Object.values(IPFS_ERROR_TYPES).includes(error.type)) {
    return handleIPFSError(error)
  }

  // Handle network errors
  if (error.name === 'NetworkError' || error.code === 'NETWORK_ERROR') {
    return {
      title: 'Connection Problem',
      message: 'Please check your internet connection and try again.',
      action: 'Retry',
      type: 'error'
    }
  }

  // Handle fetch/API errors
  if (error.status) {
    return handleAPIError(error)
  }

  // Handle contract/blockchain errors
  if (error.message?.includes('revert') || error.message?.includes('gas')) {
    return handleContractError(error)
  }

  // Handle file upload errors
  if (error.message?.includes('file') || error.message?.includes('upload')) {
    return {
      title: 'Upload Failed',
      message: 'There was a problem uploading your file. Please check the file size and format.',
      action: 'Try Again',
      type: 'error'
    }
  }

  // Generic error fallback
  return {
    title: 'Something went wrong',
    message: error.message || 'An unexpected error occurred. Please try again or contact support if the problem persists.',
    action: 'Retry',
    type: 'error'
  }
}

/**
 * Handle Web3/Wallet specific errors
 */
function handleWeb3Error(error: any): UserFriendlyError {
  switch (error.code) {
    case WEB3_ERROR_CODES.USER_REJECTED:
      return {
        title: 'Transaction Cancelled',
        message: 'You cancelled the transaction in your wallet. No worries - you can try again anytime.',
        action: 'Try Again',
        type: 'info'
      }

    case WEB3_ERROR_CODES.INSUFFICIENT_FUNDS:
      return {
        title: 'Insufficient Funds',
        message: 'You need more ETH in your wallet to complete this transaction. Please add funds and try again.',
        action: 'Add Funds',
        type: 'warning'
      }

    case WEB3_ERROR_CODES.UNAUTHORIZED:
      return {
        title: 'Wallet Not Connected',
        message: 'Please connect your wallet to continue with this action.',
        action: 'Connect Wallet',
        type: 'warning'
      }

    case WEB3_ERROR_CODES.NETWORK_ERROR:
      return {
        title: 'Network Issue',
        message: 'There seems to be a problem with the blockchain network. Please try again in a moment.',
        action: 'Retry',
        type: 'error'
      }

    case WEB3_ERROR_CODES.CHAIN_DISCONNECTED:
      return {
        title: 'Wrong Network',
        message: 'Please switch to the Ethereum Sepolia testnet in your wallet.',
        action: 'Switch Network',
        type: 'warning'
      }

    default:
      return {
        title: 'Wallet Error',
        message: 'There was an issue with your wallet connection. Please refresh and try again.',
        action: 'Refresh',
        type: 'error'
      }
  }
}

/**
 * Handle IPFS specific errors
 */
function handleIPFSError(error: any): UserFriendlyError {
  switch (error.type) {
    case IPFS_ERROR_TYPES.UPLOAD_FAILED:
      return {
        title: 'Upload Failed',
        message: 'We couldn\'t upload your image to our secure storage. Please check your connection and try again.',
        action: 'Try Again',
        type: 'error'
      }

    case IPFS_ERROR_TYPES.SIZE_LIMIT_EXCEEDED:
      return {
        title: 'File Too Large',
        message: 'Your image is too large. Please choose an image smaller than 5MB.',
        action: 'Choose Different File',
        type: 'warning'
      }

    case IPFS_ERROR_TYPES.DOWNLOAD_FAILED:
      return {
        title: 'Image Loading Failed',
        message: 'We couldn\'t load this image. It might be temporarily unavailable.',
        action: 'Refresh',
        type: 'error'
      }

    default:
      return {
        title: 'Storage Error',
        message: 'There was an issue with our secure storage system. Please try again.',
        action: 'Retry',
        type: 'error'
      }
  }
}

/**
 * Handle API/HTTP errors
 */
function handleAPIError(error: any): UserFriendlyError {
  switch (error.status) {
    case 400:
      return {
        title: 'Invalid Request',
        message: 'There was an issue with your request. Please check your input and try again.',
        type: 'warning'
      }

    case 401:
      return {
        title: 'Authentication Required',
        message: 'Please log in to continue with this action.',
        action: 'Log In',
        type: 'warning'
      }

    case 403:
      return {
        title: 'Access Denied',
        message: 'You don\'t have permission to perform this action.',
        type: 'error'
      }

    case 404:
      return {
        title: 'Not Found',
        message: 'The item you\'re looking for doesn\'t exist or has been removed.',
        action: 'Go Back',
        type: 'error'
      }

    case 429:
      return {
        title: 'Too Many Requests',
        message: 'You\'re doing that too quickly. Please wait a moment and try again.',
        action: 'Wait and Retry',
        type: 'warning'
      }

    case 500:
    case 502:
    case 503:
      return {
        title: 'Server Error',
        message: 'Our servers are experiencing issues. Please try again in a few minutes.',
        action: 'Retry Later',
        type: 'error'
      }

    default:
      return {
        title: 'Network Error',
        message: 'There was a problem connecting to our servers. Please check your connection and try again.',
        action: 'Retry',
        type: 'error'
      }
  }
}

/**
 * Handle smart contract errors
 */
function handleContractError(error: any): UserFriendlyError {
  const message = error.message?.toLowerCase() || ''

  if (message.includes('revert')) {
    return {
      title: 'Transaction Failed',
      message: 'The blockchain rejected this transaction. This might be due to insufficient funds or invalid data.',
      action: 'Check Details',
      type: 'error'
    }
  }

  if (message.includes('gas')) {
    return {
      title: 'Gas Limit Exceeded',
      message: 'This transaction requires more gas than allocated. Please try increasing the gas limit.',
      action: 'Adjust Gas',
      type: 'warning'
    }
  }

  if (message.includes('nonce')) {
    return {
      title: 'Transaction Order Issue',
      message: 'There\'s an issue with transaction ordering. Please reset your wallet and try again.',
      action: 'Reset Wallet',
      type: 'warning'
    }
  }

  return {
    title: 'Blockchain Error',
    message: 'The blockchain transaction encountered an issue. Please try again or contact support.',
    action: 'Retry',
    type: 'error'
  }
}

/**
 * Log error for monitoring (in production, send to monitoring service)
 */
export function logError(error: any, context?: string) {
  const errorData = {
    timestamp: new Date().toISOString(),
    context,
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code,
      type: error.type || error.name
    },
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined
  }

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorData)
  }

  // In production, send to monitoring service (e.g., Sentry, LogRocket)
  // Example: sentryClient.captureException(error, { extra: errorData })
}

/**
 * Create a retry function with exponential backoff
 */
export function createRetryFunction<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): () => Promise<T> {
  return async () => {
    let lastError: any
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error
        
        if (attempt === maxRetries) {
          throw error
        }
        
        // Exponential backoff: 1s, 2s, 4s, 8s...
        const delay = baseDelay * Math.pow(2, attempt - 1)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw lastError
  }
}