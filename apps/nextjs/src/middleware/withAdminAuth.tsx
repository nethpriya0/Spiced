import React from 'react'
import AdminAuth from '@/components/admin/AdminAuth'

interface WithAdminAuthOptions {
  requiredRole?: 'admin' | 'verifier'
}

export function withAdminAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAdminAuthOptions = {}
): React.ComponentType<P> {
  return function AdminProtectedComponent(props: P) {
    return (
      <AdminAuth requiredRole={options.requiredRole}>
        <Component {...props} />
      </AdminAuth>
    )
  }
}

export default withAdminAuth