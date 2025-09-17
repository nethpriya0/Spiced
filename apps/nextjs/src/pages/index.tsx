import Head from "next/head";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Shield } from "lucide-react";
import { Users } from "lucide-react";
import { Leaf } from "lucide-react";
import { ShoppingCart } from "lucide-react";
import { CheckCircle } from "lucide-react";
import { Star } from "lucide-react";
import { Globe } from "lucide-react";
import { TrendingUp } from "lucide-react";
import { MapPin } from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: Shield,
      title: "Blockchain Verified",
      description: "Every spice batch tracked from farm to table with immutable blockchain records"
    },
    {
      icon: Globe,
      title: "Global Marketplace",
      description: "Connect Sri Lankan farmers directly with international buyers"
    },
    {
      icon: TrendingUp,
      title: "Fair Pricing",
      description: "Transparent pricing ensures farmers get fair value for premium spices"
    },
    {
      icon: Users,
      title: "Verified Community",
      description: "KYC-verified farmers and buyers in a trusted ecosystem"
    }
  ];

  const stats = [
    { label: "Verified Farmers", value: "150+" },
    { label: "Countries Served", value: "25+" },
    { label: "Spice Varieties", value: "50+" },
    { label: "Quality Score", value: "98%" }
  ];

  const spiceCategories = [
    { name: "Ceylon Cinnamon", description: "World's finest true cinnamon", image: "🌿" },
    { name: "Black Pepper", description: "Premium Malabar variety", image: "⚫" },
    { name: "Cardamom", description: "Aromatic green pods", image: "💚" },
    { name: "Cloves", description: "Hand-picked quality", image: "🌸" }
  ];

  return (
    <>
      <Head>
        <title>Spiced - Transparent Spice Marketplace | Blockchain-Verified Sri Lankan Spices</title>
        <meta name="description" content="Connect directly with verified Sri Lankan spice farmers. Blockchain-transparent supply chain, fair prices, premium quality spices delivered globally." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 via-white to-amber-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                  Premium
                  <span className="text-green-600"> Sri Lankan Spices</span>
                  <br />
                  <span className="text-amber-600">Direct from Farm</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Experience the authentic taste of Ceylon spices with complete blockchain transparency.
                  Connect directly with verified farmers and trace your spices from garden to table.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-green-600 hover:bg-green-700" asChild>
                  <Link href="/marketplace">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Browse Marketplace
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/farmers">
                    <Leaf className="w-5 h-5 mr-2" />
                    I'm a Farmer
                  </Link>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">Blockchain Verified</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">Quality Guaranteed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">Sri Lankan Origin</span>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {spiceCategories.map((spice, index) => (
                  <Card key={spice.name} className={`transform transition-all duration-300 hover:scale-105 ${index % 2 === 0 ? 'translate-y-4' : ''}`}>
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-3">{spice.image}</div>
                      <h3 className="font-semibold text-gray-900">{spice.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{spice.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Spiced?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're revolutionizing the spice trade with blockchain technology,
              ensuring transparency, quality, and fair compensation for farmers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Experience Authentic Ceylon Spices?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust our blockchain-verified spices
            for their culinary adventures.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100" asChild>
              <Link href="/marketplace">
                Start Shopping
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
              <Link href="/get-started">
                Join as Farmer
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Spiced</span>
              </div>
              <p className="text-gray-400">
                Connecting Sri Lankan spice farmers with the world through blockchain transparency.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Marketplace</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/marketplace" className="hover:text-white transition-colors">Browse Spices</Link></li>
                <li><Link href="/farmers" className="hover:text-white transition-colors">Meet Farmers</Link></li>
                <li><Link href="/quality" className="hover:text-white transition-colors">Quality Promise</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">For Farmers</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/farmers/join" className="hover:text-white transition-colors">Join Platform</Link></li>
                <li><Link href="/farmers/verification" className="hover:text-white transition-colors">Get Verified</Link></li>
                <li><Link href="/farmers/resources" className="hover:text-white transition-colors">Resources</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Spiced Platform. All rights reserved. Built on blockchain for transparency.</p>
          </div>
        </div>
      </footer>
    </>
  );
}