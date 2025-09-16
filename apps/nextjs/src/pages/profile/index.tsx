import React from 'react'
import { withAuth } from '@/middleware/withAuth'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

const ProfilePage: React.FC = () => {
  return (
    <DashboardLayout title="My Public Profile">
      <div className="flex-1 p-6 bg-slate-50">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
            <div className="text-6xl mb-4">👤</div>
            <h1 className="text-2xl font-bold text-slate-900 mb-4">
              Public Profile - Coming Soon
            </h1>
            <p className="text-slate-600 mb-6">
              This feature will be available in Epic 3: Marketplace Discovery & Verification. 
              Here you&apos;ll be able to view and manage your public farmer profile.
            </p>
            <div className="text-sm text-slate-500">
              Epic 3 Features:
            </div>
            <ul className="text-sm text-slate-500 mt-2 space-y-1">
              <li>• Public farmer profile display</li>
              <li>• Showcase verified products</li>
              <li>• Display reputation and reviews</li>
              <li>• Share farming story and background</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default withAuth(ProfilePage)