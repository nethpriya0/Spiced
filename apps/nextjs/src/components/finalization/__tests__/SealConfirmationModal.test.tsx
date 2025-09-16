import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SealConfirmationModal } from '../SealConfirmationModal'
import type { Hash } from 'viem'

// Mock the PassportSummary component
jest.mock('../PassportSummary', () => {
  return {
    PassportSummary: function MockPassportSummary({ passport, farmerName, contractAddress }: any) {
      return (
        <div data-testid="passport-summary">
          <div>Batch #{passport.batchId}</div>
          <div>{passport.spiceType}</div>
          <div>{farmerName}</div>
          <div>{contractAddress}</div>
        </div>
      )
    }
  }
})

// Mock QR Code component
jest.mock('@/components/harvest/QRCodeGenerator', () => {
  return {
    QRCodeGenerator: function MockQRCodeGenerator({ data }: any) {
      return <div data-testid="qr-code">QR Code for {data.batchId}</div>
    }
  }
})

// Mock UI components
jest.mock('@/components/ui/Button', () => {
  return {
    Button: ({ children, onClick, disabled, variant, className, ...props }: any) => (
      <button
        onClick={onClick}
        disabled={disabled}
        className={className}
        data-variant={variant}
        {...props}
      >
        {children}
      </button>
    ),
  }
})

// Mock utils
jest.mock('@/utils/cn', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}))

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Lock: () => <div data-testid="lock-icon">Lock</div>,
  AlertTriangle: () => <div data-testid="alert-triangle-icon">AlertTriangle</div>,
  CheckCircle: () => <div data-testid="check-circle-icon">CheckCircle</div>,
  ArrowRight: () => <div data-testid="arrow-right-icon">ArrowRight</div>,
  ArrowLeft: () => <div data-testid="arrow-left-icon">ArrowLeft</div>,
  Loader2: ({ className }: any) => (
    <div data-testid="loader-icon" className={className}>
      Loader2
    </div>
  ),
  ExternalLink: () => <div data-testid="external-link-icon">ExternalLink</div>,
  Copy: () => <div data-testid="copy-icon">Copy</div>,
  Calendar: () => <div data-testid="calendar-icon">Calendar</div>,
  Weight: () => <div data-testid="weight-icon">Weight</div>,
  MapPin: () => <div data-testid="map-pin-icon">MapPin</div>,
  Camera: () => <div data-testid="camera-icon">Camera</div>,
  FileText: () => <div data-testid="file-text-icon">FileText</div>,
  Clock: () => <div data-testid="clock-icon">Clock</div>,
}))

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
})

