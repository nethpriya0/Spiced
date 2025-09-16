import Head from "next/head";
import Link from "next/link";
import { 
  Shield, 
  Users, 
  Leaf, 
  ShoppingCart, 
  CheckCircle,
  ArrowRight,
  Star,
  Globe,
  Lock,
  Zap
} from "lucide-react";
import { StatsShowcase } from "@/components/landing/StatsShowcase";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";

export default function Home() {
  return (
    <>
      <Head>
        <title>Spiced - Transparent Spice Marketplace</title>
        <meta name="description" content="Decentralized marketplace connecting Sri Lankan spice farmers directly with global buyers through blockchain transparency" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {/* Enhanced Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-white/20 shadow-soft z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3 group">
              <div className="relative">
                <Leaf className="h-8 w-8 text-primary-600 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
                <div className="absolute inset-0 h-8 w-8 text-primary-600 opacity-0 group-hover:opacity-30 animate-pulse"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Spiced
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#how-it-works" className="relative text-gray-600 hover:text-primary-600 transition-all duration-200 group">
                How It Works
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link href="/marketplace" className="relative text-gray-600 hover:text-primary-600 transition-all duration-200 group">
                Marketplace
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link href="/community" className="relative text-gray-600 hover:text-primary-600 transition-all duration-200 group">
                Community
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link href="/login" className="relative bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-medium hover:shadow-glow-green transition-all duration-300 hover:scale-105 group overflow-hidden">
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {/* Enhanced Hero Section */}
        <section className="relative min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20 overflow-hidden flex items-center">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-200/20 rounded-full blur-3xl animate-float"></div>
            <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-secondary-200/20 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-1/2 left-3/4 w-48 h-48 bg-primary-300/30 rounded-full blur-2xl animate-pulse-soft"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center">
              {/* Enhanced Title */}
              <div className="mb-8">
                <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-6 animate-fade-in-up leading-tight">
                  <span className="bg-gradient-to-r from-gray-900 via-primary-800 to-gray-900 bg-clip-text text-transparent block mb-2">
                    Transparent
                  </span>
                  <span className="bg-gradient-to-r from-secondary-600 via-primary-600 to-secondary-700 bg-clip-text text-transparent animate-shimmer bg-300% bg-shimmer block">
                    Spice Marketplace
                  </span>
                </h1>
                
                {/* Floating Icons */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8">
                  <div className="flex gap-8">
                    <div className="animate-float" style={{animationDelay: '0s'}}>
                      <Leaf className="h-8 w-8 text-primary-500/40" />
                    </div>
                    <div className="animate-float" style={{animationDelay: '0.5s'}}>
                      <Shield className="h-6 w-6 text-secondary-500/40" />
                    </div>
                    <div className="animate-float" style={{animationDelay: '1s'}}>
                      <Globe className="h-7 w-7 text-primary-400/40" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Subtitle */}
              <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                Connecting Sri Lankan spice farmers directly with global buyers through 
                <span className="font-semibold text-primary-700"> blockchain-verified provenance</span> and 
                <span className="font-semibold text-secondary-700"> fair trade practices</span>.
              </p>

              {/* Enhanced CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                <Link
                  href="/marketplace"
                  className="group relative bg-gradient-to-r from-primary-600 to-primary-700 text-white px-10 py-5 rounded-2xl text-lg font-bold shadow-large hover:shadow-glow-green transition-all duration-300 hover:scale-105 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    <ShoppingCart className="h-6 w-6 transition-transform group-hover:scale-110" />
                    Browse Marketplace
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
                </Link>

                <Link
                  href="/login?role=farmer&register=true"
                  className="group relative border-2 border-primary-600 text-primary-700 bg-white/80 backdrop-blur-sm px-10 py-5 rounded-2xl text-lg font-bold shadow-medium hover:shadow-large transition-all duration-300 hover:scale-105 hover:bg-primary-600 hover:text-white overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    <Users className="h-6 w-6 transition-transform group-hover:scale-110" />
                    Join as Farmer
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in-up" style={{animationDelay: '0.6s'}}>
                <div className="text-center group">
                  <div className="text-3xl font-bold text-primary-600 group-hover:scale-110 transition-transform">1,247+</div>
                  <div className="text-sm text-gray-500 mt-1">Verified Farmers</div>
                </div>
                <div className="text-center group">
                  <div className="text-3xl font-bold text-secondary-600 group-hover:scale-110 transition-transform">12,456+</div>
                  <div className="text-sm text-gray-500 mt-1">Products Verified</div>
                </div>
                <div className="text-center group">
                  <div className="text-3xl font-bold text-primary-600 group-hover:scale-110 transition-transform">45+</div>
                  <div className="text-sm text-gray-500 mt-1">Countries Served</div>
                </div>
                <div className="text-center group">
                  <div className="text-3xl font-bold text-secondary-600 group-hover:scale-110 transition-transform">99.8%</div>
                  <div className="text-sm text-gray-500 mt-1">Trust Score</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-gentle">
            <div className="w-6 h-10 border-2 border-primary-400 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-primary-400 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </section>

        {/* Enhanced How It Works Section */}
        <section id="how-it-works" className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(45, 106, 79, 0.3) 2px, transparent 0)',
              backgroundSize: '50px 50px'
            }}></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary-800 to-secondary-700 bg-clip-text text-transparent mb-6">
                How Spiced Works
              </h2>
              <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                A simple, transparent process that ensures quality, fairness, and trust from 
                <span className="text-primary-600 font-semibold"> farm to table</span>
              </p>
              
              {/* Decorative Line */}
              <div className="flex justify-center mt-8">
                <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"></div>
              </div>
            </div>

            {/* Enhanced Process Steps */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20 relative">
              {/* Connection Lines */}
              <div className="hidden lg:block absolute top-24 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-primary-200 via-secondary-200 to-primary-200"></div>
              <div className="hidden lg:block absolute top-24 left-1/3 w-4 h-4 bg-primary-400 rounded-full transform -translate-x-2"></div>
              <div className="hidden lg:block absolute top-24 right-1/3 w-4 h-4 bg-secondary-400 rounded-full transform translate-x-2"></div>
              {/* Step 1: Farmers Create */}
              <div className="group relative bg-gradient-to-br from-primary-50 to-primary-100 rounded-3xl p-8 text-center shadow-soft hover:shadow-large transition-all duration-500 hover:scale-105 border border-primary-200/50">
                {/* Step Number */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-medium">
                  1
                </div>
                
                <div className="relative w-20 h-20 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-6 transition-transform duration-300 shadow-glow-green">
                  <Leaf className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary-700 transition-colors">Farmers Create</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Sri Lankan farmers create digital passports for their spice harvests, documenting every step from planting to processing with photos and certifications.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-primary-700 group-hover:translate-x-1 transition-transform">
                    <CheckCircle className="h-5 w-5 text-primary-500" />
                    <span className="font-medium">Upload harvest photos</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-primary-700 group-hover:translate-x-1 transition-transform" style={{transitionDelay: '0.1s'}}>
                    <CheckCircle className="h-5 w-5 text-primary-500" />
                    <span className="font-medium">Document processing steps</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-primary-700 group-hover:translate-x-1 transition-transform" style={{transitionDelay: '0.2s'}}>
                    <CheckCircle className="h-5 w-5 text-primary-500" />
                    <span className="font-medium">Seal on blockchain</span>
                  </div>
                </div>
              </div>

              {/* Step 2: Buyers Discover */}
              <div className="group relative bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-3xl p-8 text-center shadow-soft hover:shadow-large transition-all duration-500 hover:scale-105 border border-secondary-200/50">
                {/* Step Number */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-secondary-600 to-secondary-700 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-medium">
                  2
                </div>
                
                <div className="relative w-20 h-20 bg-gradient-to-r from-secondary-600 to-secondary-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-6 transition-transform duration-300 shadow-glow-orange">
                  <ShoppingCart className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-secondary-700 transition-colors">Buyers Discover</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Global buyers browse authentic spices with complete transparency - view photos, verify blockchain records, and read farmer stories.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-secondary-700 group-hover:translate-x-1 transition-transform">
                    <CheckCircle className="h-5 w-5 text-secondary-500" />
                    <span className="font-medium">Browse verified products</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-secondary-700 group-hover:translate-x-1 transition-transform" style={{transitionDelay: '0.1s'}}>
                    <CheckCircle className="h-5 w-5 text-secondary-500" />
                    <span className="font-medium">View complete provenance</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-secondary-700 group-hover:translate-x-1 transition-transform" style={{transitionDelay: '0.2s'}}>
                    <CheckCircle className="h-5 w-5 text-secondary-500" />
                    <span className="font-medium">Scan QR codes</span>
                  </div>
                </div>
              </div>

              {/* Step 3: Secure Trade */}
              <div className="group relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8 text-center shadow-soft hover:shadow-large transition-all duration-500 hover:scale-105 border border-blue-200/50">
                {/* Step Number */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-medium">
                  3
                </div>
                
                <div className="relative w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-6 transition-transform duration-300 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors">Secure Trade</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Smart contracts protect both parties - funds held in escrow until delivery confirmed, with community dispute resolution.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-blue-700 group-hover:translate-x-1 transition-transform">
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Escrow protection</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-blue-700 group-hover:translate-x-1 transition-transform" style={{transitionDelay: '0.1s'}}>
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Community arbitration</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-blue-700 group-hover:translate-x-1 transition-transform" style={{transitionDelay: '0.2s'}}>
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Fair trade guaranteed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-6">
                <Globe className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Global Reach</h4>
                <p className="text-sm text-gray-600">Connect farmers directly with international buyers</p>
              </div>
              <div className="text-center p-6">
                <Lock className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Zero-Knowledge Proofs</h4>
                <p className="text-sm text-gray-600">Verify credentials without revealing sensitive data</p>
              </div>
              <div className="text-center p-6">
                <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Instant Verification</h4>
                <p className="text-sm text-gray-600">QR codes link physical products to digital records</p>
              </div>
              <div className="text-center p-6">
                <Star className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Community Driven</h4>
                <p className="text-sm text-gray-600">Forum discussions and peer-to-peer learning</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <StatsShowcase />

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-orange-600 to-green-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
              Join thousands of farmers and buyers creating a more transparent, fair spice trade ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/marketplace"
                className="bg-white text-orange-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-orange-50 transition-colors flex items-center gap-2 justify-center"
              >
                Explore Marketplace
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/community"
                className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors flex items-center gap-2 justify-center"
              >
                Join Community
                <Users className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="h-8 w-8 text-orange-600" />
                <span className="text-2xl font-bold">Spiced</span>
              </div>
              <p className="text-gray-300 mb-4">
                Empowering Sri Lankan spice farmers through blockchain transparency and direct global trade connections.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <div className="space-y-2">
                <Link href="/marketplace" className="block text-gray-300 hover:text-white">Marketplace</Link>
                <Link href="/community" className="block text-gray-300 hover:text-white">Community</Link>
                <Link href="/credentials" className="block text-gray-300 hover:text-white">Credentials</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2">
                <Link href="#" className="block text-gray-300 hover:text-white">Help Center</Link>
                <Link href="#" className="block text-gray-300 hover:text-white">Contact</Link>
                <Link href="#" className="block text-gray-300 hover:text-white">Documentation</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Spiced Platform. Built with transparency and trust.</p>
          </div>
        </div>
      </footer>
    </>
  );
}