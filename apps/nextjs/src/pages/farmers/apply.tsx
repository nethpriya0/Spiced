import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  User,
  MapPin,
  Phone,
  Mail,
  FileText,
  Upload,
  CheckCircle,
  ArrowLeft,
  Leaf,
  Shield,
  Clock
} from 'lucide-react';

export default function FarmersApplyPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      district: '',
      nationalId: ''
    },
    farmInfo: {
      farmName: '',
      farmSize: '',
      farmLocation: '',
      farmingExperience: '',
      spiceTypes: [] as string[],
      farmingMethod: 'traditional',
      certifications: [] as string[]
    },
    documentation: {
      nationalIdDoc: null as File | null,
      landOwnershipDoc: null as File | null,
      farmPhotos: [] as File[],
      certificationDocs: [] as File[]
    }
  });

  const steps = [
    { number: 1, title: 'Personal Information', icon: User },
    { number: 2, title: 'Farm Details', icon: Leaf },
    { number: 3, title: 'Documentation', icon: FileText },
    { number: 4, title: 'Review & Submit', icon: CheckCircle }
  ];

  const spiceOptions = [
    'Ceylon Cinnamon', 'Black Pepper', 'White Pepper', 'Cardamom',
    'Cloves', 'Nutmeg', 'Mace', 'Vanilla', 'Turmeric', 'Ginger'
  ];

  const certificationOptions = [
    'Organic Certified', 'Fair Trade', 'Rainforest Alliance',
    'EU Organic', 'USDA Organic', 'Sri Lanka Spice Council'
  ];

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    // In production, this would submit to the backend
    alert('Application submitted successfully! We will review your application and contact you within 3-5 business days.');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name *</label>
                <Input
                  placeholder="Enter your full name"
                  value={formData.personalInfo.fullName}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo, fullName: e.target.value }
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email Address *</label>
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.personalInfo.email}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo, email: e.target.value }
                  })}
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number *</label>
                <Input
                  placeholder="+94 77 123 4567"
                  value={formData.personalInfo.phone}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo, phone: e.target.value }
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">National ID Number *</label>
                <Input
                  placeholder="123456789V"
                  value={formData.personalInfo.nationalId}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo, nationalId: e.target.value }
                  })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Address *</label>
              <Input
                placeholder="Street address"
                value={formData.personalInfo.address}
                onChange={(e) => setFormData({
                  ...formData,
                  personalInfo: { ...formData.personalInfo, address: e.target.value }
                })}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">City *</label>
                <Input
                  placeholder="City"
                  value={formData.personalInfo.city}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo, city: e.target.value }
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">District *</label>
                <Input
                  placeholder="District"
                  value={formData.personalInfo.district}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo, district: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Farm Name *</label>
                <Input
                  placeholder="Your farm name"
                  value={formData.farmInfo.farmName}
                  onChange={(e) => setFormData({
                    ...formData,
                    farmInfo: { ...formData.farmInfo, farmName: e.target.value }
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Farm Size (hectares) *</label>
                <Input
                  type="number"
                  placeholder="5.5"
                  value={formData.farmInfo.farmSize}
                  onChange={(e) => setFormData({
                    ...formData,
                    farmInfo: { ...formData.farmInfo, farmSize: e.target.value }
                  })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Farm Location *</label>
              <Input
                placeholder="Detailed farm location"
                value={formData.farmInfo.farmLocation}
                onChange={(e) => setFormData({
                  ...formData,
                  farmInfo: { ...formData.farmInfo, farmLocation: e.target.value }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Farming Experience (years) *</label>
              <Input
                type="number"
                placeholder="15"
                value={formData.farmInfo.farmingExperience}
                onChange={(e) => setFormData({
                  ...formData,
                  farmInfo: { ...formData.farmInfo, farmingExperience: e.target.value }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Spice Types You Grow *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {spiceOptions.map(spice => (
                  <label key={spice} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.farmInfo.spiceTypes.includes(spice)}
                      onChange={(e) => {
                        const updated = e.target.checked
                          ? [...formData.farmInfo.spiceTypes, spice]
                          : formData.farmInfo.spiceTypes.filter(s => s !== spice);
                        setFormData({
                          ...formData,
                          farmInfo: { ...formData.farmInfo, spiceTypes: updated }
                        });
                      }}
                    />
                    <span className="text-sm">{spice}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Current Certifications</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {certificationOptions.map(cert => (
                  <label key={cert} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.farmInfo.certifications.includes(cert)}
                      onChange={(e) => {
                        const updated = e.target.checked
                          ? [...formData.farmInfo.certifications, cert]
                          : formData.farmInfo.certifications.filter(c => c !== cert);
                        setFormData({
                          ...formData,
                          farmInfo: { ...formData.farmInfo, certifications: updated }
                        });
                      }}
                    />
                    <span className="text-sm">{cert}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Please upload clear, high-quality documents. All documents should be in PDF, JPG, or PNG format and not exceed 5MB each.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">National ID Copy *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                  <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Land Ownership Document *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Upload deed or lease agreement</p>
                  <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Farm Photos *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Upload 3-5 photos of your farm</p>
                  <input type="file" className="hidden" accept=".jpg,.jpeg,.png" multiple />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Certification Documents (Optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Upload any certification documents</p>
                  <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" multiple />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-800 mb-2">Review Your Application</h3>
              <p className="text-sm text-green-700">
                Please review all information before submitting. You can go back to make changes if needed.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Personal Information</h4>
                <div className="bg-gray-50 rounded-lg p-4 text-sm">
                  <p><strong>Name:</strong> {formData.personalInfo.fullName || 'Not provided'}</p>
                  <p><strong>Email:</strong> {formData.personalInfo.email || 'Not provided'}</p>
                  <p><strong>Phone:</strong> {formData.personalInfo.phone || 'Not provided'}</p>
                  <p><strong>Location:</strong> {formData.personalInfo.city}, {formData.personalInfo.district}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Farm Information</h4>
                <div className="bg-gray-50 rounded-lg p-4 text-sm">
                  <p><strong>Farm Name:</strong> {formData.farmInfo.farmName || 'Not provided'}</p>
                  <p><strong>Size:</strong> {formData.farmInfo.farmSize} hectares</p>
                  <p><strong>Experience:</strong> {formData.farmInfo.farmingExperience} years</p>
                  <p><strong>Spice Types:</strong> {formData.farmInfo.spiceTypes.join(', ') || 'None selected'}</p>
                  <p><strong>Certifications:</strong> {formData.farmInfo.certifications.join(', ') || 'None'}</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">Next Steps</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Your application will be reviewed within 3-5 business days</li>
                <li>• Our team may contact you for additional information</li>
                <li>• A farm visit may be scheduled for verification</li>
                <li>• You'll receive an email notification about your application status</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>Apply to Join - Spiced Platform | Farmer Application</title>
        <meta name="description" content="Apply to join the Spiced platform as a verified farmer. Connect directly with global buyers and get fair prices for your premium spices." />
      </Head>

      <Header />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <Link href="/farmers" className="inline-flex items-center text-green-600 hover:text-green-700 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Farmers
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Join Spiced Platform
            </h1>
            <p className="text-gray-600">
              Apply to become a verified farmer and start selling your premium spices to global buyers.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;

                return (
                  <div key={step.number} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      isActive
                        ? 'border-green-600 bg-green-600 text-white'
                        : isCompleted
                          ? 'border-green-600 bg-green-600 text-white'
                          : 'border-gray-300 bg-white text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-20 h-0.5 ml-4 ${
                        isCompleted ? 'bg-green-600' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2">
              {steps.map(step => (
                <div key={step.number} className="text-xs text-gray-600 w-24 text-center">
                  {step.title}
                </div>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-green-600" />
                Step {currentStep}: {steps[currentStep - 1]?.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>

                {currentStep < 4 ? (
                  <Button onClick={handleNext}>
                    Next
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                    Submit Application
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Support Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Need help with your application?
              <Link href="/contact" className="text-green-600 hover:text-green-700 ml-1">
                Contact our support team
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}