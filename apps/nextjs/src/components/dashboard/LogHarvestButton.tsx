import React from 'react'
import { useRouter } from 'next/router'
import { Button } from '@/components/ui/Button'
import { Plus, Leaf } from 'lucide-react'

interface LogHarvestButtonProps {
  className?: string
  onClick?: () => void
}

export const LogHarvestButton: React.FC<LogHarvestButtonProps> = ({ 
  className, 
  onClick 
}) => {
  const router = useRouter()
  
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      // Navigate to the harvest logging page
      router.push('/harvest/log-new')
    }
  }

  return (
    <div className={`bg-gradient-to-r from-[#2e6a4f] to-[#1e4a37] rounded-lg shadow-lg ${className || ''}`}>
      <div className="p-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Leaf className="h-8 w-8 text-[#2e6a4f]" />
              </div>
              <div className="absolute -top-1 -right-1 h-6 w-6 bg-[#d87c49] rounded-full flex items-center justify-center">
                <Plus className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-white mb-2">
            Ready to Log Your Harvest?
          </h2>
          
          <p className="text-white/80 text-sm mb-6 leading-relaxed">
            Create digital passports for your spice harvest and build trust with buyers through blockchain transparency.
          </p>
          
          <Button 
            size="lg" 
            className="bg-[#d87c49] hover:bg-[#d87c49]/90 text-white font-semibold px-8 py-3 text-base shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={handleClick}
          >
            <Plus className="mr-2 h-5 w-5" />
            LOG NEW HARVEST
          </Button>
          
          <div className="mt-4 text-xs text-white/60">
            Digital Passport Creation Now Available!
          </div>
        </div>
      </div>
    </div>
  )
}