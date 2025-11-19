"use client"

import { useState, useEffect, ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { UserRow, SubscriptionRow } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Home,
  Zap,
  BarChart3,
  Plug,
  Settings,
  HelpCircle,
  LogOut,
  Search,
  Bell,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Workflows', href: '/dashboard/workflows', icon: Zap },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Intégrations', href: '/dashboard/integrations', icon: Plug },
  { name: 'Paramètres', href: '/dashboard/settings', icon: Settings },
  { name: "Centre d'aide", href: '/dashboard/help', icon: HelpCircle },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<UserRow | null>(null)
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [language, setLanguage] = useState<'fr' | 'en'>('fr')
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        router.push('/login')
        return
      }

      // Fetch user data
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (userData) {
        setUser(userData as UserRow)
        setLanguage(userData.language || 'fr')
      }

      // Fetch subscription
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', authUser.id)
        .single()

      if (subData) {
        setSubscription(subData as SubscriptionRow)
      }

      // Fetch unread notifications count
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', authUser.id)
        .eq('is_read', false)

      setUnreadNotifications(count || 0)
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const handleLanguageToggle = async () => {
    const newLanguage = language === 'fr' ? 'en' : 'fr'
    setLanguage(newLanguage)

    // Save to database
    if (user) {
      await supabase
        .from('users')
        .update({ language: newLanguage })
        .eq('id', user.id)
    }

    // Save to localStorage
    localStorage.setItem('language', newLanguage)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const getUserInitials = () => {
    if (!user?.full_name) return '?'
    const names = user.full_name.split(' ')
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
    }
    return names[0][0].toUpperCase()
  }

  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs = [{ name: 'Dashboard', href: '/dashboard' }]

    if (segments.length > 1) {
      for (let i = 1; i < segments.length; i++) {
        const name = segments[i].charAt(0).toUpperCase() + segments[i].slice(1)
        const href = '/' + segments.slice(0, i + 1).join('/')
        breadcrumbs.push({ name, href })
      }
    }

    return breadcrumbs
  }

  const getPlanBadge = () => {
    if (!subscription?.plan_type) return null

    const colors = {
      starter: 'bg-blue-100 text-blue-700',
      premium: 'bg-purple-100 text-purple-700',
    }

    return (
      <Badge className={colors[subscription.plan_type]}>
        {subscription.plan_type === 'starter' ? 'Starter' : 'Premium'}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-60 lg:flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200">
          {/* Logo */}
          <div className="flex items-center h-16 px-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Synapsys</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-blue-50 text-primary'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User Section */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-primary text-white">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.full_name || 'User'}
                </p>
                {getPlanBadge()}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="p-1"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">Synapsys</span>
        </div>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-white">
          <nav className="px-4 py-20 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 text-base font-medium rounded-lg',
                    isActive
                      ? 'bg-blue-50 text-primary'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <item.icon className="h-6 w-6" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <div className="lg:pl-60">
        {/* Top Bar */}
        <div className="sticky top-0 z-20 flex items-center h-16 px-4 bg-white border-b border-gray-200 gap-4">
          {/* Breadcrumbs */}
          <div className="hidden md:flex items-center flex-1 gap-2 text-sm">
            {getBreadcrumbs().map((crumb, index) => (
              <div key={crumb.href} className="flex items-center gap-2">
                {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
                <Link
                  href={crumb.href}
                  className={cn(
                    'hover:text-primary transition-colors',
                    index === getBreadcrumbs().length - 1
                      ? 'text-gray-900 font-medium'
                      : 'text-gray-600'
                  )}
                >
                  {crumb.name}
                </Link>
              </div>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden lg:block flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={language === 'fr' ? 'Rechercher...' : 'Search...'}
                className="pl-10"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLanguageToggle}
              className="text-lg"
            >
              {language === 'fr' ? '🇫🇷' : '🇬🇧'}
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="px-4 py-2 font-semibold">Notifications</div>
                <DropdownMenuSeparator />
                <div className="px-4 py-6 text-center text-sm text-gray-600">
                  Aucune notification
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/notifications" className="cursor-pointer">
                    Voir tout
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden lg:flex">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-white text-xs">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings/profile" className="cursor-pointer">
                    Mon profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="cursor-pointer">
                    Paramètres
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings/billing" className="cursor-pointer">
                    Facturation
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
