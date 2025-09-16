/**
 * Rich demo data for presentation scenarios
 * This file contains comprehensive sample data to showcase platform capabilities
 */

import { type MarketplaceProduct } from '@/types/marketplace'
import { type Address } from 'viem'

export const DEMO_FARMERS = [
  {
    name: "Sunil Perera",
    address: "0x1234567890123456789012345678901234567890" as Address,
    region: "Matale District",
    farmName: "Ceylon Heritage Spice Garden",
    experience: "25 years",
    specialties: ["Ceylon Cinnamon", "White Pepper"],
    certifications: ["Organic", "Fair Trade", "EU Organic"],
    profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=sunil&backgroundColor=c0aede"
  },
  {
    name: "Kamala Silva",
    address: "0x2345678901234567890123456789012345678901" as Address,
    region: "Kandy Hills",
    farmName: "Mountain Spice Collective",
    experience: "18 years",
    specialties: ["Black Pepper", "Cloves"],
    certifications: ["Organic", "Rainforest Alliance"],
    profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=kamala&backgroundColor=ffd5dc"
  },
  {
    name: "Ranjan Fernando",
    address: "0x3456789012345678901234567890123456789012" as Address,
    region: "Ella Valley",
    farmName: "Misty Mountain Spices",
    experience: "32 years",
    specialties: ["Cardamom", "Nutmeg"],
    certifications: ["Organic", "Bird Friendly", "Carbon Neutral"],
    profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=ranjan&backgroundColor=d4c5b9"
  },
  {
    name: "Priyanka Mendis",
    address: "0x5678901234567890123456789012345678901234" as Address,
    region: "Kalutara Coast",
    farmName: "Coastal Spice Gardens",
    experience: "15 years",
    specialties: ["Nutmeg", "Mace", "Vanilla"],
    certifications: ["Organic", "Women's Cooperative"],
    profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=priyanka&backgroundColor=b6e5d8"
  },
  {
    name: "Ajith Bandara",
    address: "0x6789012345678901234567890123456789012345" as Address,
    region: "Polonnaruwa Plains",
    farmName: "Ancient City Spice Farm",
    experience: "22 years",
    specialties: ["Turmeric", "Ginger", "Lemongrass"],
    certifications: ["Organic", "Traditional Knowledge"],
    profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=mahesh&backgroundColor=a8e6cf"
  },
  {
    name: "Nimal Rajapaksa",
    address: "0x4567890123456789012345678901234567890123" as Address,
    region: "Galle Highlands",
    farmName: "Southern Spice Heritage",
    experience: "28 years",
    specialties: ["Cloves", "Allspice"],
    certifications: ["Organic", "Heritage Seed Guardian"],
    profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=dilshan&backgroundColor=ffb3ba"
  }
]

