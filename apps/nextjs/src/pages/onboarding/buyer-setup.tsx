import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useAuth } from '@/hooks/useAuth'
import { ShoppingCart, User, MapPin, Building, ArrowRight } from 'lucide-react'

export default function BuyerSetupPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [isInitialized, setIsInitialized] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profileComplete, setProfileComplete] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    location: '',
    businessType: '',
    interests: [] as string[],
    newsletter: true
  })

  const businessTypes = [
    'Restaurant',
    'Food Distributor',
    'Retail Store',
    'Food Manufacturer',
    'Home Chef',
    'Catering Service',
    'Other'
  ]

  const spiceInterests = [
    'Ceylon Cinnamon',
    'Black Pepper',
    'Cardamom',
    'Cloves',
    'Nutmeg',
    'Turmeric',
    'Vanilla',
    'Ginger'
  ]

  // Check if user is authenticated
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user)) {
      router.push('/login?role=buyer')
      return
    }

    if (isAuthenticated && user) {
      // Pre-fill form with user data if available
      setFormData(prev => ({
        ...prev,
        name: user.name || user.email?.split('@')[0] || '',
      }))
      setIsInitialized(true)
    }
  }, [isAuthenticated, isLoading, user, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.location || !formData.businessType) {
      setError('Please fill in all required fields')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      // In development mode, simulate saving buyer profile
      console.log('🛒 [BuyerSetup] Saving buyer profile:', formData)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mark buyer profile as complete
      localStorage.setItem('buyer_profile_complete', 'true')
      
      setProfileComplete(true)
      
      // Redirect to marketplace after a brief delay
      setTimeout(() => {
        router.push('/marketplace')
      }, 2000)
      
    } catch (err) {
      console.error('Failed to save buyer profile:', err)
      setError('Failed to save profile. Please try again.')
      setIsSaving(false)
    }
  }

  const isFormValid = formData.name && formData.location && formData.businessType

  // Loading state
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !isSaving) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Setup Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => setError(null)}
            className="w-full py-2 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Success state
  if (profileComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Spice Platform!</h1>
          <p className="text-gray-600 mb-6">
            Your buyer profile has been created. You can now browse and purchase authentic Sri Lankan spices from verified farmers.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-6">
            <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <span>Redirecting to marketplace...</span>
          </div>
          <button
            onClick={() => router.push('/marketplace')}
            className="w-full py-2 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Go to Marketplace Now
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Buyer Profile Setup - Spice Platform</title>
        <meta name="description" content="Set up your buyer profile to start purchasing authentic spices" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <div className="max-w-2xl mx-auto p-6">
          {/* Loading overlay while saving */}
          {isSaving && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 text-center max-w-sm mx-4">
                <div className="text-4xl mb-4">🛒</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Creating Your Buyer Profile
                </h3>
                <p className="text-gray-600 mb-4">
                  Setting up your account for the best shopping experience...
                </p>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-gray-500">Please wait...</span>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Complete Your Buyer Profile
            </h1>
            <p className="text-gray-600 text-lg">
              Tell us a bit about yourself to get the best spice recommendations
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building className="inline h-4 w-4 mr-1" />
                  Company/Business Name
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Your business name (optional)"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="City, Country"
                />
              </div>

              {/* Business Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type *
                </label>
                <select
                  value={formData.businessType}
                  onChange={(e) => handleInputChange('businessType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select your business type</option>
                  {businessTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Spice Interests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What spices are you interested in?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {spiceInterests.map(spice => (
                    <label key={spice} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.interests.includes(spice)}
                        onChange={() => handleInterestToggle(spice)}
                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">{spice}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Newsletter */}
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.newsletter}
                    onChange={(e) => handleInputChange('newsletter', e.target.checked.toString())}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">
                    Subscribe to newsletter for new arrivals and special offers
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!isFormValid || isSaving}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-2 ${
                  isFormValid && !isSaving
                    ? 'bg-orange-500 hover:bg-orange-600 transform hover:scale-105'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                <span>Complete Profile & Start Shopping</span>
                <ArrowRight className="h-5 w-5" />
              </button>

              <p className="text-xs text-gray-500 text-center">
                * Required fields. You can update your profile later in account settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}