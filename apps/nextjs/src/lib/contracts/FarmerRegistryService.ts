import { type Address, type WalletClient, type Hash, getContract, parseAbi } from 'viem'
import { sepolia } from 'viem/chains'

export class FarmerRegistryError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message)
    this.name = 'FarmerRegistryError'
  }
}

export interface UserProfile {
  name: string
  bio: string
  profilePictureHash: string
  reputationScore: bigint
  isVerified: boolean
  verifiedBadges: string[]
  dateJoined: bigint
  batchesCreated: bigint[]
  batchesPurchased: bigint[]
  disputesInvolvedIn: bigint[]
}

export interface FarmerRegistryConfig {
  contractAddress: Address
  walletClient: WalletClient
}

// FarmerRegistry ABI for key functions
const FARMER_REGISTRY_ABI = parseAbi([
  // Events
  'event FarmerRegistered(address indexed farmer, string name, uint256 dateJoined)',
  'event FarmerVerified(address indexed farmer, address indexed verifier, uint256 timestamp)',
  'event ProfileUpdated(address indexed farmer, string name, string bio, string profilePictureHash)',
  
  // Core functions
  'function registerFarmer(string name, string bio, string profilePictureHash) external',
  'function verifyFarmer(address farmer) external',
  'function updateProfile(string name, string bio, string profilePictureHash) external',
  'function addVerificationBadge(address farmer, string badgeName) external',
  
  // View functions  
  'function isVerified(address farmer) external view returns (bool)',
  'function getUserProfile(address user) external view returns ((string,string,string,uint256,bool,string[],uint256,uint256[],uint256[],uint256[]))',
  'function getReputationScore(address farmer) external view returns (uint256)',
  'function getPendingFarmers() external view returns (address[])',
  'function getVerifiedFarmers() external view returns (address[])',
  'function getFarmerCount() external view returns (uint256)',
  'function getVerifiedFarmerCount() external view returns (uint256)',
  'function isRegisteredFarmer(address farmer) external view returns (bool)',
  'function getFarmerBatches(address farmer) external view returns (uint256[])',
  
  // Role functions
  'function hasRole(bytes32 role, address account) external view returns (bool)',
  'function grantRole(bytes32 role, address account) external',
  'function VERIFIER_ROLE() external view returns (bytes32)',
])

export class FarmerRegistryService {
  private contract: any = null
  private static instance: FarmerRegistryService | null = null

  static getInstance(): FarmerRegistryService {
    if (!FarmerRegistryService.instance) {
      FarmerRegistryService.instance = new FarmerRegistryService()
    }
    return FarmerRegistryService.instance
  }

  initialize(config: FarmerRegistryConfig): void {
    this.contract = getContract({
      address: config.contractAddress,
      abi: FARMER_REGISTRY_ABI,
      client: config.walletClient
    })
  }

  private ensureInitialized(): void {
    if (!this.contract) {
      throw new FarmerRegistryError('FarmerRegistryService not initialized')
    }
  }

  /**
   * Register a new farmer on the platform
   */
  async registerFarmer(
    name: string,
    bio: string,
    profilePictureHash: string
  ): Promise<Hash> {
    this.ensureInitialized()

    try {
      const hash = await this.contract.write.registerFarmer([
        name,
        bio,
        profilePictureHash
      ])

      return hash as Hash
    } catch (error) {
      throw new FarmerRegistryError('Failed to register farmer', error)
    }
  }

  /**
   * Verify a farmer (only callable by verifiers)
   */
  async verifyFarmer(farmerAddress: Address): Promise<Hash> {
    this.ensureInitialized()

    try {
      const hash = await this.contract.write.verifyFarmer([farmerAddress])
      return hash as Hash
    } catch (error) {
      throw new FarmerRegistryError('Failed to verify farmer', error)
    }
  }

  /**
   * Update farmer's profile
   */
  async updateProfile(
    name: string,
    bio: string,
    profilePictureHash: string
  ): Promise<Hash> {
    this.ensureInitialized()

    try {
      const hash = await this.contract.write.updateProfile([
        name,
        bio,
        profilePictureHash
      ])

      return hash as Hash
    } catch (error) {
      throw new FarmerRegistryError('Failed to update profile', error)
    }
  }

  /**
   * Award a verification badge to a farmer
   */
  async addVerificationBadge(
    farmerAddress: Address,
    badgeName: string
  ): Promise<Hash> {
    this.ensureInitialized()

    try {
      const hash = await this.contract.write.addVerificationBadge([
        farmerAddress,
        badgeName
      ])

      return hash as Hash
    } catch (error) {
      throw new FarmerRegistryError('Failed to add verification badge', error)
    }
  }

  // View functions

  /**
   * Check if a farmer is verified
   */
  async isVerified(farmerAddress: Address): Promise<boolean> {
    this.ensureInitialized()

    try {
      return await this.contract.read.isVerified([farmerAddress])
    } catch (error) {
      throw new FarmerRegistryError('Failed to check verification status', error)
    }
  }

