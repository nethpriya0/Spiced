import { 
  type Address, 
  type WalletClient, 
  type Hash, 
  type TransactionReceipt,
  getContract, 
  parseAbi,
  parseEventLogs,
  createPublicClient,
  http,
  parseEther,
  formatEther
} from 'viem'
import { localhost } from 'viem/chains'

export class EscrowError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message)
    this.name = 'EscrowError'
  }
}

export interface EscrowTransaction {
  escrowId: bigint
  buyer: Address
  seller: Address
  batchId: string
  amount: bigint
  status: 'PENDING' | 'CONFIRMED' | 'DISPUTED' | 'RESOLVED' | 'REFUNDED'
  createdAt: bigint
  confirmDeadline: bigint
  arbitrators: Address[]
  disputed: boolean
}

export interface CreateEscrowResult {
  escrowId: number
  transactionHash: Hash
  receipt: TransactionReceipt
}

export interface DisputeVote {
  arbitrator: Address
  vote: 'BUYER' | 'SELLER'
  timestamp: bigint
}

export interface DisputeResolution {
  escrowId: bigint
  winner: 'BUYER' | 'SELLER'
  votes: DisputeVote[]
  resolved: boolean
  resolvedAt: bigint
}

export interface EscrowConfig {
  contractAddress: Address
  walletClient: WalletClient
  chainId?: number
}

// SpiceEscrow ABI for key functions
const SPICE_ESCROW_ABI = parseAbi([
  // Events
  'event EscrowCreated(uint256 indexed escrowId, address indexed buyer, address indexed seller, string batchId, uint256 amount)',
  'event EscrowConfirmed(uint256 indexed escrowId, address indexed buyer)',
  'event EscrowDisputed(uint256 indexed escrowId, address indexed initiator, address[] arbitrators)',
  'event DisputeResolved(uint256 indexed escrowId, uint8 winner, uint256 winnerVotes)',
  'event FundsReleased(uint256 indexed escrowId, address indexed recipient, uint256 amount)',
  'event ArbitrationFeePaid(uint256 indexed escrowId, uint256 feeAmount, address[] arbitrators)',
  
  // Core escrow functions
  'function createEscrow(address seller, string batchId, uint256 confirmationPeriod) external payable returns (uint256 escrowId)',
  'function confirmDelivery(uint256 escrowId) external',
  'function initiateDispute(uint256 escrowId, string evidence) external',
  'function voteOnDispute(uint256 escrowId, uint8 vote) external',
  'function resolveDispute(uint256 escrowId) external',
  'function claimExpiredFunds(uint256 escrowId) external',
  
  // View functions
  'function getEscrow(uint256 escrowId) external view returns ((uint256,address,address,string,uint256,uint8,uint256,uint256,address[],bool))',
  'function getEscrowsByBuyer(address buyer) external view returns (uint256[])',
  'function getEscrowsBySeller(address seller) external view returns (uint256[])',
  'function getDisputeVotes(uint256 escrowId) external view returns ((address,uint8,uint256)[])',
  'function canInitiateDispute(uint256 escrowId) external view returns (bool)',
  'function canClaimExpiredFunds(uint256 escrowId) external view returns (bool)',
  'function getArbitrationFee() external view returns (uint256)',
  'function getTotalEscrows() external view returns (uint256)',
  
  // Admin functions
  'function setArbitrationFee(uint256 newFee) external',
  'function setConfirmationPeriod(uint256 newPeriod) external',
  'function selectArbitrators(address buyer, address seller) external view returns (address[])'
])

export class EscrowService {
  private config: EscrowConfig
  private contract: any
  private publicClient: any
  private walletClient: WalletClient
  private contractAddress: Address
  private currentAddress: Address | undefined

  constructor(config: EscrowConfig) {
    this.config = config
    this.walletClient = config.walletClient
    this.contractAddress = config.contractAddress
    this.currentAddress = config.walletClient.account?.address
    
    this.contract = getContract({
      address: config.contractAddress,
      abi: SPICE_ESCROW_ABI,
      client: config.walletClient,
    })
    
    // Create public client for reading transaction receipts
    this.publicClient = createPublicClient({
      chain: localhost,
      transport: http(process.env.NEXT_PUBLIC_RPC_URL)
    })
  }

  /**
   * Create a new escrow transaction
   */
  async createEscrow(
    seller: Address,
    batchId: string,
    amountInEth: number,
    confirmationPeriodDays: number = 30
  ): Promise<CreateEscrowResult> {
    try {
      if (!seller || !batchId.trim()) {
        throw new EscrowError('Seller address and batch ID are required')
      }
      
      if (amountInEth <= 0) {
        throw new EscrowError('Amount must be greater than 0')
      }

      if (confirmationPeriodDays < 1 || confirmationPeriodDays > 365) {
        throw new EscrowError('Confirmation period must be between 1 and 365 days')
      }

      const amountWei = parseEther(amountInEth.toString())
      const confirmationPeriodSeconds = BigInt(confirmationPeriodDays * 24 * 60 * 60)

      // Execute the transaction
      const hash = await this.contract.write.createEscrow([
        seller,
        batchId,
        confirmationPeriodSeconds
      ], {
        value: amountWei
      })

      // Wait for transaction confirmation
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash })
      