export const DEMO_PRODUCTS: MarketplaceProduct[] = [
  {
    batchId: 'SPN-001-2024-047',
    spiceType: 'Ceylon Cinnamon',
    farmerName: 'Sunil Perera',
    farmerAddress: '0x1234567890123456789012345678901234567890' as Address,
    price: 45.99,
    weight: 2.5,
    unit: 'kg',
    harvestDate: '2024-01-15',
    sealedAt: '2024-01-20',
    description: 'Premium grade Ceylon cinnamon bark, hand-harvested from 300-year-old sustainable plantations in Matale district. This true cinnamon (Cinnamomum verum) features the distinctive sweet, delicate flavor that has made Sri Lankan cinnamon world-renowned for centuries.',
    imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=cinnamon&backgroundColor=d2b48c',
    verificationHash: '0xabcd1234ef567890abcd1234ef567890abcd1234',
    qualityGrade: 'A',
    processingMethod: 'Traditional sun-drying and hand-rolling technique passed down through generations',
    region: 'Matale, Sri Lanka',
    certifications: ['Organic', 'Fair Trade', 'EU Organic'],
    curcumin: null,
    piperine: null,
    moistureContent: '8.2%',
    harvestStory: "Harvested during the optimal rainy season when the bark peels most easily. Our family has been perfecting this craft for four generations.",
    sustainabilityScore: 9.2,
    carbonFootprint: "0.8 kg CO2e per kg",
    reviews: [
      { rating: 5, comment: "Incredible flavor, nothing like supermarket cinnamon!", buyer: "Chef Maria L." },
      { rating: 5, comment: "Perfect for my artisan bakery. Customers notice the difference.", buyer: "Baker Tom K." }
    ]
  },
  {
    batchId: 'SPN-002-2024-033',
    spiceType: 'Black Pepper',
    farmerName: 'Kamala Silva',
    farmerAddress: '0x2345678901234567890123456789012345678901' as Address,
    price: 32.50,
    weight: 1.8,
    unit: 'kg',
    harvestDate: '2024-01-18',
    sealedAt: '2024-01-22',
    description: 'Aromatic black peppercorns with exceptionally high piperine content (7.2%), grown in the pristine hill country at 1200m elevation. Hand-picked at perfect ripeness and traditionally processed.',
    imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=pepper&backgroundColor=8b4513',
    verificationHash: '0xefgh5678ij901234klmn5678op901234qr567890',
    qualityGrade: 'A+',
    processingMethod: 'Traditional sun-drying on raised bamboo mats for 7-10 days',
    region: 'Kandy, Sri Lanka',
    certifications: ['Organic', 'Rainforest Alliance'],
    curcumin: null,
    piperine: '7.2%',
    moistureContent: '11.5%',
    harvestStory: "These peppercorns are from our highest elevation plots where the cool mountain air concentrates the essential oils.",
    sustainabilityScore: 8.8,
    carbonFootprint: "1.2 kg CO2e per kg",
    reviews: [
      { rating: 5, comment: "The heat is perfect, not overpowering but with great depth.", buyer: "Restaurant Spice Master" },
      { rating: 4, comment: "Great quality, will definitely order again.", buyer: "Home Chef Sarah" }
    ]
  },
  {
    batchId: 'SPN-003-2024-019',
    spiceType: 'Cardamom',
    farmerName: 'Ranjan Fernando',
    farmerAddress: '0x3456789012345678901234567890123456789012' as Address,
    price: 89.99,
    weight: 0.5,
    unit: 'kg',
    harvestDate: '2024-01-20',
    sealedAt: '2024-01-25',
    description: 'Premium green cardamom pods (Elettaria cardamomum), hand-picked at peak ripeness when the pods are 75% mature. Each pod contains 8-12 highly aromatic seeds with intense, complex flavor profile.',
    imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=cardamom&backgroundColor=90ee90',
    verificationHash: '0xijkl9012mn345678pqrs9012tu345678vw901234',
    qualityGrade: 'AA',
    processingMethod: 'Controlled low-temperature drying to preserve essential oils',
    region: 'Ella, Sri Lanka',
    certifications: ['Organic', 'Bird Friendly', 'Carbon Neutral'],
    curcumin: null,
    piperine: null,
    moistureContent: '10.8%',
    essentialOilContent: '8.5%',
    harvestStory: "Our cardamom grows in the shadow of ancient rainforest trees, creating the perfect microclimate for maximum essential oil development.",
    sustainabilityScore: 9.7,
    carbonFootprint: "0.3 kg CO2e per kg (carbon negative farm)",
    reviews: [
      { rating: 5, comment: "The most aromatic cardamom I've ever used. Worth every penny!", buyer: "Indian Restaurant Chain" },
      { rating: 5, comment: "My grandmother from Kerala says this is better than what she remembers from her childhood.", buyer: "Cultural Food Preservationist" }
    ]
  },
  {
    batchId: 'SPN-004-2024-052',
    spiceType: 'Cloves',
    farmerName: 'Nimal Rajapaksa',
    farmerAddress: '0x4567890123456789012345678901234567890123' as Address,
    price: 55.75,
    weight: 1.2,
    unit: 'kg',
    harvestDate: '2024-01-12',
    sealedAt: '2024-01-18',
    description: 'Whole clove buds with exceptional eugenol content (18.2%), perfect for culinary and medicinal applications. Harvested when flower buds turn pink but before blooming.',
    imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=nutmeg&backgroundColor=daa520',
    verificationHash: '0xmnop3456qr789012stux3456yz789012ab345678',
    qualityGrade: 'A',
    processingMethod: 'Natural sun-drying on traditional palm leaf mats',
    region: 'Galle, Sri Lanka',
    certifications: ['Organic', 'Heritage Seed Guardian'],
    curcumin: null,
    piperine: null,
    eugenol: '18.2%',
    moistureContent: '9.5%',
    harvestStory: "These clove trees are over 150 years old, planted by my great-grandfather. The mature trees produce the most aromatic buds.",
    sustainabilityScore: 9.0,
    carbonFootprint: "0.9 kg CO2e per kg",
    reviews: [
      { rating: 5, comment: "Perfect for my spice blend business. Customers love the quality.", buyer: "Artisan Spice Co." },
      { rating: 4, comment: "Strong aroma and flavor, excellent for baking.", buyer: "Specialty Bakery" }
    ]
  },
  {
    batchId: 'SPN-005-2024-028',
    spiceType: 'Nutmeg',
    farmerName: 'Priyanka Mendis',
    farmerAddress: '0x5678901234567890123456789012345678901234' as Address,
    price: 67.25,
    weight: 0.8,
    unit: 'kg',
    harvestDate: '2024-01-25',
    sealedAt: '2024-01-30',
    description: 'Fresh nutmeg seeds with rich, warm flavor profile and high myristicin content. Grown in coastal groves where sea breezes create unique terroir characteristics.',
    imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=cloves&backgroundColor=8b0000',
    verificationHash: '0xqrst7890uv123456wxyz7890ab123456cd789012',
    qualityGrade: 'A+',
    processingMethod: 'Traditional 6-week slow-drying process',
    region: 'Kalutara, Sri Lanka',
    certifications: ['Organic', "Women's Cooperative"],
    curcumin: null,
    piperine: null,
    myristicin: '2.1%',
    moistureContent: '8.8%',
    harvestStory: "Our women's cooperative manages these nutmeg groves sustainably, with 60% of profits supporting local education programs.",
    sustainabilityScore: 9.4,
    carbonFootprint: "0.7 kg CO2e per kg",
    socialImpact: "Supports 45 families and 2 local schools",
    reviews: [
      { rating: 5, comment: "Supporting women farmers while getting amazing quality!", buyer: "Ethical Food Importer" },
      { rating: 5, comment: "The complexity of flavor is incredible, perfect for fine dining.", buyer: "Michelin Star Restaurant" }
    ]
  },
  {
    batchId: 'SPN-006-2024-041',
    spiceType: 'Turmeric',
    farmerName: 'Ajith Bandara',
    farmerAddress: '0x6789012345678901234567890123456789012345' as Address,
    price: 28.99,
    weight: 3.0,
    unit: 'kg',
    harvestDate: '2024-01-22',
    sealedAt: '2024-01-28',
    description: 'High-curcumin turmeric roots (6.8% curcumin content) organically grown without synthetic fertilizers. Ancient variety cultivated using traditional Ayurvedic methods.',
    imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=vanilla&backgroundColor=f5deb3',
    verificationHash: '0xuvwx1234yz567890efgh1234ij567890kl901234',
    qualityGrade: 'A',
    processingMethod: 'Clean washing, boiling, and traditional sun-drying',
    region: 'Polonnaruwa, Sri Lanka',
    certifications: ['Organic', 'Traditional Knowledge'],
    curcumin: '6.8%',
    piperine: null,
    moistureContent: '12.2%',
    harvestStory: "This turmeric variety has been grown in these ancient fields for over 1000 years, using methods documented in old palm leaf manuscripts.",
    sustainabilityScore: 8.5,
    carbonFootprint: "1.1 kg CO2e per kg",
    healthBenefits: "High bioavailable curcumin, anti-inflammatory properties",
    reviews: [
      { rating: 5, comment: "The color is amazing and health benefits are noticeable.", buyer: "Health Food Store" },
      { rating: 4, comment: "Perfect for golden milk lattes, customers love it.", buyer: "Wellness Café" }
    ]
  },
  {
    batchId: 'SPN-007-2024-015',
    spiceType: 'White Pepper',
    farmerName: 'Sunil Perera',
    farmerAddress: '0x1234567890123456789012345678901234567890' as Address,
    price: 42.00,
    weight: 1.0,
    unit: 'kg',
    harvestDate: '2024-01-28',
    sealedAt: '2024-02-02',
    description: 'Rare white pepper from fully ripened peppercorns, traditional water-retting process. Milder heat than black pepper with complex floral notes.',
    imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=turmeric&backgroundColor=ffd700',
    verificationHash: '0xmnab5678cd901234ef567890gh123456ij789012',
    qualityGrade: 'AA',
    processingMethod: 'Traditional water-retting for 7 days, then sun-drying',
    region: 'Matale, Sri Lanka',
    certifications: ['Organic', 'Fair Trade'],
    piperine: '5.8%',
    moistureContent: '10.1%',
    harvestStory: "White pepper is our most labor-intensive spice, requiring perfect timing and the ancient water-retting technique my grandfather taught me.",
    sustainabilityScore: 8.9,
    carbonFootprint: "1.5 kg CO2e per kg",
    reviews: [
      { rating: 5, comment: "Perfect for white sauces, doesn't alter the color but adds amazing flavor.", buyer: "French Restaurant Chef" }
    ]
  },
  {
    batchId: 'SPN-008-2024-007',
    spiceType: 'Vanilla',
    farmerName: 'Priyanka Mendis',
    farmerAddress: '0x5678901234567890123456789012345678901234' as Address,
    price: 125.99,
    weight: 0.2,
    unit: 'kg',
    harvestDate: '2024-01-30',
    sealedAt: '2024-02-05',
    description: 'Premium vanilla pods (Vanilla planifolia) with 2.8% vanillin content. Hand-pollinated flowers, carefully cured for 6 months using traditional methods.',
    imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=ginger&backgroundColor=cd853f',
    verificationHash: '0xopqr9012st345678uv901234wx567890yz123456',
    qualityGrade: 'AAA',
    processingMethod: '6-month traditional curing: blanching, sweating, drying, and conditioning',
    region: 'Kalutara, Sri Lanka',
    certifications: ['Organic', "Women's Cooperative", 'Fair Trade'],
    vanillin: '2.8%',
    moistureContent: '15.5%',
    harvestStory: "Each vanilla flower must be hand-pollinated at dawn and harvested at exactly the right moment 9 months later. This batch represents 6 months of patient curing.",
    sustainabilityScore: 9.6,
    carbonFootprint: "0.5 kg CO2e per kg",
    socialImpact: "Premium pricing supports vanilla farming knowledge transfer programs",
    reviews: [
      { rating: 5, comment: "The most complex vanilla I've ever worked with. Worth the premium price.", buyer: "Luxury Chocolate Manufacturer" }
    ]
  }
]