describe('SealConfirmationModal', () => {
  const mockPassport = {
    batchId: 123,
    spiceType: 'Ceylon Cinnamon',
    totalWeight: 5200, // 5.2 kg
    dateCreated: new Date('2024-01-01'),
    harvestHash: 'QmHash123',
    processingHashes: ['QmStep1', 'QmStep2'],
    isLocked: false,
    statusText: 'Ready for Sale',
    owner: '0x1234567890123456789012345678901234567890',
    qualityClaims: ['Organic', 'Fair Trade'],
    totalSteps: 2,
  }

  const mockGasEstimate = {
    gasLimit: BigInt('21000'),
    gasPrice: BigInt('20000000000'),
    estimatedCost: BigInt('420000000000000'),
  }

  const mockReadinessCheck = {
    hasHarvestData: true,
    hasMinimumProcessingSteps: true,
    hasRequiredPhotos: true,
    hasValidDescriptions: true,
    meetsTimingRequirements: true,
    overallReady: true,
    warnings: [],
  }

  const defaultProps = {
    passport: mockPassport,
    farmerName: 'John Smith',
    contractAddress: '0x1234567890123456789012345678901234567890',
    gasEstimate: mockGasEstimate,
    readinessCheck: mockReadinessCheck,
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
    isSealing: false,
    sealResult: undefined,
    onValidationRequested: jest.fn(),
    className: '',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('Review Step', () => {
    it('renders review step by default', () => {
      render(<SealConfirmationModal {...defaultProps} />)

      expect(screen.getByText('Review Passport Data')).toBeInTheDocument()
      expect(screen.getByText('Batch #123 - Ceylon Cinnamon')).toBeInTheDocument()
      expect(screen.getByText(/review all passport data before sealing/i)).toBeInTheDocument()
    })

    it('displays readiness check results when provided', () => {
      render(<SealConfirmationModal {...defaultProps} />)

      expect(screen.getByText('Passport Readiness Check')).toBeInTheDocument()
      expect(screen.getByText('Harvest data recorded')).toBeInTheDocument()
      expect(screen.getByText('Processing steps added')).toBeInTheDocument()
      expect(screen.getByText('Photos uploaded')).toBeInTheDocument()
      expect(screen.getByText('Timing requirements met')).toBeInTheDocument()
    })

    it('shows validation loading state', () => {
      const propsWithoutReadiness = { ...defaultProps, readinessCheck: undefined }
      render(<SealConfirmationModal {...propsWithoutReadiness} />)

      expect(screen.getByText(/validating passport readiness/i)).toBeInTheDocument()
      expect(screen.getByTestId('loader-icon')).toBeInTheDocument()
    })

    it('calls validation function on mount when readiness check is missing', async () => {
      const mockValidation = jest.fn().mockResolvedValue(mockReadinessCheck)
      const propsWithValidation = {
        ...defaultProps,
        readinessCheck: undefined,
        onValidationRequested: mockValidation,
      }

      render(<SealConfirmationModal {...propsWithValidation} />)

      await waitFor(() => {
        expect(mockValidation).toHaveBeenCalled()
      })
    })

    it('disables continue button when not ready', () => {
      const notReadyCheck = { ...mockReadinessCheck, overallReady: false }
      render(<SealConfirmationModal {...defaultProps} readinessCheck={notReadyCheck} />)

      const continueButton = screen.getByRole('button', { name: /complete requirements first/i })
      expect(continueButton).toBeDisabled()
    })

    it('enables continue button when ready', () => {
      render(<SealConfirmationModal {...defaultProps} />)

      const continueButton = screen.getByRole('button', { name: /continue/i })
      expect(continueButton).toBeEnabled()
    })

    it('navigates to warning step when continue is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<SealConfirmationModal {...defaultProps} />)

      const continueButton = screen.getByRole('button', { name: /continue/i })
      await user.click(continueButton)

      expect(screen.getByText('Important Warning')).toBeInTheDocument()
    })

    it('calls onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<SealConfirmationModal {...defaultProps} />)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      expect(defaultProps.onCancel).toHaveBeenCalled()
    })
  })

  describe('Warning Step', () => {
    beforeEach(async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<SealConfirmationModal {...defaultProps} />)
      
      const continueButton = screen.getByRole('button', { name: /continue/i })
      await user.click(continueButton)
    })

    it('displays warning information', () => {
      expect(screen.getByText('Important Warning')).toBeInTheDocument()
      expect(screen.getByText('This Action is Permanent')).toBeInTheDocument()
      expect(screen.getByText(/no more edits/i)).toBeInTheDocument()
      expect(screen.getByText(/immutable record/i)).toBeInTheDocument()
      expect(screen.getByText(/marketplace ready/i)).toBeInTheDocument()
    })

    it('shows gas cost information', () => {
      expect(screen.getByText(/gas cost/i)).toBeInTheDocument()
      expect(screen.getByText(/0.000420 ETH/i)).toBeInTheDocument()
    })

    it('displays benefits information', () => {
      expect(screen.getByText('What happens after sealing?')).toBeInTheDocument()
      expect(screen.getByText(/immutable proof of provenance/i)).toBeInTheDocument()
      expect(screen.getByText(/ready for marketplace listing/i)).toBeInTheDocument()
    })

    it('allows navigation back to review step', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      const backButton = screen.getByRole('button', { name: /back to review/i })
      await user.click(backButton)

      expect(screen.getByText('Review Passport Data')).toBeInTheDocument()
    })

    it('navigates to confirmation step', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      const understandButton = screen.getByRole('button', { name: /i understand, continue/i })
      await user.click(understandButton)

      expect(screen.getByText('Final Confirmation Required')).toBeInTheDocument()
    })
  })

  describe('Confirmation Step', () => {
    beforeEach(async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<SealConfirmationModal {...defaultProps} />)
      
      // Navigate to confirmation step
      await user.click(screen.getByRole('button', { name: /continue/i }))
      await user.click(screen.getByRole('button', { name: /i understand, continue/i }))
    })

    it('displays confirmation requirements', () => {
      expect(screen.getByText('Final Confirmation Required')).toBeInTheDocument()
      expect(screen.getByText(/type/i)).toBeInTheDocument()
      expect(screen.getByText('SEAL PASSPORT')).toBeInTheDocument()
      expect(screen.getByText(/this action is permanent/i)).toBeInTheDocument()
    })

    it('shows transaction details when gas estimate is provided', () => {
      expect(screen.getByText('Transaction Details')).toBeInTheDocument()
      expect(screen.getByText('Gas Limit:')).toBeInTheDocument()
      expect(screen.getByText('21000')).toBeInTheDocument()
      expect(screen.getByText('Gas Price:')).toBeInTheDocument()
      expect(screen.getByText('20.00 Gwei')).toBeInTheDocument()
      expect(screen.getByText('Estimated Cost:')).toBeInTheDocument()
      expect(screen.getByText('0.000420 ETH')).toBeInTheDocument()
    })

    it('requires correct confirmation text', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      const input = screen.getByPlaceholderText('SEAL PASSPORT')
      const sealButton = screen.getByText(/seal passport permanently/i).closest('button')!
      
      expect(sealButton).toBeDisabled()
      
      await user.type(input, 'WRONG TEXT')
      expect(sealButton).toBeDisabled()
      
      await user.clear(input)
      await user.type(input, 'SEAL PASSPORT')
      expect(sealButton).toBeDisabled() // Still disabled because checkbox not checked
    })

    it('requires terms agreement', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimers })
      
      const input = screen.getByPlaceholderText('SEAL PASSPORT')
      const checkbox = screen.getByRole('checkbox')
      const sealButton = screen.getByText(/seal passport permanently/i).closest('button')!
      
      await user.type(input, 'SEAL PASSPORT')
      expect(sealButton).toBeDisabled()
      
      await user.click(checkbox)
      expect(sealButton).toBeDisabled() // Still disabled due to minimum time requirement
    })

    it('enforces minimum confirmation time', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      const input = screen.getByPlaceholderText('SEAL PASSPORT')
      const checkbox = screen.getByRole('checkbox')
      const sealButton = screen.getByText(/seal passport permanently/i).closest('button')!
      
      await user.type(input, 'SEAL PASSPORT')
      await user.click(checkbox)
      
      expect(screen.getByText(/please wait \d+s/i)).toBeInTheDocument()
      expect(sealButton).toBeDisabled()
      
      // Fast forward time
      act(() => {
        jest.advanceTimersByTime(3000)
      })
      
      await waitFor(() => {
        expect(sealButton).toBeEnabled()
      })
    })

    it('calls onConfirm when all conditions are met', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      const input = screen.getByPlaceholderText('SEAL PASSPORT')
      const checkbox = screen.getByRole('checkbox')
      
      await user.type(input, 'SEAL PASSPORT')
      await user.click(checkbox)
      
      // Fast forward time
      act(() => {
        jest.advanceTimersByTime(3000)
      })
      
      const sealButton = screen.getByText(/seal passport permanently/i).closest('button')!
      await waitFor(() => expect(sealButton).toBeEnabled())
      
      await user.click(sealButton)
      
      expect(defaultProps.onConfirm).toHaveBeenCalled()
    })

    it('allows navigation back to warning step', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      const backButton = screen.getByRole('button', { name: /back to warning/i })
      await user.click(backButton)

      expect(screen.getByText('Important Warning')).toBeInTheDocument()
    })
  })

  describe('Processing Step', () => {
    it('shows processing state when isSealing is true', () => {
      render(<SealConfirmationModal {...defaultProps} isSealing={true} />)

      expect(screen.getByText(/sealing passport/i)).toBeInTheDocument()
      expect(screen.getByText(/sealing your passport/i)).toBeInTheDocument()
      expect(screen.getByText(/please wait while we record/i)).toBeInTheDocument()
      expect(screen.getByTestId('loader-icon')).toBeInTheDocument()
    })
  })

  describe('Success Step', () => {
    const successResult = {
      success: true,
      transactionHash: '0x1234567890123456789012345678901234567890123456789012345678901234' as Hash,
      blockNumber: 12345,
    }

    it('shows success state when seal result is successful', () => {
      render(<SealConfirmationModal {...defaultProps} sealResult={successResult} />)

      expect(screen.getByText(/passport sealed successfully/i)).toBeInTheDocument()
      expect(screen.getByText(/spice passport is now immutable/i)).toBeInTheDocument()
      expect(screen.getByText(/blockchain confirmation/i)).toBeInTheDocument()
      expect(screen.getByText(/block.*12345/i)).toBeInTheDocument()
    })

    it('displays transaction hash with copy functionality', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<SealConfirmationModal {...defaultProps} sealResult={successResult} />)

      const copyButton = screen.getByTitle('Copy full hash')
      await user.click(copyButton)

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(successResult.transactionHash)
    })

    it('shows etherscan link', () => {
      render(<SealConfirmationModal {...defaultProps} sealResult={successResult} />)

      const etherscanButton = screen.getByTitle('View on Etherscan')
      expect(etherscanButton).toBeInTheDocument()
    })

    it('displays benefits and next steps', () => {
      render(<SealConfirmationModal {...defaultProps} sealResult={successResult} />)

      expect(screen.getByText("What's Next?")).toBeInTheDocument()
      expect(screen.getByText('Benefits')).toBeInTheDocument()
      expect(screen.getByText(/list your sealed passport/i)).toBeInTheDocument()
      expect(screen.getByText(/immutable provenance proof/i)).toBeInTheDocument()
    })

    it('allows user to continue to products', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<SealConfirmationModal {...defaultProps} sealResult={successResult} />)

      const continueButton = screen.getByRole('button', { name: /continue to my products/i })
      await user.click(continueButton)

      expect(defaultProps.onCancel).toHaveBeenCalled()
    })
  })

  describe('Error Step', () => {
    const errorResult = {
      success: false,
      error: 'Transaction failed due to insufficient gas',
    }

    it('shows error state when seal result has error', () => {
      render(<SealConfirmationModal {...defaultProps} sealResult={errorResult} />)

      expect(screen.getByText(/sealing failed/i)).toBeInTheDocument()
      expect(screen.getByText(/there was an error sealing/i)).toBeInTheDocument()
      expect(screen.getByText(/error details/i)).toBeInTheDocument()
      expect(screen.getByText('Transaction failed due to insufficient gas')).toBeInTheDocument()
    })

    it('allows retry', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<SealConfirmationModal {...defaultProps} sealResult={errorResult} />)

      const tryAgainButton = screen.getByRole('button', { name: /try again/i })
      await user.click(tryAgainButton)

      expect(screen.getByText('Final Confirmation Required')).toBeInTheDocument()
    })

    it('allows cancellation', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<SealConfirmationModal {...defaultProps} sealResult={errorResult} />)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      expect(defaultProps.onCancel).toHaveBeenCalled()
    })
  })

  describe('Close Button', () => {
    it('shows close button in non-final states', () => {
      render(<SealConfirmationModal {...defaultProps} />)

      const closeButton = screen.getByRole('button', { name: '×' })
      expect(closeButton).toBeInTheDocument()
    })

    it('hides close button in success state', () => {
      const successResult = { success: true, transactionHash: '0x123' as Hash }
      render(<SealConfirmationModal {...defaultProps} sealResult={successResult} />)

      const closeButton = screen.queryByRole('button', { name: '×' })
      expect(closeButton).not.toBeInTheDocument()
    })

    it('hides close button in error state', () => {
      const errorResult = { success: false, error: 'Test error' }
      render(<SealConfirmationModal {...defaultProps} sealResult={errorResult} />)

      const closeButton = screen.queryByRole('button', { name: '×' })
      expect(closeButton).not.toBeInTheDocument()
    })

    it('disables close button during processing', () => {
      render(<SealConfirmationModal {...defaultProps} isSealing={true} />)

      const closeButton = screen.getByRole('button', { name: '×' })
      expect(closeButton).toBeDisabled()
    })
  })

  describe('Validation Logic', () => {
    it('validates seal readiness when no external check provided', () => {
      const propsWithoutReadiness = { ...defaultProps, readinessCheck: undefined }
      render(<SealConfirmationModal {...propsWithoutReadiness} />)

      // Should show loading initially
      expect(screen.getByText(/validating passport readiness/i)).toBeInTheDocument()
    })

    it('shows warnings when readiness check has warnings', () => {
      const readinessWithWarnings = {
        ...mockReadinessCheck,
        warnings: ['Warning 1: Some issue', 'Warning 2: Another issue'],
      }
      
      render(<SealConfirmationModal {...defaultProps} readinessCheck={readinessWithWarnings} />)

      expect(screen.getByText('Warning 1: Some issue')).toBeInTheDocument()
      expect(screen.getByText('Warning 2: Another issue')).toBeInTheDocument()
    })

    it('handles validation errors gracefully', async () => {
      const mockValidation = jest.fn().mockRejectedValue(new Error('Validation failed'))
      const propsWithValidation = {
        ...defaultProps,
        readinessCheck: undefined,
        onValidationRequested: mockValidation,
      }

      render(<SealConfirmationModal {...propsWithValidation} />)

      await waitFor(() => {
        expect(screen.getByText(/unable to validate passport readiness/i)).toBeInTheDocument()
      })
    })
  })

  describe('Gas Estimation', () => {
    it('handles missing gas estimate gracefully', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      const propsWithoutGas = { ...defaultProps, gasEstimate: undefined }
      render(<SealConfirmationModal {...propsWithoutGas} />)

      // Navigate to warning step to see gas cost text
      await user.click(screen.getByRole('button', { name: /continue/i }))

      expect(screen.getByText(/calculating/i)).toBeInTheDocument()
    })

    it('formats ETH values correctly', () => {
      const customGasEstimate = {
        gasLimit: BigInt('50000'),
        gasPrice: BigInt('30000000000'), // 30 Gwei
        estimatedCost: BigInt('1500000000000000'), // 0.0015 ETH
      }

      render(<SealConfirmationModal {...defaultProps} gasEstimate={customGasEstimate} />)

      // Navigate to warning step to see gas cost
      const continueButton = screen.getByRole('button', { name: /continue/i })
      fireEvent.click(continueButton)

      expect(screen.getByText(/0.001500 ETH/)).toBeInTheDocument()
    })
  })

  describe('Passport Summary Integration', () => {
    it('passes correct props to PassportSummary', () => {
      render(<SealConfirmationModal {...defaultProps} />)

      const passportSummary = screen.getByTestId('passport-summary')
      expect(passportSummary).toBeInTheDocument()
      expect(screen.getByText('Batch #123')).toBeInTheDocument()
      expect(screen.getByText('Ceylon Cinnamon')).toBeInTheDocument()
      expect(screen.getByText('John Smith')).toBeInTheDocument()
      expect(screen.getByText('0x1234567890123456789012345678901234567890')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(<SealConfirmationModal {...defaultProps} />)

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
      
      // Check that form elements are properly labeled
      const readinessSection = screen.getByText('Passport Readiness Check')
      expect(readinessSection).toBeInTheDocument()
    })

    it('maintains focus management between steps', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<SealConfirmationModal {...defaultProps} />)

      const continueButton = screen.getByRole('button', { name: /continue/i })
      await user.click(continueButton)

      // Should be able to navigate with keyboard in warning step
      const backButton = screen.getByRole('button', { name: /back to review/i })
      expect(backButton).toBeInTheDocument()
    })
  })
})