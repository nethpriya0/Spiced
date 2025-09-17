import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// In-memory storage for demo (replace with database later)
interface SpiceProduct {
  id: string;
  farmerId: string;
  name: string;
  spiceType: string;
  variety: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  currency: string;
  harvestDate: Date;
  description: string;
  images: string[]; // IPFS hashes
  certifications: string[];
  origin: {
    country: string;
    region: string;
    farm: string;
  };
  processingSteps: Array<{
    step: string;
    date: Date;
    location: string;
    description: string;
  }>;
  passportId: string | null; // Link to blockchain passport
  status: 'draft' | 'listed' | 'sold' | 'withdrawn';
  createdAt: Date;
  updatedAt: Date;
}

const products: Map<string, SpiceProduct> = new Map();

// Initialize with some sample data
const sampleProducts: SpiceProduct[] = [
  {
    id: "prod_1",
    farmerId: "farmer_1",
    name: "Premium Ceylon Cinnamon",
    spiceType: "cinnamon",
    variety: "Ceylon",
    quantity: 10,
    unit: "kg",
    pricePerUnit: 45.00,
    currency: "USD",
    harvestDate: new Date('2024-08-15'),
    description: "High-quality Ceylon cinnamon from organic farms in Sri Lanka",
    images: ["Qm...sample1", "Qm...sample2"],
    certifications: ["Organic", "Fair Trade"],
    origin: {
      country: "Sri Lanka",
      region: "Kandy",
      farm: "Green Valley Organic Farm"
    },
    processingSteps: [
      {
        step: "Harvesting",
        date: new Date('2024-08-15'),
        location: "Green Valley Farm",
        description: "Hand-harvested cinnamon bark"
      },
      {
        step: "Drying",
        date: new Date('2024-08-17'),
        location: "Processing Facility",
        description: "Sun-dried for 48 hours"
      }
    ],
    passportId: null,
    status: 'listed',
    createdAt: new Date('2024-08-20'),
    updatedAt: new Date('2024-08-20'),
  },
  {
    id: "prod_2",
    farmerId: "farmer_2",
    name: "Kashmiri Saffron",
    spiceType: "saffron",
    variety: "Kashmiri",
    quantity: 0.5,
    unit: "kg",
    pricePerUnit: 2500.00,
    currency: "USD",
    harvestDate: new Date('2024-09-01'),
    description: "Premium Kashmiri saffron with deep red color and intense aroma",
    images: ["Qm...saffron1", "Qm...saffron2"],
    certifications: ["Grade A", "Certified Origin"],
    origin: {
      country: "India",
      region: "Kashmir",
      farm: "Himalayan Saffron Collective"
    },
    processingSteps: [
      {
        step: "Hand Picking",
        date: new Date('2024-09-01'),
        location: "Kashmir Valley",
        description: "Carefully hand-picked stigmas"
      }
    ],
    passportId: null,
    status: 'listed',
    createdAt: new Date('2024-09-02'),
    updatedAt: new Date('2024-09-02'),
  }
];

// Initialize sample data
sampleProducts.forEach(product => products.set(product.id, product));

