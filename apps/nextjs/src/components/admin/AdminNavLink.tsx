import Link from 'next/link'
import { useFarmerRegistry } from '@/hooks/useFarmerRegistry'
import { Shield } from 'lucide-react'

export function AdminNavLink() {
  const { isVerifier, isInitialized } = useFarmerRegistry()

  if (!isInitialized || !isVerifier) {
    return null
  }

  return (
    <Link 
      href="/admin/dashboard"
      className="flex items-center space-x-2 px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
    >
      <Shield className="w-4 h-4" />
      <span className="text-sm font-medium">Admin Dashboard</span>
    </Link>
  )
}