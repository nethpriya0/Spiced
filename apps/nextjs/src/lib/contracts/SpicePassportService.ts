import { 
  type Address, 
  type WalletClient, 
  type Hash, 
  type TransactionReceipt,
  getContract, 
  parseAbi,
  parseEventLogs,
  createPublicClient,
  http
} from 'viem'
import { sepolia } from 'viem/chains'

export class SpicePassportError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message)
    this.name = 'SpicePassportError'
  }
}

export interface PassportData {
  batchId: bigint
  owner: Address
  spiceType: string
  totalWeight: bigint // in grams
  dateCreated: bigint
  isLocked: boolean
  harvestHash: string // IPFS hash for harvest data
  processingHashes: string[] // IPFS hashes for processing steps
  packageHash: string // IPFS hash for packaging data
  status: number // 0: IN_PROGRESS, 1: LOCKED, 2: WITHDRAWN
}

export interface CreatePassportResult {
  batchId: number
  transactionHash: Hash
  receipt: TransactionReceipt
}

export interface SpicePassportConfig {
  contractAddress: Address
  walletClient: WalletClient
  chainId?: number
}

// SpicePassport ABI for key functions
const SPICE_PASSPORT_ABI = parseAbi([
  // Events
  'event PassportCreated(uint256 indexed batchId, address indexed farmer, string spiceType, string harvestHash)',
  'event ProcessingStepAdded(uint256 indexed batchId, uint256 stepIndex, string processingHash)',
  'event PassportLocked(uint256 indexed batchId)',
  'event PassportWithdrawn(uint256 indexed batchId)',
  
  // Core functions
  'function createPassport(string spiceType, uint256 totalWeight, string harvestHash) external returns (uint256 batchId)',
  'function addProcessingStep(uint256 batchId, string processingHash) external',
  'function lockPassport(uint256 batchId) external',
  'function withdrawPassport(uint256 batchId) external',
  'function transferPassport(uint256 batchId, address newOwner) external',
  
  // View functions
  'function getPassport(uint256 batchId) external view returns ((uint256,address,string,uint256,uint256,bool,string,string[],string,uint8))',
  'function isPassportOwner(uint256 batchId, address user) external view returns (bool)',
  'function getPassportsByOwner(address owner) external view returns (uint256[])',
  'function getTotalPassports() external view returns (uint256)',
  'function getPassportsByStatus(uint8 status) external view returns (uint256[])'
])

export class SpicePassportService {
  private config: SpicePassportConfig
  private contract: any
  private publicClient: any
  private walletClient: WalletClient
  private contractAddress: Address
  private currentAddress: Address | undefined

  constructor(config: SpicePassportConfig) {
    this.config = config
    this.walletClient = config.walletClient
    this.contractAddress = config.contractAddress
    this.currentAddress = config.walletClient.account?.address
    
    this.contract = getContract({
      address: config.contractAddress,
      abi: SPICE_PASSPORT_ABI,
      client: config.walletClient,
    })
    
    // Create public client for reading transaction receipts
    this.publicClient = createPublicClient({
      chain: sepolia, // Updated to use Sepolia testnet
      transport: http(process.env.NEXT_PUBLIC_RPC_URL)
    })
  }

  /**
   * Create a new digital passport for spice batch
   */
  async createPassport(
    spiceType: string,
    totalWeightInGrams: number,
    harvestHash: string
  ): Promise<CreatePassportResult> {
    try {
      if (!spiceType.trim()) {
        throw new SpicePassportError('Spice type is required')
      }
      
      if (totalWeightInGrams <= 0) {
        throw new SpicePassportError('Weight must be greater than 0')
      }
      
      if (!harvestHash.startsWith('ipfs://')) {
        throw new SpicePassportError('Invalid IPFS hash format')
      }

      // Execute the transaction
      const hash = await this.contract.write.createPassport([
        spiceType,
        BigInt(totalWeightInGrams),
        harvestHash
      ])

      // Wait for transaction confirmation
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash })
      
      // Extract batch ID from transaction receipt
      const batchId = this.extractBatchIdFromReceipt(receipt)

