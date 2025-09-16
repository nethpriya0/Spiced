import React from 'react'
import { Calendar, MapPin, CheckCircle, Clock, Package } from 'lucide-react'

interface ProcessingStep {
  id: string
  title: string
  date: Date | string
  description: string
  image?: string
  verified?: boolean
  location?: string
}

interface PassportTimelineProps {
  batchId: string
  spiceType: string
  harvestDate: Date | string
  processingSteps: ProcessingStep[]
}

export const PassportTimeline: React.FC<PassportTimelineProps> = ({
  batchId,
  spiceType,
  harvestDate,
  processingSteps
}) => {
  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStepIcon = (index: number) => {
    const icons = [Calendar, Package, CheckCircle, Package]
    const IconComponent = icons[index] || CheckCircle
    return <IconComponent className="h-5 w-5 text-white" />
  }

  return (
    <div className="relative">
      <div className="absolute left-6 top-8 bottom-0 w-0.5 bg-gray-200"></div>
      
      <div className="space-y-6">
        {processingSteps.map((step, index) => (
          <div key={step.id} className="relative flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center relative z-10">
              {getStepIcon(index)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(step.date)}
                  </div>
                </div>
                
                <p className="text-gray-600 mb-3">{step.description}</p>
                
                {step.image && (
                  <div className="mb-3">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-32 object-cover rounded border"
                    />
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    <span>Blockchain Verified</span>
                  </div>
                  
                  {step.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{step.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <CheckCircle className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-900">Complete Provenance Chain</h4>
            <p className="text-sm text-blue-700 mt-1">
              Every step in this {spiceType} journey has been recorded on the blockchain, 
              ensuring complete transparency and authenticity.
            </p>
            <p className="text-xs text-blue-600 mt-2">
              Batch ID: #{batchId} • Total processing time: {processingSteps.length} days
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}