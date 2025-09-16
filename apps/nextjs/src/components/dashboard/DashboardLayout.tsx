import React from 'react'
import Head from 'next/head'
import { SidebarNavigation } from './SidebarNavigation'
import { DashboardMain } from './DashboardMain'
import { AlertTriangle, Shield } from 'lucide-react'

interface DashboardLayoutProps {
  children?: React.ReactNode
  title?: string
  showVerificationBanner?: boolean
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children,
  title = "Dashboard",
  showVerificationBanner = false
}) => {
  return (
    <>
      <Head>
        <title>{title} - Spice Platform</title>
        <meta name="description" content="Farmer dashboard for managing spice products and passports" />
      </Head>
      
      <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
        <SidebarNavigation />
        
        <div className="flex-1 flex flex-col min-h-0">
          {showVerificationBanner && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-200 p-4 shadow-sm">
              <div className="flex items-center space-x-3 animate-slide-in-up">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-yellow-800">
                    Account Verification Pending
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your account needs to be verified by an administrator before you can access all features. 
                    Please contact support for verification.
                  </p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-full">
                  <Shield className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </div>
          )}
          
          {children || <DashboardMain />}
        </div>
      </div>
    </>
  )
}