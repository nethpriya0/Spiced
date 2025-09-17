import Head from "next/head"
import Link from "next/link"
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Users,
  Globe,
  Shield,
  Leaf,
  TrendingUp,
  Award,
  Target,
  CheckCircle,
  BarChart3,
  Zap,
  Clock,
  Star,
  MapPin,
  Truck,
  DollarSign,
  Database,
  Lock,
  Smartphone
} from "lucide-react"

export default function About() {
  const stats = [
    { label: "Verified Farmers", value: "500+", icon: Users },
    { label: "Global Buyers", value: "1,200+", icon: Globe },
    { label: "Transactions Completed", value: "5,000+", icon: TrendingUp },
    { label: "Countries Reached", value: "25+", icon: MapPin }
  ]

  const features = [
    {
      icon: Shield,
      title: "Blockchain Verification",
      description: "Every product comes with immutable blockchain certificates ensuring authenticity and traceability from farm to table.",
      color: "blue"
    },
    {
      icon: Database,
      title: "Digital Spice Passport",
      description: "Comprehensive digital records including harvest date, processing methods, quality scores, and farmer details.",
      color: "green"
    },
    {
      icon: DollarSign,
      title: "Fair Trade Pricing",
      description: "Direct farmer-to-buyer transactions eliminate middlemen, ensuring farmers receive fair compensation.",
      color: "yellow"
    },
    {
      icon: Lock,
      title: "Secure Transactions",
      description: "Web3 wallet integration with smart contracts ensures secure, transparent, and automated payments.",
      color: "purple"
    },
    {
      icon: BarChart3,
      title: "Real-time Market Data",
      description: "Live price feeds, market trends, and demand analytics help farmers make informed decisions.",
      color: "orange"
    },
    {
      icon: Smartphone,
      title: "Mobile-First Design",
      description: "Responsive platform accessible from any device, making it easy for farmers worldwide to participate.",
      color: "indigo"
    }
  ]


  const milestones = [
    {
      year: "2024 Q1",
      title: "Platform Launch",
      description: "Beta release with core marketplace functionality and farmer onboarding."
    },
    {
      year: "2024 Q2",
      title: "Blockchain Integration",
      description: "Full Web3 implementation with smart contracts and digital certificates."
    },
    {
      year: "2024 Q3",
      title: "Global Expansion",
      description: "International marketplace with multi-currency support and global shipping."
    },
    {
      year: "2024 Q4",
      title: "Advanced Analytics",
      description: "AI-powered market insights, predictive pricing, and quality optimization."
    }
  ]

  return (
    <>
      <Head>
        <title>About Us - Spiced Platform | Revolutionizing Spice Trade</title>
        <meta name="description" content="Learn about the Spiced platform, our mission to connect Sri Lankan spice farmers with global markets through blockchain technology, ensuring transparency, fair pricing, and authentic provenance." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <Badge className="bg-green-800 text-green-100 mb-6">
                🌱 Blockchain-Powered Agriculture
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Revolutionizing the
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Global Spice Trade
                </span>
              </h1>
              <p className="text-xl text-green-100 max-w-4xl mx-auto leading-relaxed mb-8">
                Spiced is the world's first comprehensive blockchain platform connecting Sri Lankan spice farmers
                directly with global buyers, ensuring transparency, authenticity, and fair trade practices through
                cutting-edge Web3 technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-green-700 hover:bg-gray-100">
                  <Award className="w-5 h-5 mr-2" />
                  View Demo
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-700">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Platform Statistics
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-8 h-8 text-green-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                      <div className="text-gray-600">{stat.label}</div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Mission & Vision
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Empowering farmers, ensuring authenticity, and building trust in the global spice trade
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              <Card className="p-8">
                <CardContent className="pt-0">
                  <div className="flex items-center mb-6">
                    <Target className="w-8 h-8 text-green-600 mr-3" />
                    <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    To create a transparent, fair, and efficient global marketplace for Sri Lankan spices
                    by connecting farmers directly with buyers through blockchain technology, eliminating
                    intermediaries and ensuring sustainable livelihoods for farming communities.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <span className="text-gray-700">Direct farmer-to-buyer connections</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <span className="text-gray-700">Blockchain-verified authenticity</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <span className="text-gray-700">Fair trade pricing mechanisms</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-8">
                <CardContent className="pt-0">
                  <div className="flex items-center mb-6">
                    <Star className="w-8 h-8 text-yellow-500 mr-3" />
                    <h3 className="text-2xl font-bold text-gray-900">Our Vision</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    To become the global standard for authentic spice trade, where every product carries
                    a verifiable digital passport, every farmer receives fair compensation, and every
                    buyer trusts the quality and origin of their purchase.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-yellow-500 mr-2" />
                      <span className="text-gray-700">Global marketplace leadership</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-yellow-500 mr-2" />
                      <span className="text-gray-700">100% traceable supply chain</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-yellow-500 mr-2" />
                      <span className="text-gray-700">Sustainable farming practices</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Platform Features
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Advanced technology meets traditional agriculture
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon

                // Static color mapping to avoid hydration issues
                const getColorClasses = (color: string) => {
                  const colorMap = {
                    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
                    green: { bg: 'bg-green-100', text: 'text-green-600' },
                    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
                    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
                    orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
                    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600' }
                  }
                  return colorMap[color as keyof typeof colorMap] || { bg: 'bg-gray-100', text: 'text-gray-600' }
                }

                const colors = getColorClasses(feature.color)

                return (
                  <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                    <CardContent className="pt-0">
                      <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center mb-4`}>
                        <Icon className={`w-6 h-6 ${colors.text}`} />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Technology Stack
              </h2>
              <p className="text-xl text-gray-600">
                Built with modern, scalable technologies
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-6">
                <CardContent className="pt-0">
                  <Zap className="w-8 h-8 text-blue-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Frontend</h3>
                  <div className="space-y-2">
                    <Badge variant="secondary">Next.js 14</Badge>
                    <Badge variant="secondary">React 18</Badge>
                    <Badge variant="secondary">TypeScript</Badge>
                    <Badge variant="secondary">Tailwind CSS</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardContent className="pt-0">
                  <Database className="w-8 h-8 text-green-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Backend</h3>
                  <div className="space-y-2">
                    <Badge variant="secondary">Node.js</Badge>
                    <Badge variant="secondary">tRPC</Badge>
                    <Badge variant="secondary">Prisma ORM</Badge>
                    <Badge variant="secondary">PostgreSQL</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardContent className="pt-0">
                  <Lock className="w-8 h-8 text-purple-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Blockchain</h3>
                  <div className="space-y-2">
                    <Badge variant="secondary">Ethereum</Badge>
                    <Badge variant="secondary">Solidity</Badge>
                    <Badge variant="secondary">Wagmi</Badge>
                    <Badge variant="secondary">Web3.js</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Roadmap */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Development Roadmap
              </h2>
              <p className="text-xl text-gray-600">
                Our journey to revolutionize the spice trade
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {milestones.map((milestone, index) => (
                <Card key={index} className="p-6 relative">
                  <CardContent className="pt-0">
                    <div className="text-sm font-semibold text-green-600 mb-2">{milestone.year}</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{milestone.title}</h3>
                    <p className="text-gray-600 text-sm">{milestone.description}</p>
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center absolute -top-4 left-6">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Spiced Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Choose Spiced?
              </h2>
              <p className="text-xl text-gray-600">
                The trusted platform for authentic Sri Lankan spices
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-0">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">100% Authentic</h3>
                  <p className="text-gray-600">Every spice is verified through blockchain technology ensuring genuine Sri Lankan origin</p>
                </CardContent>
              </Card>

              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-0">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Truck className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Delivery</h3>
                  <p className="text-gray-600">Direct farm-to-door shipping with average delivery time of 72 hours globally</p>
                </CardContent>
              </Card>

              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-0">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Fair Pricing</h3>
                  <p className="text-gray-600">Direct trade eliminates middlemen, ensuring fair prices for both farmers and buyers</p>
                </CardContent>
              </Card>

              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-0">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Premium Quality</h3>
                  <p className="text-gray-600">Hand-selected by expert farmers using traditional methods for superior quality</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section className="py-16 bg-green-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Making a Real Impact
              </h2>
              <p className="text-xl text-green-100 max-w-3xl mx-auto">
                See how our platform is transforming lives and communities
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">30%</div>
                <div className="text-green-100">Average price increase for farmers</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">99.9%</div>
                <div className="text-green-100">Product authenticity verification</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">72h</div>
                <div className="text-green-100">Average farm-to-market time</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ready to Join the Revolution?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Whether you're a farmer looking to showcase your spices or a buyer seeking authentic products,
              Spiced is here to transform your experience with blockchain-powered transparency.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                <Users className="w-5 h-5 mr-2" />
                Join as Farmer
              </Button>
              <Button size="lg" variant="outline">
                <Globe className="w-5 h-5 mr-2" />
                Explore Marketplace
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}