export const productsRouter = createTRPCRouter({
  // Create a new product listing
  create: publicProcedure
    .input(z.object({
      farmerId: z.string(),
      name: z.string().min(2).max(100),
      spiceType: z.string(),
      variety: z.string(),
      quantity: z.number().positive(),
      unit: z.enum(['kg', 'lbs', 'tons', 'grams']),
      pricePerUnit: z.number().positive(),
      currency: z.enum(['USD', 'EUR', 'LKR', 'INR']),
      harvestDate: z.date(),
      description: z.string().max(1000),
      images: z.array(z.string()).default([]),
      certifications: z.array(z.string()).default([]),
      origin: z.object({
        country: z.string(),
        region: z.string(),
        farm: z.string(),
      }),
    }))
    .mutation(async ({ input }) => {
      const productId = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const product: SpiceProduct = {
        id: productId,
        farmerId: input.farmerId,
        name: input.name,
        spiceType: input.spiceType,
        variety: input.variety,
        quantity: input.quantity,
        unit: input.unit,
        pricePerUnit: input.pricePerUnit,
        currency: input.currency,
        harvestDate: input.harvestDate,
        description: input.description,
        images: input.images,
        certifications: input.certifications,
        origin: input.origin,
        processingSteps: [],
        passportId: null,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      products.set(productId, product);

      return {
        success: true,
        product: {
          id: product.id,
          name: product.name,
          spiceType: product.spiceType,
          status: product.status,
        }
      };
    }),

  // Get product by ID
  getById: publicProcedure
    .input(z.object({
      productId: z.string(),
    }))
    .query(async ({ input }) => {
      const product = products.get(input.productId);

      if (!product) {
        throw new Error("Product not found");
      }

      return product;
    }),

  // Get products by farmer
  getByFarmer: publicProcedure
    .input(z.object({
      farmerId: z.string(),
      status: z.enum(['draft', 'listed', 'sold', 'withdrawn']).optional(),
    }))
    .query(async ({ input }) => {
      let farmerProducts = Array.from(products.values()).filter(
        p => p.farmerId === input.farmerId
      );

      if (input.status) {
        farmerProducts = farmerProducts.filter(p => p.status === input.status);
      }

      return farmerProducts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }),

  // Get all products (marketplace view)
  getAll: publicProcedure
    .input(z.object({
      spiceType: z.string().optional(),
      country: z.string().optional(),
      status: z.enum(['listed']).default('listed'),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      certifications: z.array(z.string()).optional(),
      limit: z.number().min(1).max(50).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      let productList = Array.from(products.values());

      // Apply filters
      productList = productList.filter(p => p.status === input.status);

      if (input.spiceType) {
        productList = productList.filter(p =>
          p.spiceType.toLowerCase().includes(input.spiceType!.toLowerCase())
        );
      }

      if (input.country) {
        productList = productList.filter(p =>
          p.origin.country.toLowerCase().includes(input.country!.toLowerCase())
        );
      }

      if (input.minPrice) {
        productList = productList.filter(p => p.pricePerUnit >= input.minPrice!);
      }

      if (input.maxPrice) {
        productList = productList.filter(p => p.pricePerUnit <= input.maxPrice!);
      }

      if (input.certifications && input.certifications.length > 0) {
        productList = productList.filter(p =>
          input.certifications!.some(cert =>
            p.certifications.some(productCert =>
              productCert.toLowerCase().includes(cert.toLowerCase())
            )
          )
        );
      }

      // Sort by creation date (newest first)
      productList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      // Apply pagination
      const total = productList.length;
      const paginatedProducts = productList.slice(input.offset, input.offset + input.limit);

      return {
        products: paginatedProducts,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  // Update product
  update: publicProcedure
    .input(z.object({
      productId: z.string(),
      farmerId: z.string(),
      name: z.string().min(2).max(100).optional(),
      description: z.string().max(1000).optional(),
      pricePerUnit: z.number().positive().optional(),
      quantity: z.number().positive().optional(),
      status: z.enum(['draft', 'listed', 'sold', 'withdrawn']).optional(),
      images: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const product = products.get(input.productId);

      if (!product || product.farmerId !== input.farmerId) {
        throw new Error("Product not found or unauthorized");
      }

      // Update fields
      if (input.name) product.name = input.name;
      if (input.description) product.description = input.description;
      if (input.pricePerUnit) product.pricePerUnit = input.pricePerUnit;
      if (input.quantity) product.quantity = input.quantity;
      if (input.status) product.status = input.status;
      if (input.images) product.images = input.images;
      product.updatedAt = new Date();

      products.set(input.productId, product);

      return {
        success: true,
        product: {
          id: product.id,
          name: product.name,
          status: product.status,
        }
      };
    }),

  // Add processing step
  addProcessingStep: publicProcedure
    .input(z.object({
      productId: z.string(),
      farmerId: z.string(),
      step: z.string(),
      location: z.string(),
      description: z.string(),
    }))
    .mutation(async ({ input }) => {
      const product = products.get(input.productId);

      if (!product || product.farmerId !== input.farmerId) {
        throw new Error("Product not found or unauthorized");
      }

      product.processingSteps.push({
        step: input.step,
        date: new Date(),
        location: input.location,
        description: input.description,
      });

      product.updatedAt = new Date();
      products.set(input.productId, product);

      return {
        success: true,
        processingSteps: product.processingSteps,
      };
    }),

  // Link blockchain passport
  linkPassport: publicProcedure
    .input(z.object({
      productId: z.string(),
      farmerId: z.string(),
      passportId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const product = products.get(input.productId);

      if (!product || product.farmerId !== input.farmerId) {
        throw new Error("Product not found or unauthorized");
      }

      product.passportId = input.passportId;
      product.updatedAt = new Date();
      products.set(input.productId, product);

      return {
        success: true,
        passportId: product.passportId,
      };
    }),
});