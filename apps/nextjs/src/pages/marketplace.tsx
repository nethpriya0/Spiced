import { useState, useMemo, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAccount } from 'wagmi';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import WalletConnect from '@/components/WalletConnect';
import { ShoppingCartModal } from '@/components/marketplace/ShoppingCart';
import {
  Search,
  Filter,
  Star,
  MapPin,
  ShoppingCart,
  Leaf,
  Shield,
  TrendingUp,
  Eye,
  Heart,
  Share2,
  CreditCard
} from 'lucide-react';

interface SpiceProduct {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  unit: string;
  rating: number;
  reviews: number;
  farmer: {
    name: string;
    location: string;
    verified: boolean;
  };
  image: string;
  inStock: number;
  organic: boolean;
  featured: boolean;
  blockchain: {
    harvestDate: string;
    certifications: string[];
    traceabilityHash: string;
  };
}

export default function Marketplace() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const { connect } = router.query;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [showConnectModal, setShowConnectModal] = useState(!!connect);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [fairTradeOnly, setFairTradeOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [cart, setCart] = useState<{[key: string]: number}>({});
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);

  // Enhanced mock data with more realistic products
  const products: SpiceProduct[] = [
    {
      id: '1',
      name: 'Ceylon True Cinnamon',
      category: 'cinnamon',
      description: 'Premium grade Ceylon cinnamon with delicate sweet flavor, hand-harvested from Kandy highlands.',
      price: 24.99,
      unit: '100g',
      rating: 4.9,
      reviews: 127,
      farmer: {
        name: 'Ranjan Perera',
        location: 'Kandy, Sri Lanka',
        verified: true
      },
      image: '🌿',
      inStock: 45,
      organic: true,
      featured: true,
      blockchain: {
        harvestDate: '2024-08-15',
        certifications: ['Organic', 'Fair Trade', 'Quality Assured'],
        traceabilityHash: '0x1a2b3c...'
      }
    },
    {
      id: '2',
      name: 'Malabar Black Pepper',
      category: 'pepper',
      description: 'Bold and aromatic black pepper with strong piperine content, perfect for culinary excellence.',
      price: 32.50,
      unit: '250g',
      rating: 4.8,
      reviews: 89,
      farmer: {
        name: 'Kamala Wickramasinghe',
        location: 'Matale, Sri Lanka',
        verified: true
      },
      image: '⚫',
      inStock: 32,
      organic: true,
      featured: false,
      blockchain: {
        harvestDate: '2024-09-01',
        certifications: ['Organic', 'Single Estate'],
        traceabilityHash: '0x2b3c4d...'
      }
    },
    {
      id: '3',
      name: 'Green Cardamom Pods',
      category: 'cardamom',
      description: 'Aromatic green cardamom pods with intense flavor, ideal for both sweet and savory dishes.',
      price: 45.00,
      unit: '100g',
      rating: 4.7,
      reviews: 203,
      farmer: {
        name: 'Mahesh Silva',
        location: 'Ella, Sri Lanka',
        verified: true
      },
      image: '💚',
      inStock: 28,
      organic: false,
      featured: true,
      blockchain: {
        harvestDate: '2024-08-20',
        certifications: ['Quality Assured', 'Single Origin'],
        traceabilityHash: '0x3c4d5e...'
      }
    },
    {
      id: '4',
      name: 'Whole Cloves',
      category: 'cloves',
      description: 'Hand-picked whole cloves with rich aroma and natural oils intact.',
      price: 18.75,
      unit: '50g',
      rating: 4.6,
      reviews: 156,
      farmer: {
        name: 'Priya Rajapakse',
        location: 'Galle, Sri Lanka',
        verified: true
      },
      image: '🌸',
      inStock: 67,
      organic: true,
      featured: false,
      blockchain: {
        harvestDate: '2024-09-05',
        certifications: ['Organic', 'Fair Trade'],
        traceabilityHash: '0x4d5e6f...'
      }
    },
    {
      id: '5',
      name: 'Vanilla Beans',
      category: 'vanilla',
      description: 'Premium Madagascar vanilla beans with intense aroma and complex flavor profile.',
      price: 89.99,
      unit: '10 beans',
      rating: 4.9,
      reviews: 342,
      farmer: {
        name: 'Arjuna Fernando',
        location: 'Kegalle, Sri Lanka',
        verified: true
      },
      image: '🌺',
      inStock: 15,
      organic: true,
      featured: true,
      blockchain: {
        harvestDate: '2024-08-10',
        certifications: ['Organic', 'Premium Grade', 'Single Estate'],
        traceabilityHash: '0x5e6f7g...'
      }
    },
    {
      id: '6',
      name: 'Turmeric Powder',
      category: 'turmeric',
      description: 'Golden turmeric powder with high curcumin content, perfect for health and cooking.',
      price: 12.50,
      unit: '200g',
      rating: 4.5,
      reviews: 98,
      farmer: {
        name: 'Chandrika Mendis',
        location: 'Kurunegala, Sri Lanka',
        verified: true
      },
      image: '🟡',
      inStock: 89,
      organic: false,
      featured: false,
      blockchain: {
        harvestDate: '2024-09-10',
        certifications: ['Quality Assured', 'Lab Tested'],
        traceabilityHash: '0x6f7g8h...'
      }
    },
    {
      id: '7',
      name: 'Star Anise',
      category: 'anise',
      description: 'Whole star anise with distinctive licorice flavor, perfect for teas and curries.',
      price: 28.00,
      unit: '100g',
      rating: 4.4,
      reviews: 67,
      farmer: {
        name: 'Nuwan Pathirana',
        location: 'Ratnapura, Sri Lanka',
        verified: true
      },
      image: '⭐',
      inStock: 41,
      organic: true,
      featured: false,
      blockchain: {
        harvestDate: '2024-08-25',
        certifications: ['Organic', 'Wild Harvested'],
        traceabilityHash: '0x7g8h9i...'
      }
    },
    {
      id: '8',
      name: 'Nutmeg Whole',
      category: 'nutmeg',
      description: 'Aromatic whole nutmeg with warming spice notes, freshly harvested.',
      price: 35.75,
      unit: '75g',
      rating: 4.7,
      reviews: 134,
      farmer: {
        name: 'Saman Wijesinghe',
        location: 'Matara, Sri Lanka',
        verified: true
      },
      image: '🥜',
      inStock: 23,
      organic: false,
      featured: true,
      blockchain: {
        harvestDate: '2024-09-02',
        certifications: ['Premium Grade', 'Single Origin'],
        traceabilityHash: '0x8h9i0j...'
      }
    }
  ];

  const categories = [
    { id: 'all', name: 'All Spices', count: products.length },
    { id: 'cinnamon', name: 'Cinnamon', count: products.filter(p => p.category === 'cinnamon').length },
    { id: 'pepper', name: 'Pepper', count: products.filter(p => p.category === 'pepper').length },
    { id: 'cardamom', name: 'Cardamom', count: products.filter(p => p.category === 'cardamom').length },
    { id: 'cloves', name: 'Cloves', count: products.filter(p => p.category === 'cloves').length },
    { id: 'vanilla', name: 'Vanilla', count: products.filter(p => p.category === 'vanilla').length },
    { id: 'turmeric', name: 'Turmeric', count: products.filter(p => p.category === 'turmeric').length },
    { id: 'anise', name: 'Star Anise', count: products.filter(p => p.category === 'anise').length },
    { id: 'nutmeg', name: 'Nutmeg', count: products.filter(p => p.category === 'nutmeg').length }
  ];

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.farmer.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesOrganic = !organicOnly || product.organic;
      const matchesFairTrade = !fairTradeOnly || product.blockchain.certifications.some(cert =>
        cert.toLowerCase().includes('fair trade'));
      const matchesInStock = !inStockOnly || product.inStock > 0;
      const matchesFeatured = !featuredOnly || product.featured;

      return matchesSearch && matchesCategory && matchesPrice && matchesOrganic &&
             matchesFairTrade && matchesInStock && matchesFeatured;
    });

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.blockchain.harvestDate).getTime() - new Date(a.blockchain.harvestDate).getTime());
        break;
      case 'featured':
      default:
        filtered.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return b.rating - a.rating;
        });
    }

    return filtered;
  }, [products, searchTerm, selectedCategory, priceRange, organicOnly, fairTradeOnly, inStockOnly, featuredOnly, sortBy]);

  const handleAddToCart = (product: SpiceProduct) => {
    if (!isConnected) {
      setShowConnectModal(true);
      return;
    }
    setCart(prev => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + 1
    }));
  };

  const toggleFavorite = (productId: string) => {
    setFavorites(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const getTotalCartItems = () => {
    return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  };

  const getTotalCartValue = () => {
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return total + (product ? product.price * quantity : 0);
    }, 0);
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => {
        const newCart = { ...prev };
        delete newCart[productId];
        return newCart;
      });
    } else {
      setCart(prev => ({
        ...prev,
        [productId]: quantity
      }));
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      delete newCart[productId];
      return newCart;
    });
  };

  const handleCheckout = () => {
    console.log('Checkout:', cart);
    alert('Checkout successful! (Demo)');
    setCart({});
  };

  const handleViewDetails = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  const handleBuyNow = (product: SpiceProduct) => {
    if (!isConnected) {
      setShowConnectModal(true);
      return;
    }

    // Add item to cart temporarily for buy now
    const tempCart = { [product.id]: 1 };
    const totalValue = product.price;
    const shipping = totalValue > 50 ? 0 : 9.99;
    const finalTotal = totalValue + shipping;

    // Show immediate purchase confirmation
    const confirmPurchase = confirm(
      `Buy Now: ${product.name}\n` +
      `Price: $${product.price}\n` +
      `Shipping: ${shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2)}\n` +
      `Total: $${finalTotal.toFixed(2)}\n\n` +
      `Proceed with purchase?`
    );

    if (confirmPurchase) {
      // Simulate immediate purchase
      alert(`Purchase successful! 🎉\n\nYour ${product.name} has been ordered and will be shipped directly from ${product.farmer.name} in ${product.farmer.location}.\n\nOrder ID: SP-${Date.now()}\nBlockchain Receipt: 0x${Math.random().toString(16).slice(2, 10)}...`);
    }
  };

  return (
    <>
      <Head>
        <title>Marketplace - Spiced Platform | Premium Ceylon Spices</title>
        <meta name="description" content="Browse premium Ceylon spices directly from verified farmers. Blockchain-verified quality, fair prices, global shipping." />
      </Head>

      <Header />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Banner */}
        <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Premium Ceylon Spices Marketplace
              </h1>
              <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
                Discover authentic Sri Lankan spices with complete blockchain traceability.
                Every purchase supports verified farmers directly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full">
                  <Shield className="w-5 h-5" />
                  <span>Blockchain Verified</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full">
                  <Leaf className="w-5 h-5" />
                  <span>Direct from Farmers</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full">
                  <TrendingUp className="w-5 h-5" />
                  <span>Fair Trade Pricing</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-4 gap-8">

            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Filter className="w-5 h-5" />
                    <span>Filters</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">

                  {/* Search */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Search</label>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search spices..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Categories */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Categories</label>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            selectedCategory === category.id
                              ? 'bg-green-100 text-green-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span>{category.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {category.count}
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-3 block">
                      Price Range: ${priceRange[0]} - ${priceRange[1]}
                    </label>
                    <div className="space-y-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 100])}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Filters */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Quick Filters</label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          className="rounded"
                          checked={organicOnly}
                          onChange={(e) => setOrganicOnly(e.target.checked)}
                        />
                        <span className="text-sm">Organic Only</span>
                        <Badge variant="secondary" className="text-xs ml-auto">
                          {products.filter(p => p.organic).length}
                        </Badge>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          className="rounded"
                          checked={fairTradeOnly}
                          onChange={(e) => setFairTradeOnly(e.target.checked)}
                        />
                        <span className="text-sm">Fair Trade</span>
                        <Badge variant="secondary" className="text-xs ml-auto">
                          {products.filter(p => p.blockchain.certifications.some(cert => cert.toLowerCase().includes('fair trade'))).length}
                        </Badge>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          className="rounded"
                          checked={inStockOnly}
                          onChange={(e) => setInStockOnly(e.target.checked)}
                        />
                        <span className="text-sm">In Stock</span>
                        <Badge variant="secondary" className="text-xs ml-auto">
                          {products.filter(p => p.inStock > 0).length}
                        </Badge>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          className="rounded"
                          checked={featuredOnly}
                          onChange={(e) => setFeaturedOnly(e.target.checked)}
                        />
                        <span className="text-sm">Featured</span>
                        <Badge variant="secondary" className="text-xs ml-auto">
                          {products.filter(p => p.featured).length}
                        </Badge>
                      </label>
                    </div>
                  </div>

                  {/* Clear Filters */}
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('all');
                        setOrganicOnly(false);
                        setFairTradeOnly(false);
                        setInStockOnly(false);
                        setFeaturedOnly(false);
                        setPriceRange([0, 100]);
                        setSortBy('featured');
                      }}
                    >
                      Clear All Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">

              {/* Results Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {filteredProducts.length} Spices Found
                  </h2>
                  <p className="text-gray-600">
                    Showing {selectedCategory === 'all' ? 'all categories' : categories.find(c => c.id === selectedCategory)?.name}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  {getTotalCartItems() > 0 && (
                    <button
                      onClick={() => setShowCartModal(true)}
                      className="flex items-center space-x-2 bg-green-100 hover:bg-green-200 px-4 py-2 rounded-full text-sm transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-800">
                        {getTotalCartItems()} items • ${getTotalCartValue().toFixed(2)}
                      </span>
                    </button>
                  )}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Sort by:</span>
                    <select
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="featured">Featured</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Rating</option>
                      <option value="newest">Newest</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="group hover:shadow-lg transition-all duration-300">
                    <CardHeader className="relative">
                      {product.featured && (
                        <Badge className="absolute top-2 left-2 bg-amber-500">
                          Featured
                        </Badge>
                      )}
                      <div className="text-6xl text-center mb-4">{product.image}</div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex space-x-1">
                          <button
                            className={`p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors ${
                              favorites.includes(product.id) ? 'text-red-500' : 'text-gray-600'
                            }`}
                            onClick={() => toggleFavorite(product.id)}
                          >
                            <Heart className={`w-4 h-4 ${
                              favorites.includes(product.id) ? 'fill-current' : ''
                            }`} />
                          </button>
                          <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                            <Share2 className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">{product.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                      </div>

                      {/* Farmer Info */}
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Leaf className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-1">
                            <span className="font-medium text-gray-900">{product.farmer.name}</span>
                            {product.farmer.verified && (
                              <Shield className="w-3 h-3 text-green-500" />
                            )}
                          </div>
                          <div className="flex items-center space-x-1 text-gray-600">
                            <MapPin className="w-3 h-3" />
                            <span className="text-xs">{product.farmer.location}</span>
                          </div>
                        </div>
                      </div>

                      {/* Rating & Price */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium">{product.rating}</span>
                          </div>
                          <span className="text-xs text-gray-500">({product.reviews})</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-900">${product.price}</div>
                          <div className="text-xs text-gray-500">per {product.unit}</div>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-1">
                        {product.organic && (
                          <Badge variant="secondary" className="text-xs">Organic</Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {product.inStock} in stock
                        </Badge>
                        {product.blockchain.certifications.slice(0, 2).map((cert) => (
                          <Badge key={cert} variant="outline" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2 pt-2">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleViewDetails(product.id)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Details
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleAddToCart(product)}
                            disabled={product.inStock === 0}
                          >
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            {product.inStock === 0 ? 'Out of Stock' :
                             cart[product.id] ? `Add More (${cart[product.id]})` : 'Add to Cart'}
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleBuyNow(product)}
                          disabled={product.inStock === 0}
                        >
                          <CreditCard className="w-4 h-4 mr-1" />
                          Buy Now - ${product.price}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Empty State */}
              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No spices found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search or filter criteria
                  </p>
                  <Button onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setOrganicOnly(false);
                    setFairTradeOnly(false);
                    setInStockOnly(false);
                    setFeaturedOnly(false);
                    setPriceRange([0, 100]);
                    setSortBy('featured');
                  }}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Connect Wallet Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Connect Your Wallet</h3>
              <p className="text-gray-600">
                Connect your wallet to purchase spices and track them on the blockchain.
              </p>
            </div>
            <WalletConnect
              onConnectionChange={(connected) => {
                if (connected) {
                  setShowConnectModal(false);
                }
              }}
            />
            <Button
              variant="ghost"
              className="w-full mt-4"
              onClick={() => setShowConnectModal(false)}
            >
              Browse without connecting
            </Button>
          </div>
        </div>
      )}

      {/* Shopping Cart Modal */}
      <ShoppingCartModal
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
        cart={cart}
        products={products}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
      />
    </>
  );
}