      // Extract escrow ID from transaction receipt
      const escrowId = this.extractEscrowIdFromReceipt(receipt)

      return {
        escrowId,
        transactionHash: hash,
        receipt
      }

    } catch (error) {
      throw new EscrowError(
        `Failed to create escrow: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      )
    }
  }

  /**
   * Confirm delivery and release funds to seller
   */
  async confirmDelivery(escrowId: number): Promise<Hash> {
    try {
      const escrow = await this.getEscrow(escrowId)
      if (!escrow) {
        throw new EscrowError('Escrow not found')
      }

      if (escrow.buyer.toLowerCase() !== this.currentAddress?.toLowerCase()) {
        throw new EscrowError('Only the buyer can confirm delivery')
      }

      if (escrow.status !== 'PENDING') {
        throw new EscrowError('Escrow is not in pending state')
      }

      const hash = await this.contract.write.confirmDelivery([BigInt(escrowId)])
      await this.publicClient.waitForTransactionReceipt({ hash })
      return hash

    } catch (error) {
      throw new EscrowError(
        `Failed to confirm delivery: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      )
    }
  }

  /**
   * Initiate a dispute
   */
  async initiateDispute(escrowId: number, evidence: string): Promise<Hash> {
    try {
      const escrow = await this.getEscrow(escrowId)
      if (!escrow) {
        throw new EscrowError('Escrow not found')
      }

      if (escrow.buyer.toLowerCase() !== this.currentAddress?.toLowerCase() &&
          escrow.seller.toLowerCase() !== this.currentAddress?.toLowerCase()) {
        throw new EscrowError('Only buyer or seller can initiate dispute')
      }

      if (escrow.status !== 'PENDING') {
        throw new EscrowError('Can only dispute pending escrows')
      }

      const canDispute = await this.contract.read.canInitiateDispute([BigInt(escrowId)])
      if (!canDispute) {
        throw new EscrowError('Dispute period has expired')
      }

      if (!evidence.trim()) {
        throw new EscrowError('Evidence description is required')
      }

      const hash = await this.contract.write.initiateDispute([
        BigInt(escrowId),
        evidence
      ])
      
      await this.publicClient.waitForTransactionReceipt({ hash })
      return hash

    } catch (error) {
      throw new EscrowError(
        `Failed to initiate dispute: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      )
    }
  }

  /**
   * Vote on a dispute (arbitrators only)
   */
  async voteOnDispute(escrowId: number, vote: 'BUYER' | 'SELLER'): Promise<Hash> {
    try {
      const escrow = await this.getEscrow(escrowId)
      if (!escrow) {
        throw new EscrowError('Escrow not found')
      }

      if (escrow.status !== 'DISPUTED') {
        throw new EscrowError('Escrow is not in disputed state')
      }

      if (!escrow.arbitrators.find(addr => 
        addr.toLowerCase() === this.currentAddress?.toLowerCase()
      )) {
        throw new EscrowError('Only selected arbitrators can vote')
      }

      const voteValue = vote === 'BUYER' ? 0 : 1

      const hash = await this.contract.write.voteOnDispute([
        BigInt(escrowId),
        voteValue
      ])
      
      await this.publicClient.waitForTransactionReceipt({ hash })
      return hash

    } catch (error) {
      throw new EscrowError(
        `Failed to vote on dispute: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      )
    }
  }

  /**
   * Resolve dispute after voting period
   */
  async resolveDispute(escrowId: number): Promise<Hash> {
    try {
      const hash = await this.contract.write.resolveDispute([BigInt(escrowId)])
      await this.publicClient.waitForTransactionReceipt({ hash })
      return hash

    } catch (error) {
      throw new EscrowError(
        `Failed to resolve dispute: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      )
    }
  }

  /**
   * Claim funds after expiration period
   */
  async claimExpiredFunds(escrowId: number): Promise<Hash> {
    try {
      const canClaim = await this.contract.read.canClaimExpiredFunds([BigInt(escrowId)])
      if (!canClaim) {
        throw new EscrowError('Cannot claim funds yet - confirmation period not expired')
      }

      const hash = await this.contract.write.claimExpiredFunds([BigInt(escrowId)])
      await this.publicClient.waitForTransactionReceipt({ hash })
      return hash

    } catch (error) {
      throw new EscrowError(
        `Failed to claim expired funds: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      )
    }
  }

  /**
   * Get complete escrow data
   */
  async getEscrow(escrowId: number): Promise<EscrowTransaction | null> {
    try {
      const result = await this.contract.read.getEscrow([BigInt(escrowId)])
      
      if (!result || result[0] === BigInt(0)) {
        return null
      }

      const statusMap = ['PENDING', 'CONFIRMED', 'DISPUTED', 'RESOLVED', 'REFUNDED']

      return {
        escrowId: result[0],
        buyer: result[1],
        seller: result[2],
        batchId: result[3],
        amount: result[4],
        status: statusMap[result[5]] as any,
        createdAt: result[6],
        confirmDeadline: result[7],
        arbitrators: result[8] || [],
        disputed: result[9]
      }

    } catch (error) {
      throw new EscrowError(
        `Failed to get escrow: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      )
    }
  }

  /**
   * Get escrows by buyer address
   */
  async getEscrowsByBuyer(buyerAddress: Address): Promise<number[]> {
    try {
      const result = await this.contract.read.getEscrowsByBuyer([buyerAddress])
      return result.map((id: bigint) => Number(id))
    } catch (error) {
      throw new EscrowError(
        `Failed to get buyer escrows: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      )
    }
  }

  /**
   * Get escrows by seller address  
   */
  async getEscrowsBySeller(sellerAddress: Address): Promise<number[]> {
    try {
      const result = await this.contract.read.getEscrowsBySeller([sellerAddress])
      return result.map((id: bigint) => Number(id))
    } catch (error) {
      throw new EscrowError(
        `Failed to get seller escrows: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      )
    }
  }

  /**
   * Get dispute votes for an escrow
   */
  async getDisputeVotes(escrowId: number): Promise<DisputeVote[]> {
    try {
      const result = await this.contract.read.getDisputeVotes([BigInt(escrowId)])
      
      return result.map((vote: any) => ({
        arbitrator: vote[0],
        vote: vote[1] === 0 ? 'BUYER' : 'SELLER',
        timestamp: vote[2]
      }))
    } catch (error) {
      throw new EscrowError(
        `Failed to get dispute votes: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      )
    }
  }

  /**
   * Get current arbitration fee
   */
  async getArbitrationFee(): Promise<bigint> {
    try {
      const fee = await this.contract.read.getArbitrationFee()
      return fee
    } catch (error) {
      console.error('Contract call failed for getArbitrationFee:', error)
      // Return default fee if contract call fails
      return BigInt(Math.floor(0.001 * 1e18)) // 0.001 ETH
    }
  }

  /**
   * Calculate total transaction cost including arbitration fee
   */
  async calculateTransactionCost(productPriceEth: number): Promise<{
    productPrice: bigint
    arbitrationFee: bigint
    totalCost: bigint
    totalCostEth: string
  }> {
    try {
      const productPrice = parseEther(productPriceEth.toString())
      const arbitrationFee = await this.getArbitrationFee()
      const totalCost = productPrice + arbitrationFee

      return {
        productPrice,
        arbitrationFee,
        totalCost,
        totalCostEth: formatEther(totalCost)
      }
    } catch (error) {
      throw new EscrowError(
        `Failed to calculate transaction cost: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      )
    }
  }

  /**
   * Extract escrow ID from transaction receipt
   */
  private extractEscrowIdFromReceipt(receipt: TransactionReceipt): number {
    try {
      // Parse event logs to find EscrowCreated event
      const logs = parseEventLogs({
        abi: SPICE_ESCROW_ABI,
        logs: receipt.logs,
      })

      const escrowCreatedLog = logs.find(log => log.eventName === 'EscrowCreated')
      
      if (!escrowCreatedLog || !escrowCreatedLog.args) {
        throw new EscrowError('EscrowCreated event not found in transaction receipt')
      }

      const escrowId = (escrowCreatedLog.args as any).escrowId
      return Number(escrowId)

    } catch (error) {
      throw new EscrowError(
        `Failed to extract escrow ID from receipt: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      )
    }
  }

  /**
   * Format escrow data for display
   */
  static formatEscrowForDisplay(escrow: EscrowTransaction) {
    return {
      ...escrow,
      escrowId: Number(escrow.escrowId),
      amount: formatEther(escrow.amount),
      amountWei: escrow.amount,
      createdAt: new Date(Number(escrow.createdAt) * 1000),
      confirmDeadline: new Date(Number(escrow.confirmDeadline) * 1000),
      isExpired: Date.now() > Number(escrow.confirmDeadline) * 1000,
      daysUntilExpiry: Math.max(0, Math.ceil(
        (Number(escrow.confirmDeadline) * 1000 - Date.now()) / (1000 * 60 * 60 * 24)
      )),
      canConfirm: escrow.status === 'PENDING' && Date.now() < Number(escrow.confirmDeadline) * 1000,
      canDispute: escrow.status === 'PENDING' && Date.now() < Number(escrow.confirmDeadline) * 1000,
      canClaimExpired: escrow.status === 'PENDING' && Date.now() > Number(escrow.confirmDeadline) * 1000
    }
  }
}