      return {
        batchId,
        transactionHash: hash,
        receipt
      }

    } catch (error) {
      throw new SpicePassportError(
        `Failed to create passport: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      )
    }
  }

  /**
   * Add a processing step to an existing passport
   */
  async addProcessingStep(batchId: number, processingHash: string): Promise<Hash> {
    try {
      if (!processingHash.startsWith('ipfs://')) {
        throw new SpicePassportError('Invalid IPFS hash format')
      }

      const hash = await this.contract.write.addProcessingStep([
        BigInt(batchId),
        processingHash
      ])

      await this.publicClient.waitForTransactionReceipt({ hash })
      return hash

    } catch (error) {
      throw new SpicePassportError(
        `Failed to add processing step: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      )
    }
  }

  /**
   * Lock a passport to prevent further modifications
   */
  async lockPassport(batchId: number): Promise<{
    transactionHash: Hash
    receipt: TransactionReceipt
    gasUsed: bigint
    blockNumber?: number
  }> {
    if (!this.walletClient || !this.contractAddress || !this.currentAddress) {
      throw new SpicePassportError('Service not initialized')
    }

    try {
      // Validate passport is in correct state for locking
      const passport = await this.getPassport(batchId)
      if (!passport) {
        throw new SpicePassportError('Passport not found')
      }
      
      if (passport.status !== 0) { // 0 = IN_PROGRESS
        throw new SpicePassportError('Passport must be in IN_PROGRESS state to lock')
      }

      if (passport.owner.toLowerCase() !== this.currentAddress.toLowerCase()) {
        throw new SpicePassportError('Only passport owner can lock the passport')
      }

      // Simulate transaction first
      const { request } = await this.publicClient.simulateContract({
        address: this.contractAddress,
        abi: SPICE_PASSPORT_ABI,
        functionName: 'lockPassport',
        args: [BigInt(batchId)],
        account: this.currentAddress
      })

      // Execute transaction
      const hash = await this.walletClient.writeContract(request)
      
      // Wait for confirmation with extra confirmations for important action
      const receipt = await this.publicClient.waitForTransactionReceipt({
        hash,
        confirmations: 2
      })

      if (receipt.status !== 'success') {
        throw new SpicePassportError('Lock passport transaction failed')
      }

      return {
        transactionHash: hash,
        receipt,
        gasUsed: receipt.gasUsed,
        blockNumber: Number(receipt.blockNumber)
      }

    } catch (error) {
      throw new SpicePassportError(
        `Failed to lock passport: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      )
    }
  }

  /**
   * Get gas estimation for locking a passport
   */
  async getLockPassportGasEstimate(batchId: number): Promise<{
    gasLimit: bigint
    gasPrice: bigint
    estimatedCost: bigint
  }> {
    if (!this.contractAddress || !this.currentAddress) {
      throw new SpicePassportError('Service not initialized')
    }

    try {
      // Add buffer to gas limit for safety (10%)
      const baseGasLimit = await this.publicClient.estimateContractGas({
        address: this.contractAddress,
        abi: SPICE_PASSPORT_ABI,
        functionName: 'lockPassport',
        args: [BigInt(batchId)],
        account: this.currentAddress
      })

      const gasLimit = (baseGasLimit * BigInt(110)) / BigInt(100) // Add 10% buffer
      const gasPrice = await this.publicClient.getGasPrice()
      const estimatedCost = gasLimit * gasPrice

      return { gasLimit, gasPrice, estimatedCost }

    } catch (error) {
      throw new SpicePassportError(
        `Failed to estimate gas: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      )
    }
  }

  /**
   * Withdraw a passport (mark as withdrawn)
   */
  async withdrawPassport(batchId: number): Promise<Hash> {
    try {
      const hash = await this.contract.write.withdrawPassport([BigInt(batchId)])
      await this.publicClient.waitForTransactionReceipt({ hash })
      return hash

    } catch (error) {
      throw new SpicePassportError(
        `Failed to withdraw passport: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      )
    }
  }

  /**
   * Transfer passport ownership to another address
   */
  async transferPassport(batchId: number, newOwner: Address): Promise<Hash> {
    try {
      const hash = await this.contract.write.transferPassport([
        BigInt(batchId),
        newOwner
      ])
      
      await this.publicClient.waitForTransactionReceipt({ hash })
      return hash

    } catch (error) {
      throw new SpicePassportError(
        `Failed to transfer passport: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      )
    }
  }

  /**
   * Get complete passport data
   */
  async getPassport(batchId: number): Promise<PassportData | null> {
    try {
      const result = await this.contract.read.getPassport([BigInt(batchId)])
      
      if (!result || result[0] === BigInt(0)) {
        return null
      }

      return {
        batchId: result[0],
        owner: result[1],
        spiceType: result[2],
        totalWeight: result[3],
        dateCreated: result[4],
        isLocked: result[5],
        harvestHash: result[6],
        processingHashes: result[7] || [],
        packageHash: result[8] || '',
        status: result[9]
      }

    } catch (error) {
      throw new SpicePassportError(
        `Failed to get passport: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      )
    }
  }

  /**
   * Check if address owns a specific passport
   */
  async isPassportOwner(batchId: number, userAddress: Address): Promise<boolean> {
    try {
      return await this.contract.read.isPassportOwner([BigInt(batchId), userAddress])
    } catch (error) {
      throw new SpicePassportError(
        `Failed to check passport ownership: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      )
    }
  }

  /**
   * Get all passport IDs owned by an address
   */
  async getPassportsByOwner(ownerAddress: Address): Promise<number[]> {
    try {
      const result = await this.contract.read.getPassportsByOwner([ownerAddress])
      return result.map((id: bigint) => Number(id))
    } catch (error) {
      throw new SpicePassportError(
        `Failed to get passports by owner: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      )
    }
  }

  /**
   * Get passports by status
   */
  async getPassportsByStatus(status: 0 | 1 | 2): Promise<number[]> {
    try {
      const result = await this.contract.read.getPassportsByStatus([status])
      return result.map((id: bigint) => Number(id))
    } catch (error) {
      throw new SpicePassportError(
        `Failed to get passports by status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      )
    }
  }

  /**
   * Get total number of passports created
   */
  async getTotalPassports(): Promise<number> {
    try {
      const result = await this.contract.read.getTotalPassports()
      return Number(result)
    } catch (error) {
      throw new SpicePassportError(
        `Failed to get total passports: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      )
    }
  }

  /**
   * Get multiple passports at once
   */
  async getPassportsBatch(batchIds: number[]): Promise<(PassportData | null)[]> {
    try {
      const promises = batchIds.map(id => this.getPassport(id))
      return await Promise.all(promises)
    } catch (error) {
      throw new SpicePassportError(
        `Failed to get passports batch: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      )
    }
  }

  /**
   * Get farmer's passport statistics
   */
  async getFarmerStats(farmerAddress: Address): Promise<{
    totalPassports: number
    inProgressCount: number
    lockedCount: number
    withdrawnCount: number
  }> {
    try {
      const passportIds = await this.getPassportsByOwner(farmerAddress)
      const passports = await this.getPassportsBatch(passportIds)

      let inProgressCount = 0
      let lockedCount = 0
      let withdrawnCount = 0

      passports.forEach(passport => {
        if (!passport) return
        
        switch (passport.status) {
          case 0: inProgressCount++; break
          case 1: lockedCount++; break
          case 2: withdrawnCount++; break
        }
      })

      return {
        totalPassports: passportIds.length,
        inProgressCount,
        lockedCount,
        withdrawnCount
      }

    } catch (error) {
      throw new SpicePassportError(
        `Failed to get farmer stats: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      )
    }
  }

  /**
   * Extract batch ID from transaction receipt
   */
  private extractBatchIdFromReceipt(receipt: TransactionReceipt): number {
    try {
      // Parse event logs to find PassportCreated event
      const logs = parseEventLogs({
        abi: SPICE_PASSPORT_ABI,
        logs: receipt.logs,
      })

      const passportCreatedLog = logs.find(log => log.eventName === 'PassportCreated')
      
      if (!passportCreatedLog || !passportCreatedLog.args) {
        throw new SpicePassportError('PassportCreated event not found in transaction receipt')
      }

      const batchId = (passportCreatedLog.args as any).batchId
      return Number(batchId)

    } catch (error) {
      throw new SpicePassportError(
        `Failed to extract batch ID from receipt: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      )
    }
  }

  /**
   * Format passport data for display
   */
  static formatPassportForDisplay(passport: PassportData) {
    return {
      ...passport,
      batchId: Number(passport.batchId),
      totalWeight: Number(passport.totalWeight),
      dateCreated: new Date(Number(passport.dateCreated) * 1000),
      statusText: passport.status === 0 ? 'In Progress' : 
                  passport.status === 1 ? 'Locked' : 'Withdrawn',
      weightInKg: Number(passport.totalWeight) / 1000,
      createdDate: new Date(Number(passport.dateCreated) * 1000),
      processingStepCount: passport.processingHashes.length,
      spiceType: passport.spiceType,
      owner: passport.owner,
      harvestHash: passport.harvestHash,
      processingHashes: passport.processingHashes,
      isLocked: passport.isLocked || passport.status === 1
    }
  }

  /**
   * Validate passport creation parameters
   */
  static validateCreatePassportParams(
    spiceType: string,
    totalWeight: number,
    harvestHash: string
  ): string | null {
    if (!spiceType.trim()) {
      return 'Spice type is required'
    }

    if (spiceType.length < 3 || spiceType.length > 50) {
      return 'Spice type must be between 3 and 50 characters'
    }

    if (totalWeight <= 0) {
      return 'Weight must be greater than 0'
    }

    if (totalWeight > 10_000_000) { // 10,000 kg limit
      return 'Weight cannot exceed 10,000 kg'
    }

    if (!harvestHash || !harvestHash.startsWith('ipfs://')) {
      return 'Valid IPFS hash is required'
    }

    return null
  }
}