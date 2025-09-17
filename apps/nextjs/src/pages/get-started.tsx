import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  ShoppingCart,
  Leaf,
  CheckCircle,
  Users,
  Globe,
  TrendingUp,
  Shield,
  Wallet,
  CreditCard,
  Smartphone
} from 'lucide-react';

type UserType = 'buyer' | 'farmer' | null;

export default function GetStarted() {
  const [selectedType, setSelectedType] = useState<UserType>(null);
  const router = useRouter();

  const userTypes = [
    {
      type: 'buyer' as const,
      title: 'I want to buy spices',
      subtitle: 'Browse premium Ceylon spices with blockchain verification',
      icon: ShoppingCart,
      color: 'bg-blue-500',
      benefits: [
        'Access to 50+ premium spice varieties',
        'Direct connection with verified farmers',
        'Complete blockchain traceability',
        'Quality guarantee and fair pricing',
        'Global shipping and secure payments'
      ],
      ctaText: 'Start Shopping',
      ctaLink: '/marketplace'
    },
    {
      type: 'farmer' as const,
      title: 'I want to sell my spices',
      subtitle: 'Connect directly with global buyers and get fair prices',
      icon: Leaf,
      color: 'bg-green-500',
      benefits: [
        'Direct access to global marketplace',
        'Fair pricing without middlemen',
        'Blockchain verification system',
        'Marketing and brand building tools',
        'Secure payment processing'
      ],
      ctaText: 'Join as Farmer',
      ctaLink: '/farmers/registration'
    }
  ];

  const authMethods = [
    {
      id: 'web3',
      name: 'Web3 Wallet',
      description: 'Connect with MetaMask, WalletConnect, or Coinbase Wallet',
      icon: Wallet,
      recommended: true,
      features: ['Instant blockchain integration', 'Secure transactions', 'Decentralized identity']
    },
    {
      id: 'email',
      name: 'Email & Password',
      description: 'Traditional signup with email verification',
      icon: CreditCard,
      recommended: false,
      features: ['Quick setup', 'Familiar process', 'Optional Web3 later']
    },
    {
      id: 'phone',
      name: 'Phone Number',
      description: 'SMS verification for mobile users',
      icon: Smartphone,
      recommended: false,
      features: ['Mobile optimized', 'SMS verification', 'Easy recovery']
    }
  ];

  const handleGetStarted = (authMethod: string) => {
    if (selectedType === 'buyer') {
      if (authMethod === 'web3') {
        router.push('/marketplace?connect=true');
      } else {
        router.push('/signup?type=buyer&method=' + authMethod);
      }
    } else if (selectedType === 'farmer') {
      if (authMethod === 'web3') {
        router.push('/farmers/registration?connect=true');
      } else {
        router.push('/signup?type=farmer&method=' + authMethod);
      }
    }
  };

  return (
    <>
      <Head>
        <title>Get Started - Spiced Platform | Join the Transparent Spice Marketplace</title>
        <meta name="description" content="Join Spiced platform as a buyer or farmer. Get started with Web3 wallet or traditional signup. Access premium Ceylon spices with blockchain transparency." />
      </Head>

      <Header />

      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Step 1: Choose User Type */}
          {!selectedType && (
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Welcome to <span className="text-green-600">Spiced</span>
              </h1>
              <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
                Choose your path to join the world's most transparent spice marketplace.
                Whether you're buying premium spices or selling your harvest, we've got you covered.
              </p>

              <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {userTypes.map((userType) => {
                  const Icon = userType.icon;
                  return (
                    <Card
                      key={userType.type}
                      className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 border-2 hover:border-green-200"
                      onClick={() => setSelectedType(userType.type)}
                    >
                      <CardHeader className="text-center pb-4">
                        <div className={`w-16 h-16 ${userType.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl text-gray-900">{userType.title}</CardTitle>
                        <p className="text-gray-600">{userType.subtitle}</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          {userType.benefits.map((benefit, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{benefit}</span>
                            </div>
                          ))}
                        </div>
                        <Button className="w-full mt-6" size="lg">
                          {userType.ctaText}
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Choose Authentication Method */}
          {selectedType && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedType(null)}
                  className="mb-4"
                >
                  ← Back to user type selection
                </Button>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  How would you like to get started?
                </h2>
                <p className="text-lg text-gray-600">
                  Choose your preferred authentication method to join as a {selectedType}.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {authMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <Card
                      key={method.id}
                      className={`h-full hover:shadow-lg transition-all duration-300 cursor-pointer relative ${
                        method.recommended ? 'border-2 border-green-200 ring-2 ring-green-100' : ''
                      }`}
                      onClick={() => handleGetStarted(method.id)}
                    >
                      {method.recommended && (
                        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-500">
                          Recommended
                        </Badge>
                      )}
                      <CardHeader className="text-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Icon className="w-6 h-6 text-gray-600" />
                        </div>
                        <CardTitle className="text-xl">{method.name}</CardTitle>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {method.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                        <Button className="w-full mt-4" variant={method.recommended ? 'default' : 'outline'}>
                          Continue with {method.name}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Additional Info */}
              <div className="mt-12 text-center">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">
                      Why Web3 Wallet is Recommended?
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-800">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4" />
                        <span>Enhanced Security</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4" />
                        <span>Blockchain Integration</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>Future-Ready</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Help Section */}
              <div className="mt-8 text-center">
                <p className="text-gray-600 mb-4">
                  Need help getting started? We're here to assist you.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="ghost" asChild>
                    <Link href="/help/wallet-setup">
                      📚 Wallet Setup Guide
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/contact">
                      💬 Contact Support
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/demo">
                      🎮 Try Demo First
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}