import Head from 'next/head';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  TrendingUp,
  Shield,
  Globe,
  Users,
  Leaf,
  DollarSign,
  Award,
  CheckCircle,
  ArrowRight,
  Book,
  VideoIcon,
  Download
} from 'lucide-react';

export default function FarmersLearnMorePage() {
  const benefits = [
    {
      icon: TrendingUp,
      title: 'Increase Your Income',
      description: 'Farmers using our platform earn 40-60% more than traditional middleman sales',
      stats: '₹25,000 → ₹40,000 per quintal average'
    },
    {
      icon: Globe,
      title: 'Global Market Access',
      description: 'Reach buyers in 25+ countries with our international shipping network',
      stats: 'Export to USA, EU, Japan, Australia'
    },
    {
      icon: Shield,
      title: 'Blockchain Verification',
      description: 'Build trust and command premium prices with immutable quality records',
      stats: '15-25% price premium for verified products'
    },
    {
      icon: Users,
      title: 'Direct Relationships',
      description: 'Build lasting partnerships with restaurants, importers, and retailers',
      stats: '85% customer retention rate'
    }
  ];

  const requirements = [
    'Own or lease agricultural land in Sri Lanka',
    'Minimum 2 years of spice farming experience',
    'Valid land ownership or lease documentation',
    'Commitment to quality and sustainable practices',
    'Basic smartphone or computer access for platform use'
  ];

  const supportServices = [
    {
      title: 'Training & Education',
      description: 'Free workshops on organic farming, quality control, and digital marketing',
      icon: Book
    },
    {
      title: 'Quality Certification',
      description: 'Assistance with obtaining organic and fair trade certifications',
      icon: Award
    },
    {
      title: 'Financial Support',
      description: 'Access to microfinance and equipment upgrade programs',
      icon: DollarSign
    },
    {
      title: 'Technical Assistance',
      description: '24/7 platform support and agricultural consulting',
      icon: VideoIcon
    }
  ];

  const successStories = [
    {
      name: 'Sunil Perera',
      location: 'Matale District',
      specialty: 'Ceylon Cinnamon',
      achievement: 'Increased income by 75% in first year',
      quote: "Joining Spiced Platform was the best decision for my family's future. I now export directly to restaurants in London and New York.",
      beforeIncome: '₹18,000/month',
      afterIncome: '₹31,500/month'
    },
    {
      name: 'Kamala Silva',
      location: 'Kandy Hills',
      specialty: 'Black Pepper',
      achievement: 'Built relationships with 12 international buyers',
      quote: "The blockchain verification system helped me prove my quality and earn premium prices for my organic pepper.",
      beforeIncome: '₹22,000/month',
      afterIncome: '₹36,800/month'
    }
  ];

  return (
    <>
      <Head>
        <title>Learn More - Farmers | Spiced Platform</title>
        <meta name="description" content="Learn how Sri Lankan spice farmers are earning 40-60% more through direct sales on the Spiced platform. Discover benefits, requirements, and success stories." />
      </Head>

      <Header />

      <div className="min-h-screen bg-white">
        {/* Header */}
        <section className="bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/farmers" className="inline-flex items-center text-green-200 hover:text-white mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Farmers
            </Link>

            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Transform Your Farming Business
              </h1>
              <p className="text-xl text-green-100 mb-8 leading-relaxed">
                Learn how the Spiced Platform is revolutionizing spice farming in Sri Lanka through
                blockchain technology, direct market access, and fair trade practices.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100" asChild>
                  <Link href="/farmers/apply">
                    Apply Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Download className="w-5 h-5 mr-2" />
                  Download Brochure
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Key Benefits */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Choose Spiced Platform?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We're not just a marketplace – we're your partner in building a sustainable, profitable farming business.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <Card key={benefit.title} className="h-full">
                    <CardHeader className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-6 h-6 text-green-600" />
                      </div>
                      <CardTitle className="text-lg">{benefit.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-gray-600 mb-4">{benefit.description}</p>
                      <Badge variant="secondary" className="bg-green-50 text-green-700">
                        {benefit.stats}
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Real Success Stories
              </h2>
              <p className="text-xl text-gray-600">
                See how farmers are transforming their lives with Spiced Platform
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {successStories.map((story) => (
                <Card key={story.name} className="h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg">{story.name}</h3>
                        <p className="text-gray-600">{story.location}</p>
                        <Badge variant="outline" className="mt-2">{story.specialty}</Badge>
                      </div>
                      <div className="text-6xl">👨‍🌾</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                        <p className="font-medium text-green-800">{story.achievement}</p>
                      </div>

                      <blockquote className="italic text-gray-700 border-l-4 border-gray-200 pl-4">
                        "{story.quote}"
                      </blockquote>

                      <div className="flex justify-between items-center pt-4 border-t">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Before</p>
                          <p className="font-bold text-red-600">{story.beforeIncome}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                        <div className="text-center">
                          <p className="text-sm text-gray-500">After</p>
                          <p className="font-bold text-green-600">{story.afterIncome}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Requirements */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Requirements to Join
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  We maintain high standards to ensure quality and trust in our marketplace.
                  Here's what you need to become a verified farmer.
                </p>

                <div className="space-y-4">
                  {requirements.map((requirement, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{requirement}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <Button asChild>
                    <Link href="/farmers/apply">
                      Start Your Application
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div>
                <div className="bg-green-50 rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    Our Support Services
                  </h3>
                  <div className="space-y-6">
                    {supportServices.map((service) => {
                      const Icon = service.icon;
                      return (
                        <div key={service.title} className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{service.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-green-600 to-green-700 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Farm?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Join 150+ verified farmers who are already earning premium prices
              and building sustainable businesses with Spiced Platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100" asChild>
                <Link href="/farmers/apply">
                  Apply to Join
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                <Link href="/contact">
                  Talk to Our Team
                </Link>
              </Button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-green-200 text-sm">
                Questions about the application process? Our farmer support team is here to help.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}