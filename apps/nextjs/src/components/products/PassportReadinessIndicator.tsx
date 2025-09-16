import React from 'react'
import { CheckCircle, AlertTriangle, Clock, XCircle } from 'lucide-react'
import { type SealReadinessCheck } from '@/lib/validation/PassportReadinessService'

interface PassportReadinessIndicatorProps {
  readinessCheck: SealReadinessCheck
  compact?: boolean
  className?: string
}

export function PassportReadinessIndicator({ 
  readinessCheck, 
  compact = false, 
  className = '' 
}: PassportReadinessIndicatorProps) {
  const getOverallStatus = () => {
    if (readinessCheck.overallReady) {
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        label: 'Ready to Seal',
        description: 'All requirements met'
      }
    }

    const errorCount = readinessCheck.warnings.filter(w => w.includes('required')).length
    if (errorCount > 0) {
      return {
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        label: 'Cannot Seal',
        description: `${errorCount} issue${errorCount !== 1 ? 's' : ''} to fix`
      }
    }

    return {
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      label: 'Minor Issues',
      description: 'Review warnings'
    }
  }

  const status = getOverallStatus()
  const Icon = status.icon

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <Icon className={`h-4 w-4 ${status.color}`} />
        <span className={`text-sm font-medium ${status.color}`}>
          {status.label}
        </span>
      </div>
    )
  }

  return (
    <div className={`p-3 rounded-lg border ${status.bgColor} ${status.borderColor} ${className}`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 ${status.color} mt-0.5 flex-shrink-0`} />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className={`text-sm font-semibold ${status.color}`}>
              {status.label}
            </h4>
          </div>
          <p className={`text-xs ${status.color.replace('600', '700')}`}>
            {status.description}
          </p>
          
          {/* Detailed checks */}
          <div className="mt-2 space-y-1">
            <ReadinessCheckItem 
              label="Harvest Data" 
              passed={readinessCheck.hasHarvestData} 
            />
            <ReadinessCheckItem 
              label="Processing Steps" 
              passed={readinessCheck.hasMinimumProcessingSteps} 
            />
            <ReadinessCheckItem 
              label="Photos" 
              passed={readinessCheck.hasRequiredPhotos} 
            />
            <ReadinessCheckItem 
              label="Descriptions" 
              passed={readinessCheck.hasValidDescriptions} 
            />
            <ReadinessCheckItem 
              label="Timing" 
              passed={readinessCheck.meetsTimingRequirements}
              optional 
            />
          </div>

          {/* Warnings */}
          {readinessCheck.warnings.length > 0 && (
            <div className="mt-2 pt-2 border-t border-current border-opacity-20">
              <div className="space-y-0.5">
                {readinessCheck.warnings.slice(0, 3).map((warning, index) => (
                  <p key={index} className={`text-xs ${status.color.replace('600', '700')}`}>
                    • {warning}
                  </p>
                ))}
                {readinessCheck.warnings.length > 3 && (
                  <p className={`text-xs ${status.color.replace('600', '500')}`}>
                    +{readinessCheck.warnings.length - 3} more
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ReadinessCheckItem({ 
  label, 
  passed, 
  optional = false 
}: { 
  label: string
  passed: boolean
  optional?: boolean 
}) {
  const Icon = passed ? CheckCircle : XCircle
  const color = passed ? 'text-green-600' : optional ? 'text-yellow-600' : 'text-red-600'

  return (
    <div className="flex items-center gap-1.5">
      <Icon className={`h-3 w-3 ${color}`} />
      <span className={`text-xs ${color}`}>
        {label} {optional && '(optional)'}
      </span>
    </div>
  )
}

export default PassportReadinessIndicator