import Head from 'next/head';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Leaf,
  TrendingUp,
  Shield,
  Globe,
  Users,
  CheckCircle,
  ArrowRight,
  Star,
  MapPin,
  Award
} from 'lucide-react';

export default function FarmersPage() {
  const benefits = [
    {
      icon: TrendingUp,
      title: 'Fair Pricing',
      description: 'Eliminate middlemen and get 40-60% more for your spices through direct sales to global buyers.'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Access international markets from North America to Europe with our worldwide shipping network.'
    },
    {
      icon: Shield,
      title: 'Blockchain Verification',
      description: 'Build trust with buyers through immutable blockchain records of your farming practices.'
    },
    {
      icon: Users,
      title: 'Farmer Community',
      description: 'Connect with other verified farmers, share knowledge, and learn best practices.'
    }
  ];

  const steps = [
    {
      step: 1,
      title: 'Apply to Join',
      description: 'Complete our farmer verification process with documents and farm visit.',
      action: 'Start Application'
    },
    {
      step: 2,
      title: 'Get Verified',
      description: 'Our team verifies your farming practices and quality standards.',
      action: 'Under Review'
    },
    {
      step: 3,
      title: 'List Your Spices',
      description: 'Upload your products with photos, descriptions, and blockchain records.',
      action: 'Create Listings'
    },
    {
      step: 4,
      title: 'Start Selling',
      description: 'Connect with buyers worldwide and receive fair prices for premium spices.',
      action: 'Earn Revenue'
    }
  ];

  const featuredFarmers = [
    {
      name: 'Ranjan Perera',
      location: 'Kandy, Sri Lanka',
      specialty: 'Ceylon Cinnamon',
      rating: 4.9,
      sales: 150,
      verified: true,
      image: '👨‍🌾'
    },
    {
      name: 'Kamala Wickramasinghe',
      location: 'Matale, Sri Lanka',
      specialty: 'Black Pepper',
      rating: 4.8,
      sales: 89,
      verified: true,
      image: '👩‍🌾'
    },
    {
      name: 'Mahesh Silva',
      location: 'Ella, Sri Lanka',
      specialty: 'Cardamom',
      rating: 4.7,
      sales: 203,
      verified: true,
      image: '👨‍🌾'
    }
  ];

  return (
    <>
      <Head>
        <title>For Farmers - Spiced Platform | Join the Transparent Spice Marketplace</title>
        <meta name="description" content="Join verified Sri Lankan spice farmers on Spiced platform. Get fair prices, global reach, and blockchain verification for your premium spices." />
      </Head>

      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                  <Leaf className="w-4 h-4 mr-1" />
                  For Sri Lankan Farmers
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  Sell Your Spices
                  <br />
                  <span className="text-green-200">Directly to the World</span>
                </h1>
                <p className="text-xl text-green-100 leading-relaxed">
                  Join 150+ verified farmers earning fair prices through our blockchain-transparent
                  marketplace. No middlemen, no hidden fees, just direct connections to global buyers.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100" asChild>
                  <Link href="/farmers/apply">
                    <Users className="w-5 h-5 mr-2" />
                    Apply to Join
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                  <Link href="/farmers/learn-more">
                    Learn More
                  </Link>
                </Button>
              </div>

              {/* Trust Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-green-500">
                <div className="text-center">
                  <div className="text-2xl font-bold">150+</div>
                  <div className="text-green-200 text-sm">Verified Farmers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">40-60%</div>
                  <div className="text-green-200 text-sm">Higher Earnings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">25+</div>
                  <div className="text-green-200 text-sm">Countries Served</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <h3 className="text-xl font-bold mb-6 text-center">Success Stories</h3>
                <div className="space-y-4">
                  {featuredFarmers.slice(0, 2).map((farmer) => (
                    <div key={farmer.name} className="bg-white/20 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{farmer.image}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{farmer.name}</span>
                            {farmer.verified && (
                              <Shield className="w-4 h-4 text-green-300" />
                            )}
                          </div>
                          <div className="text-green-200 text-sm">{farmer.specialty} • {farmer.location}</div>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-sm">{farmer.rating}</span>
                            </div>
                            <div className="text-sm text-green-200">{farmer.sales} sales</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Join Spiced Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're transforming how Sri Lankan farmers connect with the world,
              ensuring fair prices and transparent trade through blockchain technology.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <Card key={benefit.title} className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple 4-step process to join our verified farmer community and start selling globally.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.step} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gray-200 z-0"></div>
                )}
                <Card className="relative z-10 text-center">
                  <CardHeader>
                    <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                      {step.step}
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">{step.description}</p>
                    <Button
                      variant={index === 0 ? 'default' : 'outline'}
                      size="sm"
                      className="w-full"
                      disabled={index > 0}
                    >
                      {step.action}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Farmers */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Top Farmers
            </h2>
            <p className="text-xl text-gray-600">
              Successful farmers already earning premium prices through our platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredFarmers.map((farmer) => (
              <Card key={farmer.name} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="text-6xl mb-4">{farmer.image}</div>
                  <div className="flex items-center justify-center space-x-2">
                    <h3 className="font-semibold text-lg">{farmer.name}</h3>
                    {farmer.verified && (
                      <Badge variant="verified" size="sm">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-center space-x-1 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{farmer.location}</span>
                  </div>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div>
                    <Badge variant="secondary">{farmer.specialty}</Badge>
                  </div>
                  <div className="flex justify-center space-x-6 text-sm">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{farmer.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Award className="w-4 h-4 text-gray-500" />
                      <span>{farmer.sales} sales</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Join Our Farmer Community?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Start your journey to fair pricing and global reach. Our verification process
            ensures quality standards and builds buyer trust.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100" asChild>
              <Link href="/farmers/apply">
                Apply to Join Platform
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
              <Link href="/contact">
                Contact Our Team
              </Link>
            </Button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-green-200 text-sm">
              Questions? Our farmer support team is here to help every step of the way.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}