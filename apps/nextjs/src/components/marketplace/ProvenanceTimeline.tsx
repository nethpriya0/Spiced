import React from 'react'
import { 
  Sprout, 
  Scissors, 
  Sun, 
  Package, 
  Shield, 
  CheckCircle,
  Calendar,
  Camera,
  FileText
} from 'lucide-react'

interface ProvenanceTimelineProps {
  batchId: string
  harvestDate: string
  sealedAt: string
}

interface TimelineStep {
  id: string
  title: string
  description: string
  timestamp: string
  icon: React.ComponentType<{ className?: string }>
  status: 'completed' | 'current' | 'upcoming'
  details?: string[]
  photos?: number
  documents?: number
}

export const ProvenanceTimeline: React.FC<ProvenanceTimelineProps> = ({
  batchId,
  harvestDate,
  sealedAt
}) => {
  // Mock timeline data - in production, this would be fetched from IPFS/blockchain
  const timelineSteps: TimelineStep[] = [
    {
      id: 'harvest',
      title: 'Harvest Collection',
      description: 'Spices harvested from certified organic plantation',
      timestamp: harvestDate,
      icon: Sprout,
      status: 'completed',
      details: [
        'Manual harvesting at optimal ripeness',
        'GPS coordinates recorded: 7.2906°N, 80.6337°E',
        'Weather conditions: Sunny, 28°C',
        'Quality assessment: Grade AA'
      ],
      photos: 3,
      documents: 1
    },
    {
      id: 'initial-processing',
      title: 'Initial Processing',
      description: 'Cleaning, sorting and preliminary preparation',
      timestamp: new Date(new Date(harvestDate).getTime() + 24 * 60 * 60 * 1000).toISOString(),
      icon: Scissors,
      status: 'completed',
      details: [
        'Foreign matter removed manually',
        'Size grading completed',
        'Moisture content tested: 12%',
        'Initial quality inspection passed'
      ],
      photos: 4,
      documents: 1
    },
    {
      id: 'drying',
      title: 'Traditional Drying',
      description: 'Sun-drying using traditional methods',
      timestamp: new Date(new Date(harvestDate).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      icon: Sun,
      status: 'completed',
      details: [
        'Sun-dried on clean bamboo mats',
        'Duration: 5 days with regular turning',
        'Final moisture content: 8%',
        'Color and aroma preservation verified'
      ],
      photos: 6,
      documents: 2
    },
    {
      id: 'final-processing',
      title: 'Final Processing & Packaging',
      description: 'Final preparation and quality control',
      timestamp: new Date(new Date(harvestDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      icon: Package,
      status: 'completed',
      details: [
        'Final quality control inspection',
        'Packaging in food-grade containers',
        'Weight verification: 2.5kg exactly',
        'Batch labeling completed'
      ],
      photos: 2,
      documents: 2
    },
    {
      id: 'sealing',
      title: 'Blockchain Sealing',
      description: 'Permanent sealing on blockchain for authenticity',
      timestamp: sealedAt,
      icon: Shield,
      status: 'completed',
      details: [
        'All data uploaded to IPFS',
        'Smart contract executed successfully',
        'Transaction hash recorded',
        'Immutable record created'
      ],
      photos: 0,
      documents: 1
    }
  ]

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStepIcon = (step: TimelineStep) => {
    const IconComponent = step.icon
    const baseClasses = "h-5 w-5"
    
    switch (step.status) {
      case 'completed':
        return <IconComponent className={`${baseClasses} text-green-600`} />
      case 'current':
        return <IconComponent className={`${baseClasses} text-orange-600`} />
      case 'upcoming':
        return <IconComponent className={`${baseClasses} text-gray-400`} />
      default:
        return <IconComponent className={`${baseClasses} text-gray-400`} />
    }
  }

  const getStepBorderColor = (step: TimelineStep) => {
    switch (step.status) {
      case 'completed':
        return 'border-green-200 bg-green-50'
      case 'current':
        return 'border-orange-200 bg-orange-50'
      case 'upcoming':
        return 'border-gray-200 bg-gray-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="relative">
        {/* Vertical Timeline Line */}
        <div className="absolute left-6 top-12 bottom-0 w-px bg-gray-200"></div>
        
        <div className="space-y-8">
          {timelineSteps.map((step, index) => (
            <div key={step.id} className="relative flex gap-6">
              {/* Timeline Icon */}
              <div className={`flex-shrink-0 w-12 h-12 rounded-full border-2 ${getStepBorderColor(step)} flex items-center justify-center z-10`}>
                {step.status === 'completed' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  getStepIcon(step)
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0 pb-8">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {step.title}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar className="h-3 w-3" />
                    {formatTimestamp(step.timestamp)}
                  </div>
                </div>

                <p className="text-gray-600 mb-4">
                  {step.description}
                </p>

                {/* Step Details */}
                {step.details && step.details.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Processing Details
                    </h4>
                    <ul className="space-y-1">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="text-sm text-gray-600 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0"></div>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Media & Documents */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {step.photos && step.photos > 0 && (
                    <div className="flex items-center gap-1">
                      <Camera className="h-4 w-4" />
                      <span>{step.photos} photo{step.photos !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  
                  {step.documents && step.documents > 0 && (
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>{step.documents} document{step.documents !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">
              {timelineSteps.filter(s => s.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Steps Completed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {timelineSteps.reduce((sum, s) => sum + (s.photos || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Photos Recorded</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {Math.round((new Date(sealedAt).getTime() - new Date(harvestDate).getTime()) / (1000 * 60 * 60 * 24))}
            </div>
            <div className="text-sm text-gray-600">Days Tracked</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProvenanceTimeline