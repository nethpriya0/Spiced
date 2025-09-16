import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, Upload, User, FileText, Camera, CheckCircle, Loader } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { farmerRegistryService } from '@/lib/contracts/FarmerRegistryService'
import { type Address } from 'viem'
import { IPFSService } from '@/lib/ipfs/IPFSService'

interface ProfileData {
  name: string
  bio: string
  location: string
  experience: string
  specialties: string[]
  profilePicture?: File
  profilePicturePreview?: string
}

const SPECIALTIES = [
  'Cinnamon', 'Black Pepper', 'Cardamom', 'Cloves', 'Nutmeg', 'Turmeric',
  'Ginger', 'Vanilla', 'Star Anise', 'Mace', 'Allspice', 'Coriander',
  'Fenugreek', 'Mustard Seeds', 'Cumin', 'Fennel', 'Other Spices'
]

type Step = 'personal' | 'experience' | 'specialties' | 'photo' | 'review' | 'submit'

export default function ProfileSetupPage() {
  const { user, walletClient, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  
  // State management
  const [currentStep, setCurrentStep] = useState<Step>('personal')
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    bio: '',
    location: '',
    experience: '',
    specialties: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitComplete, setSubmitComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Authentication check
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user)) {
      router.push('/login?role=farmer')
      return
    }
  }, [isAuthenticated, isLoading, user, router])

  // Update profile data
  const updateProfileData = (updates: Partial<ProfileData>) => {
    setProfileData(prev => ({ ...prev, ...updates }))
    // Clear validation errors for updated fields
    const updatedFields = Object.keys(updates)
    setValidationErrors(prev => {
      const newErrors = { ...prev }
      updatedFields.forEach(field => {
        if (newErrors[field]) {
          delete newErrors[field]
        }
      })
      return newErrors
    })
  }

  // Validate current step
  const validateStep = (step: Step): boolean => {
    const errors: Record<string, string> = {}

    switch (step) {
      case 'personal':
        if (!profileData.name.trim()) errors.name = 'Name is required'
        if (profileData.name.length < 2) errors.name = 'Name must be at least 2 characters'
        if (!profileData.location.trim()) errors.location = 'Location is required'
        break
      
      case 'experience':
        if (!profileData.bio.trim()) errors.bio = 'Bio is required'
        if (profileData.bio.length < 50) errors.bio = 'Bio must be at least 50 characters'
        if (!profileData.experience) errors.experience = 'Experience level is required'
        break
      
      case 'specialties':
        if (profileData.specialties.length === 0) errors.specialties = 'Select at least one specialty'
        break
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle file upload for profile picture
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setValidationErrors(prev => ({ ...prev, profilePicture: 'Image must be less than 5MB' }))
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        updateProfileData({
          profilePicture: file,
          profilePicturePreview: e.target?.result as string
        })
      }
      reader.readAsDataURL(file)
    }
  }

  // Navigation functions
  const goToNextStep = () => {
    if (validateStep(currentStep)) {
      const steps: Step[] = ['personal', 'experience', 'specialties', 'photo', 'review', 'submit']
      const currentIndex = steps.indexOf(currentStep)
      if (currentIndex < steps.length - 1) {
        const nextStep = steps[currentIndex + 1]
        if (nextStep) {
          setCurrentStep(nextStep)
        }
      }
    }
  }

  const goToPreviousStep = () => {
    const steps: Step[] = ['personal', 'experience', 'specialties', 'photo', 'review', 'submit']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      const previousStep = steps[currentIndex - 1]
      if (previousStep) {
        setCurrentStep(previousStep)
      }
    }
  }

  // Handle specialty toggle
  const toggleSpecialty = (specialty: string) => {
    const newSpecialties = profileData.specialties.includes(specialty)
      ? profileData.specialties.filter(s => s !== specialty)
      : [...profileData.specialties, specialty]
    updateProfileData({ specialties: newSpecialties })
  }

  // Submit profile
  const submitProfile = async () => {
    if (!user?.address || !walletClient) {
      setError('Authentication required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      let profilePictureHash = ''

      // Upload profile picture to IPFS if provided
      if (profileData.profilePicture) {
        try {
          const ipfsService = new IPFSService()
          profilePictureHash = await ipfsService.uploadFile(profileData.profilePicture)
          console.log('✅ Profile picture uploaded to IPFS:', profilePictureHash)
        } catch (ipfsError) {
          console.warn('IPFS upload failed, continuing without profile picture:', ipfsError)
        }
      }

      // Create bio with additional information
      const fullBio = `${profileData.bio}

Location: ${profileData.location}
Experience: ${profileData.experience}
Specialties: ${profileData.specialties.join(', ')}`

      // Check if we're in development mode
      if (process.env.NODE_ENV === 'development' || 
          !process.env.NEXT_PUBLIC_DIAMOND_PROXY_ADDRESS ||
          process.env.NEXT_PUBLIC_DIAMOND_PROXY_ADDRESS === '0x5FbDB2315678afecb367f032d93F642f64180aa3') {
        // Development mode - simulate successful registration
        console.log('🔧 Development mode: Simulating farmer registration')
        console.log('Profile data:', {
          name: profileData.name,
          bio: fullBio,
          profilePictureHash
        })
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Mark profile as complete in localStorage
        localStorage.setItem('user_profile_complete', 'true')
        setSubmitComplete(true)
        
        // Redirect to dashboard after a brief delay
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
        
        return
      }

      // Production mode - register with smart contract
      farmerRegistryService.initialize({
        contractAddress: process.env.NEXT_PUBLIC_DIAMOND_PROXY_ADDRESS as Address,
        walletClient
      })

      const txHash = await farmerRegistryService.registerFarmer(
        profileData.name,
        fullBio,
        profilePictureHash
      )

      console.log('Profile registration transaction:', txHash)
      localStorage.setItem('user_profile_complete', 'true')
      setSubmitComplete(true)

      // Wait for transaction confirmation and redirect
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)

    } catch (err) {
      console.error('Failed to save profile:', err)
      setError(`Failed to save profile: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-spice-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Success state
  if (submitComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Created Successfully! 🎉</h1>
          <p className="text-gray-600 mb-6">
            Your farmer profile has been saved securely. Welcome to the Spice Platform community!
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-6">
            <Loader className="h-4 w-4 animate-spin" />
            <span>Redirecting to your dashboard...</span>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-spice-green hover:bg-spice-green-dark text-white py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            Go to Dashboard Now
          </button>
        </div>
      </div>
    )
  }

  const renderProgressBar = () => {
    const steps = ['personal', 'experience', 'specialties', 'photo', 'review']
    const currentIndex = steps.indexOf(currentStep)
    const progress = ((currentIndex + 1) / steps.length) * 100

    return (
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Step {currentIndex + 1} of {steps.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-spice-green h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    )
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'personal':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
              <p className="text-gray-600">Let&apos;s start with the basics about you</p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={profileData.name}
                  onChange={(e) => updateProfileData({ name: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-spice-green focus:border-spice-green ${
                    validationErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
                {validationErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  id="location"
                  type="text"
                  value={profileData.location}
                  onChange={(e) => updateProfileData({ location: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-spice-green focus:border-spice-green ${
                    validationErrors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Kandy, Sri Lanka"
                />
                {validationErrors.location && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.location}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 'experience':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Experience</h2>
              <p className="text-gray-600">Tell us about your farming background</p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                  Bio *
                </label>
                <textarea
                  id="bio"
                  rows={6}
                  value={profileData.bio}
                  onChange={(e) => updateProfileData({ bio: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-spice-green focus:border-spice-green ${
                    validationErrors.bio ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Tell buyers about your farming background, methods, and what makes your spices special..."
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>{validationErrors.bio || 'Minimum 50 characters'}</span>
                  <span>{profileData.bio.length} characters</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Farming Experience *
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'beginner', label: '0-2 years (Beginner)' },
                    { value: 'intermediate', label: '3-10 years (Experienced)' },
                    { value: 'expert', label: '10+ years (Expert)' },
                    { value: 'generational', label: 'Generational (Family farming tradition)' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name="experience"
                        value={option.value}
                        checked={profileData.experience === option.value}
                        onChange={(e) => updateProfileData({ experience: e.target.value })}
                        className="mr-3 text-spice-green focus:ring-spice-green"
                      />
                      <span className="text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
                {validationErrors.experience && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.experience}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 'specialties':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Specialties</h2>
              <p className="text-gray-600">What spices do you grow or specialize in?</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Select your specialties (choose at least one) *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {SPECIALTIES.map((specialty) => (
                  <button
                    key={specialty}
                    type="button"
                    onClick={() => toggleSpecialty(specialty)}
                    className={`p-3 text-sm rounded-lg border-2 transition-all ${
                      profileData.specialties.includes(specialty)
                        ? 'border-spice-green bg-spice-green text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-spice-green'
                    }`}
                  >
                    {specialty}
                  </button>
                ))}
              </div>
              {validationErrors.specialties && (
                <p className="text-red-500 text-sm mt-2">{validationErrors.specialties}</p>
              )}
            </div>
          </div>
        )

      case 'photo':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Photo</h2>
              <p className="text-gray-600">Add a photo to build trust with buyers (optional)</p>
            </div>

            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                {profileData.profilePicturePreview ? (
                  <div className="relative">
                    <Image
                      src={profileData.profilePicturePreview}
                      alt="Profile preview"
                      width={200}
                      height={200}
                      className="w-40 h-40 rounded-full object-cover border-4 border-gray-200"
                    />
                    <button
                      onClick={() => updateProfileData({ profilePicture: undefined, profilePicturePreview: undefined })}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-40 h-40 rounded-full bg-gray-100 border-4 border-dashed border-gray-300 flex items-center justify-center">
                    <Camera className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>

              <div>
                <input
                  id="profile-picture"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
                <label
                  htmlFor="profile-picture"
                  className="inline-flex items-center px-6 py-3 bg-spice-green text-white rounded-lg cursor-pointer hover:bg-spice-green-dark transition-colors"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  {profileData.profilePicture ? 'Change Photo' : 'Upload Photo'}
                </label>
              </div>

              {validationErrors.profilePicture && (
                <p className="text-red-500 text-sm">{validationErrors.profilePicture}</p>
              )}

              <p className="text-sm text-gray-500 text-center max-w-sm">
                Upload a clear photo of yourself. This helps buyers connect with you and builds trust.
                Maximum file size: 5MB
              </p>
            </div>
          </div>
        )

      case 'review':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Profile</h2>
              <p className="text-gray-600">Please review your information before submitting</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="flex items-center space-x-4">
                {profileData.profilePicturePreview && (
                  <Image
                    src={profileData.profilePicturePreview}
                    alt="Profile"
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                )}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{profileData.name}</h3>
                  <p className="text-gray-600">{profileData.location}</p>
                  <p className="text-sm text-gray-500 capitalize">
                    {profileData.experience?.replace('_', ' ')} farmer
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Bio</h4>
                <p className="text-gray-700 text-sm">{profileData.bio}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Specialties</h4>
                <div className="flex flex-wrap gap-2">
                  {profileData.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="px-3 py-1 bg-spice-green text-white text-sm rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Ready to submit?
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Your profile will be saved securely on the blockchain. 
                      You can edit most information later in your dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <>
      <Head>
        <title>Profile Setup - Spice Platform</title>
        <meta name="description" content="Set up your farmer profile on the Spice Platform" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-spice-green rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
              <p className="text-gray-600">Join the Spice Platform community as a verified farmer</p>
            </div>

            {/* Progress bar */}
            {renderProgressBar()}

            {/* Main content */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {/* Error message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-red-400">⚠️</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step content */}
              {renderStepContent()}

              {/* Navigation buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={goToPreviousStep}
                  disabled={currentStep === 'personal'}
                  className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                    currentStep === 'personal'
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Previous
                </button>

                {currentStep === 'review' ? (
                  <button
                    onClick={submitProfile}
                    disabled={isSubmitting}
                    className="flex items-center px-8 py-3 bg-spice-green text-white rounded-lg font-medium hover:bg-spice-green-dark transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="h-5 w-5 mr-2 animate-spin" />
                        Creating Profile...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Create Profile
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={goToNextStep}
                    className="flex items-center px-6 py-3 bg-spice-green text-white rounded-lg font-medium hover:bg-spice-green-dark transition-colors"
                  >
                    Next
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}