  /**
   * Check if an address is a registered farmer
   */
  async isRegisteredFarmer(farmerAddress: Address): Promise<boolean> {
    this.ensureInitialized()

    try {
      return await this.contract.read.isRegisteredFarmer([farmerAddress])
    } catch (error) {
      throw new FarmerRegistryError('Failed to check farmer registration', error)
    }
  }

  /**
   * Get farmer's complete profile
   */
  async getUserProfile(userAddress: Address): Promise<UserProfile> {
    this.ensureInitialized()

    try {
      const profile = await this.contract.read.getUserProfile([userAddress])
      
      return {
        name: profile[0],
        bio: profile[1],
        profilePictureHash: profile[2],
        reputationScore: profile[3],
        isVerified: profile[4],
        verifiedBadges: profile[5],
        dateJoined: profile[6],
        batchesCreated: profile[7],
        batchesPurchased: profile[8],
        disputesInvolvedIn: profile[9]
      }
    } catch (error) {
      throw new FarmerRegistryError('Failed to get user profile', error)
    }
  }

  /**
   * Get list of pending (unverified) farmers
   */
  async getPendingFarmers(): Promise<Address[]> {
    this.ensureInitialized()

    try {
      return await this.contract.read.getPendingFarmers()
    } catch (error) {
      throw new FarmerRegistryError('Failed to get pending farmers', error)
    }
  }

  /**
   * Get list of verified farmers
   */
  async getVerifiedFarmers(): Promise<Address[]> {
    this.ensureInitialized()

    try {
      return await this.contract.read.getVerifiedFarmers()
    } catch (error) {
      throw new FarmerRegistryError('Failed to get verified farmers', error)
    }
  }

  /**
   * Get farmer's reputation score
   */
  async getReputationScore(farmerAddress: Address): Promise<number> {
    this.ensureInitialized()

    try {
      const score = await this.contract.read.getReputationScore([farmerAddress])
      return Number(score)
    } catch (error) {
      throw new FarmerRegistryError('Failed to get reputation score', error)
    }
  }

  /**
   * Get total number of farmers
   */
  async getFarmerCount(): Promise<number> {
    this.ensureInitialized()

    try {
      const count = await this.contract.read.getFarmerCount()
      return Number(count)
    } catch (error) {
      throw new FarmerRegistryError('Failed to get farmer count', error)
    }
  }

  /**
   * Get number of verified farmers
   */
  async getVerifiedFarmerCount(): Promise<number> {
    this.ensureInitialized()

    try {
      const count = await this.contract.read.getVerifiedFarmerCount()
      return Number(count)
    } catch (error) {
      throw new FarmerRegistryError('Failed to get verified farmer count', error)
    }
  }

  /**
   * Get farmer's batches/products
   */
  async getFarmerBatches(farmerAddress: Address): Promise<bigint[]> {
    this.ensureInitialized()

    try {
      return await this.contract.read.getFarmerBatches([farmerAddress])
    } catch (error) {
      throw new FarmerRegistryError('Failed to get farmer batches', error)
    }
  }

  /**
   * Check if current user has verifier role
   */
  async hasVerifierRole(userAddress: Address): Promise<boolean> {
    this.ensureInitialized()

    try {
      const verifierRole = await this.contract.read.VERIFIER_ROLE()
      return await this.contract.read.hasRole([verifierRole, userAddress])
    } catch (error) {
      throw new FarmerRegistryError('Failed to check verifier role', error)
    }
  }

  /**
   * Listen for farmer registration events
   */
  async watchFarmerRegistered(
    onEvent: (farmer: Address, name: string, dateJoined: bigint) => void
  ): Promise<() => void> {
    this.ensureInitialized()

    try {
      const unwatch = this.contract.watchEvent.FarmerRegistered(
        {},
        {
          onLogs: (logs: any[]) => {
            logs.forEach((log: any) => {
              onEvent(log.args.farmer, log.args.name, log.args.dateJoined)
            })
          }
        }
      )

      return unwatch
    } catch (error) {
      throw new FarmerRegistryError('Failed to watch farmer registration events', error)
    }
  }

  /**
   * Listen for farmer verification events
   */
  async watchFarmerVerified(
    onEvent: (farmer: Address, verifier: Address, timestamp: bigint) => void
  ): Promise<() => void> {
    this.ensureInitialized()

    try {
      const unwatch = this.contract.watchEvent.FarmerVerified(
        {},
        {
          onLogs: (logs: any[]) => {
            logs.forEach((log: any) => {
              onEvent(log.args.farmer, log.args.verifier, log.args.timestamp)
            })
          }
        }
      )

      return unwatch
    } catch (error) {
      throw new FarmerRegistryError('Failed to watch farmer verification events', error)
    }
  }
}

// Export singleton instance
export const farmerRegistryService = FarmerRegistryService.getInstance()