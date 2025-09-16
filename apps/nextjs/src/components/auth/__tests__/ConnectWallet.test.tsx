import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ConnectWallet } from '../ConnectWallet'

// Mock the useAuth hook
const mockLogin = jest.fn()
const mockUseAuth = {
  login: mockLogin,
  isLoading: false,
  error: null
}

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth
}))

describe('ConnectWallet', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders connect wallet button', () => {
    render(<ConnectWallet />)
    
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument()
    expect(screen.getByText(/Connect your wallet using email or social login/)).toBeInTheDocument()
  })

  it('calls login when button is clicked', async () => {
    render(<ConnectWallet />)
    
    const connectButton = screen.getByText('Connect Wallet')
    fireEvent.click(connectButton)
    
    expect(mockLogin).toHaveBeenCalledTimes(1)
  })

  it('shows loading state when connecting', () => {
    mockUseAuth.isLoading = true
    
    render(<ConnectWallet />)
    
    expect(screen.getByText('Connecting...')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows loading state when internally connecting', async () => {
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<ConnectWallet />)
    
    const connectButton = screen.getByText('Connect Wallet')
    fireEvent.click(connectButton)
    
    await waitFor(() => {
      expect(screen.getByText('Connecting...')).toBeInTheDocument()
    })
  })

  it('displays error message when there is an error', () => {
    mockUseAuth.error = 'Failed to connect'
    
    render(<ConnectWallet />)
    
    expect(screen.getByText('Failed to connect')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<ConnectWallet className="custom-class" />)
    
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('button is disabled when loading', () => {
    mockUseAuth.isLoading = true
    
    render(<ConnectWallet />)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('bg-gray-400', 'cursor-not-allowed')
  })

  it('button has correct styling when enabled', () => {
    mockUseAuth.isLoading = false
    
    render(<ConnectWallet />)
    
    const button = screen.getByRole('button')
    expect(button).not.toBeDisabled()
    expect(button).toHaveClass('bg-spice-green')
  })

  it('shows spinner during loading', () => {
    mockUseAuth.isLoading = true
    
    render(<ConnectWallet />)
    
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('handles login error gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    mockLogin.mockRejectedValue(new Error('Login failed'))
    
    render(<ConnectWallet />)
    
    const connectButton = screen.getByText('Connect Wallet')
    fireEvent.click(connectButton)
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled()
    })
    
    consoleError.mockRestore()
  })
})