import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// In-memory storage for demo (replace with database later)
interface FarmerProfile {
  id: string;
  walletAddress: string;
  name: string;
  email: string;
  farmLocation: string;
  certifications: string[];
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const farmers: Map<string, FarmerProfile> = new Map();

export const farmersRouter = createTRPCRouter({
  // Register a new farmer
  register: publicProcedure
    .input(z.object({
      walletAddress: z.string(),
      name: z.string().min(2).max(100),
      email: z.string().email(),
      farmLocation: z.string().min(5).max(200),
      certifications: z.array(z.string()).optional().default([]),
    }))
    .mutation(async ({ input }) => {
      const farmerId = `farmer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const farmer: FarmerProfile = {
        id: farmerId,
        walletAddress: input.walletAddress,
        name: input.name,
        email: input.email,
        farmLocation: input.farmLocation,
        certifications: input.certifications,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      farmers.set(farmerId, farmer);

      return {
        success: true,
        farmer: {
          id: farmer.id,
          name: farmer.name,
          email: farmer.email,
          farmLocation: farmer.farmLocation,
          isVerified: farmer.isVerified,
        }
      };
    }),

  // Get farmer profile by wallet address
  getByWallet: publicProcedure
    .input(z.object({
      walletAddress: z.string(),
    }))
    .query(async ({ input }) => {
      const farmer = Array.from(farmers.values()).find(
        f => f.walletAddress.toLowerCase() === input.walletAddress.toLowerCase()
      );

      if (!farmer) {
        throw new Error("Farmer not found");
      }

      return {
        id: farmer.id,
        walletAddress: farmer.walletAddress,
        name: farmer.name,
        email: farmer.email,
        farmLocation: farmer.farmLocation,
        certifications: farmer.certifications,
        isVerified: farmer.isVerified,
        createdAt: farmer.createdAt,
      };
    }),

  // Update farmer profile
  updateProfile: publicProcedure
    .input(z.object({
      farmerId: z.string(),
      walletAddress: z.string(),
      name: z.string().min(2).max(100).optional(),
      email: z.string().email().optional(),
      farmLocation: z.string().min(5).max(200).optional(),
      certifications: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const farmer = farmers.get(input.farmerId);

      if (!farmer || farmer.walletAddress.toLowerCase() !== input.walletAddress.toLowerCase()) {
        throw new Error("Farmer not found or unauthorized");
      }

      // Update fields
      if (input.name) farmer.name = input.name;
      if (input.email) farmer.email = input.email;
      if (input.farmLocation) farmer.farmLocation = input.farmLocation;
      if (input.certifications) farmer.certifications = input.certifications;
      farmer.updatedAt = new Date();

      farmers.set(input.farmerId, farmer);

      return {
        success: true,
        farmer: {
          id: farmer.id,
          name: farmer.name,
          email: farmer.email,
          farmLocation: farmer.farmLocation,
          isVerified: farmer.isVerified,
        }
      };
    }),

  // Get all farmers (for admin/verification purposes)
  getAll: publicProcedure
    .input(z.object({
      verified: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      let farmerList = Array.from(farmers.values());

      // Filter by verification status if specified
      if (input.verified !== undefined) {
        farmerList = farmerList.filter(f => f.isVerified === input.verified);
      }

      // Sort by creation date (newest first)
      farmerList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      // Apply pagination
      const total = farmerList.length;
      const paginatedFarmers = farmerList.slice(input.offset, input.offset + input.limit);

      return {
        farmers: paginatedFarmers.map(farmer => ({
          id: farmer.id,
          walletAddress: farmer.walletAddress,
          name: farmer.name,
          email: farmer.email,
          farmLocation: farmer.farmLocation,
          certifications: farmer.certifications,
          isVerified: farmer.isVerified,
          createdAt: farmer.createdAt,
        })),
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  // Verify farmer (admin function)
  verify: publicProcedure
    .input(z.object({
      farmerId: z.string(),
      adminWallet: z.string(),
    }))
    .mutation(async ({ input }) => {
      // TODO: Add proper admin authentication
      const farmer = farmers.get(input.farmerId);

      if (!farmer) {
        throw new Error("Farmer not found");
      }

      farmer.isVerified = true;
      farmer.updatedAt = new Date();
      farmers.set(input.farmerId, farmer);

      return {
        success: true,
        farmerId: farmer.id,
        isVerified: farmer.isVerified,
      };
    }),
});