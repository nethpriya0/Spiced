import type { Address } from 'viem'

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

export class MockFarmerRegistryService {
  private static registeredFarmers = new Map<Address, UserProfile>()

  async registerFarmer(
    address: Address,
    name: string,
    bio: string,
    location: string,
    profilePictureHash?: string
  ): Promise<string> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Create mock profile
    const profile: UserProfile = {
      name,
      bio,
      profilePictureHash: profilePictureHash || '',
      reputationScore: BigInt(100),
      isVerified: false,
      verifiedBadges: [],
      dateJoined: BigInt(Date.now()),
      batchesCreated: [],
      batchesPurchased: [],
      disputesInvolvedIn: []
    }

    MockFarmerRegistryService.registeredFarmers.set(address, profile)
    console.log('✅ Mock farmer registered successfully:', { address, name, bio, location })

    return 'mock-transaction-hash-' + Date.now()
  }

  async isFarmerRegistered(address: Address): Promise<boolean> {
    return MockFarmerRegistryService.registeredFarmers.has(address)
  }

  async getFarmerProfile(address: Address): Promise<UserProfile | null> {
    return MockFarmerRegistryService.registeredFarmers.get(address) || null
  }

  async getAllFarmers(): Promise<Array<{ address: Address; profile: UserProfile }>> {
    return Array.from(MockFarmerRegistryService.registeredFarmers.entries()).map(
      ([address, profile]) => ({ address, profile })
    )
  }
}

export const mockFarmerRegistryService = new MockFarmerRegistryService()