// Additional demo data
export const DEMO_TESTIMONIALS = [
  {
    name: "Chef Marcus Johnson",
    restaurant: "The Spice Route, London",
    message: "Spiced Platform has revolutionized how we source authentic spices. The provenance tracking gives us complete confidence in quality and origin.",
    rating: 5,
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=ranjan-review&backgroundColor=d4c5b9"
  },
  {
    name: "Sarah Chen",
    business: "Artisan Spice Co.",
    message: "Being able to see the farmer's story and verify authenticity has been game-changing for our business. Our customers love the transparency.",
    rating: 5,
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=kamala-review&backgroundColor=ffd5dc"
  },
  {
    name: "Dr. Raj Patel",
    specialty: "Ayurvedic Medicine",
    message: "The quality verification and traditional processing methods documented on this platform ensure we get medicinal-grade spices.",
    rating: 5,
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=mahesh-review&backgroundColor=a8e6cf"
  }
]

export const DEMO_STATS = {
  totalFarmers: 1247,
  totalProducts: 3891,
  verifiedBatches: 12456,
  avgFarmerIncome: 340, // % increase
  co2Saved: 2.4, // tons per month
  waterSaved: 1200, // liters per kg
  biodiversityScore: 8.7
}

// Quality grades explanation
export const QUALITY_GRADES = {
  'AAA': { description: 'Exceptional quality, perfect appearance, maximum flavor', color: 'text-purple-600' },
  'AA': { description: 'Premium quality, excellent appearance, superior flavor', color: 'text-blue-600' },
  'A+': { description: 'High quality, very good appearance, excellent flavor', color: 'text-green-600' },
  'A': { description: 'Good quality, good appearance, good flavor', color: 'text-yellow-600' },
  'B': { description: 'Standard quality, acceptable appearance, fair flavor', color: 'text-gray-600' }
}

// Spice processing methods
export const PROCESSING_METHODS = {
  'Traditional sun-drying': 'Dried naturally under controlled sunlight using traditional techniques',
  'Controlled low-temperature drying': 'Machine-dried at optimal temperatures to preserve essential oils',
  'Water-retting': 'Fermentation process using water to remove outer layers',
  'Blanching and sweating': 'Heat treatment followed by controlled moisture conditioning',
  'Hand-rolling': 'Manual processing to achieve optimal form and texture'
}

export default {
  DEMO_FARMERS,
  DEMO_PRODUCTS,
  DEMO_TESTIMONIALS,
  DEMO_STATS,
  QUALITY_GRADES,
  PROCESSING_METHODS
}