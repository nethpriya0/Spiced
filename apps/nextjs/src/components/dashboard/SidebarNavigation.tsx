import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Button } from '@/components/ui/Button'
import { Separator } from '@/components/ui/separator'
import { UserProfileCard } from './UserProfileCard'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'
import { 
  Home, 
  Package, 
  Award, 
  Users, 
  ShoppingCart,
  LogOut,
  Menu,
  X,
  Shield
} from 'lucide-react'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  disabled?: boolean
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home
  },
  {
    name: 'My Products',
    href: '/products',
    icon: Package,
    disabled: false // Enable for improved dashboard experience
  },
  {
    name: 'My Credentials',
    href: '/credentials', 
    icon: Award,
    disabled: true // Future Epic 5 functionality
  },
  {
    name: 'Community Hub',
    href: '/community',
    icon: Users,
    disabled: true // Future Epic 5 functionality
  },
  {
    name: 'My Orders & Disputes',
    href: '/orders',
    icon: ShoppingCart,
    disabled: true // Future Epic 4 functionality
  },
  {
    name: 'Admin Portal',
    href: '/admin',
    icon: Shield,
    disabled: false // Story 1.3 implementation
  }
]

interface SidebarNavigationProps {
  className?: string
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ className }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-white shadow-lg">
      {/* Logo */}
      <div className="flex items-center justify-center p-6">
        <Link href="/">
          <h1 className="text-2xl font-bold text-[#2e6a4f]">
            <span className="text-[#d87c49]">Spice</span> Platform
          </h1>
        </Link>
      </div>

      <Separator className="mx-4" />

      {/* User Profile */}
      <UserProfileCard />

      <Separator className="mx-4" />

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-2 pb-2">
          Actions
        </div>
        
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = router.pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.disabled ? '#' : item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#2e6a4f] text-white"
                  : item.disabled
                  ? "text-slate-400 cursor-not-allowed"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              )}
              onClick={(e) => {
                if (item.disabled) {
                  e.preventDefault()
                }
              }}
            >
              <Icon className="h-5 w-5" />
              {item.name}
              {item.disabled && (
                <span className="ml-auto text-xs text-slate-400">Soon</span>
              )}
            </Link>
          )
        })}
      </nav>

      <Separator className="mx-4" />

      {/* Account Actions */}
      <div className="p-4 space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-2 pb-2">
          Account
        </div>
        
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Desktop sidebar */}
      <aside className={cn("hidden lg:flex lg:w-64 lg:flex-col", className)}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {isMobileMenuOpen && (
        <>
          <div 
            className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 z-50 h-full w-64">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  )
}