import React from 'react'
import { withAuth } from '@/middleware/withAuth'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

const OrdersPage: React.FC = () => {
  return (
    <DashboardLayout title="My Orders & Disputes">
      <div className="flex-1 p-6 bg-slate-50">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
            <div className="text-6xl mb-4">🛒</div>
            <h1 className="text-2xl font-bold text-slate-900 mb-4">
              My Orders & Disputes - Coming Soon
            </h1>
            <p className="text-slate-600 mb-6">
              This feature will be available in Epic 4: End-to-End Transactions & Dispute Resolution. 
              Here you&apos;ll be able to manage your orders and resolve any disputes.
            </p>
            <div className="text-sm text-slate-500">
              Epic 4 Features:
            </div>
            <ul className="text-sm text-slate-500 mt-2 space-y-1">
              <li>• Track order status</li>
              <li>• Manage shipping and delivery</li>
              <li>• Handle payment processing</li>
              <li>• Resolve disputes through mediation</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default withAuth(OrdersPage)