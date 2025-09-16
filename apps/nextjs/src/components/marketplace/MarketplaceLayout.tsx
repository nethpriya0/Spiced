import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Search, User, Shield, Award } from 'lucide-react'

interface MarketplaceLayoutProps {
  children: React.ReactNode
}

export const MarketplaceLayout: React.FC<MarketplaceLayoutProps> = ({ children }) => {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/marketplace" className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-600 to-yellow-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <div>
                  <div className="font-bold text-gray-900">Spiced</div>
                  <div className="text-xs text-gray-500 -mt-1">Marketplace</div>
                </div>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                href="/marketplace"
                className={`text-sm font-medium transition-colors ${
                  router.pathname === '/marketplace' 
                    ? 'text-orange-600' 
                    : 'text-gray-700 hover:text-orange-600'
                }`}
              >
                Browse Spices
              </Link>
              <Link 
                href="/marketplace/farmers"
                className={`text-sm font-medium transition-colors ${
                  router.pathname.startsWith('/marketplace/farmers')
                    ? 'text-orange-600' 
                    : 'text-gray-700 hover:text-orange-600'
                }`}
              >
                Our Farmers
              </Link>
              <Link 
                href="/about"
                className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
              >
                How It Works
              </Link>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Trust Indicators */}
              <div className="hidden lg:flex items-center space-x-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3 text-green-600" />
                  <span>Blockchain Verified</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="h-3 w-3 text-blue-600" />
                  <span>Authentic Sri Lankan</span>
                </div>
              </div>

              {/* Login Options */}
              <div className="flex items-center space-x-2">
                {/* Buyer Login */}
                <Link
                  href="/login?role=buyer"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Login to Buy</span>
                  <span className="sm:hidden">Buy</span>
                </Link>

                {/* Farmer Portal */}
                <Link
                  href="/login?role=farmer"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Farmer Portal</span>
                  <span className="sm:hidden">Sell</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-around py-3">
              <Link 
                href="/marketplace"
                className={`flex flex-col items-center gap-1 text-xs ${
                  router.pathname === '/marketplace' 
                    ? 'text-orange-600' 
                    : 'text-gray-600'
                }`}
              >
                <Search className="h-5 w-5" />
                Browse
              </Link>
              <Link 
                href="/marketplace/farmers"
                className={`flex flex-col items-center gap-1 text-xs ${
                  router.pathname.startsWith('/marketplace/farmers')
                    ? 'text-orange-600' 
                    : 'text-gray-600'
                }`}
              >
                <User className="h-5 w-5" />
                Farmers
              </Link>
              <Link 
                href="/about"
                className="flex flex-col items-center gap-1 text-xs text-gray-600"
              >
                <Shield className="h-5 w-5" />
                About
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <Link href="/marketplace" className="flex items-center mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-600 to-yellow-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">S</span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Spiced Marketplace</div>
                    <div className="text-xs text-gray-500 -mt-1">Authentic Sri Lankan Spices</div>
                  </div>
                </div>
              </Link>
              <p className="text-gray-600 text-sm max-w-md">
                Discover authentic Sri Lankan spices with complete blockchain-verified provenance. 
                Every product comes with a digital passport tracking its journey from farm to market.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Marketplace</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/marketplace" className="text-gray-600 hover:text-orange-600">Browse Products</Link></li>
                <li><Link href="/marketplace/farmers" className="text-gray-600 hover:text-orange-600">Our Farmers</Link></li>
                <li><Link href="/about" className="text-gray-600 hover:text-orange-600">How It Works</Link></li>
                <li><Link href="/login?role=farmer" className="text-gray-600 hover:text-orange-600">Farmer Portal</Link></li>
              </ul>
            </div>

            {/* Trust & Security */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Trust & Quality</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-gray-600">
                  <Shield className="h-4 w-4 text-green-600" />
                  Blockchain Verified
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <Award className="h-4 w-4 text-blue-600" />
                  Sri Lankan Authentic
                </li>
                <li><Link href="/verification" className="text-gray-600 hover:text-orange-600">Verification Process</Link></li>
                <li><Link href="/quality" className="text-gray-600 hover:text-orange-600">Quality Standards</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <p className="text-gray-500 text-sm">
                © 2024 Spiced Marketplace. All rights reserved.
              </p>
              <div className="mt-4 sm:mt-0 flex items-center space-x-6 text-sm">
                <Link href="/privacy" className="text-gray-500 hover:text-orange-600">Privacy Policy</Link>
                <Link href="/terms" className="text-gray-500 hover:text-orange-600">Terms of Service</Link>
                <Link href="/contact" className="text-gray-500 hover:text-orange-600">Contact</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default MarketplaceLayout