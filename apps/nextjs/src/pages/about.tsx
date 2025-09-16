import Head from "next/head"
import Link from "next/link"
import { ArrowLeft, Users, Globe, Shield, Leaf } from "lucide-react"

export default function About() {
  return (
    <>
      <Head>
        <title>About Us - Spiced Platform</title>
        <meta name="description" content="Learn about the Spiced platform, our mission to connect Sri Lankan spice farmers with global markets through blockchain technology." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center gap-2 text-spice-green hover:text-spice-green-dark transition-colors">
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Back to Home</span>
              </Link>
              <div className="flex items-center gap-3">
                <Leaf className="h-6 w-6 text-spice-green" />
                <span className="text-xl font-bold text-gray-900">Spiced</span>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Connecting Farmers, 
              <span className="bg-gradient-to-r from-spice-green to-spice-cinnamon bg-clip-text text-transparent"> Transforming Trade</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Spiced is a revolutionary blockchain-powered platform that connects Sri Lankan spice farmers 
              directly with global buyers, ensuring transparency, fair pricing, and authentic provenance.
            </p>
          </div>

          {/* Mission Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white rounded-xl p-8 shadow-soft border border-gray-100">
              <div className="h-12 w-12 bg-gradient-to-br from-spice-green/10 to-spice-green/20 rounded-xl flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-spice-green" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Empowering Farmers</h3>
              <p className="text-gray-600">
                We provide Sri Lankan spice farmers with tools to create verifiable digital passports 
                for their products, ensuring they receive fair compensation for their quality produce.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-soft border border-gray-100">
              <div className="h-12 w-12 bg-gradient-to-br from-spice-cinnamon/10 to-spice-cinnamon/20 rounded-xl flex items-center justify-center mb-6">
                <Globe className="h-6 w-6 text-spice-cinnamon" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Global Marketplace</h3>
              <p className="text-gray-600">
                Our platform connects local farmers with international buyers, eliminating middlemen 
                and ensuring authentic, traceable spices reach global markets.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-soft border border-gray-100">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-500/10 to-blue-500/20 rounded-xl flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Blockchain Security</h3>
              <p className="text-gray-600">
                Using advanced blockchain technology, we ensure every transaction is secure, 
                transparent, and immutable, building trust throughout the supply chain.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-soft border border-gray-100">
              <div className="h-12 w-12 bg-gradient-to-br from-green-500/10 to-green-500/20 rounded-xl flex items-center justify-center mb-6">
                <Leaf className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Sustainable Practices</h3>
              <p className="text-gray-600">
                We promote sustainable farming practices and environmental responsibility, 
                supporting the long-term health of Sri Lanka&apos;s agricultural ecosystem.
              </p>
            </div>
          </div>

          {/* Story Section */}
          <div className="bg-gradient-to-r from-spice-green/5 to-spice-cinnamon/5 rounded-2xl p-8 md:p-12 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Story</h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="mb-6">
                Sri Lanka has been renowned for its exceptional spices for over 2,000 years. From the aromatic 
                Ceylon cinnamon to the potent black pepper, these spices have shaped global cuisine and trade. 
                However, traditional supply chains have often left farmers with unfair compensation and buyers 
                uncertain about product authenticity.
              </p>
              <p className="mb-6">
                Spiced was born from a vision to revolutionize this ancient trade. By leveraging blockchain 
                technology and digital innovation, we&apos;re creating a transparent, fair, and efficient marketplace 
                that benefits everyone in the supply chain.
              </p>
              <p>
                Today, farmers can showcase their products with complete transparency, buyers can verify 
                authenticity and provenance, and consumers worldwide can enjoy authentic Sri Lankan spices 
                while knowing their purchase supports sustainable farming communities.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Join the Revolution?</h2>
            <p className="text-gray-600 mb-8">
              Whether you&apos;re a farmer looking to showcase your spices or a buyer seeking authentic products, 
              Spiced is here to transform your experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/login" 
                className="bg-gradient-to-r from-spice-green to-spice-green-dark text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Get Started
              </Link>
              <Link 
                href="/marketplace" 
                className="border-2 border-spice-green text-spice-green px-8 py-3 rounded-xl font-semibold hover:bg-spice-green hover:text-white transition-all duration-300"
              >
                Explore Marketplace
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}