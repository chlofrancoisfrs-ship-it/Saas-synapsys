"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { UserRow, SubscriptionRow } from '@/types/database'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import IntegrationCard from '@/components/integrations/IntegrationCard'
import ConnectionModal from '@/components/integrations/ConnectionModal'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { PLATFORMS, PlatformType, PlatformConfig } from '@/lib/integrations/platforms'
import { Skeleton } from '@/components/ui/skeleton'
import { Plug, TrendingUp } from 'lucide-react'
import confetti from 'canvas-confetti'

interface Integration {
  id: string
  user_id: string
  platform: PlatformType
  access_token: string
  is_active: boolean
  config: any
  last_sync: string
  created_at: string
}

export default function IntegrationsPage() {
  const [user, setUser] = useState<UserRow | null>(null)
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null)
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformConfig | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    // Check for success/error params
    const success = searchParams.get('success')
    const error = searchParams.get('error')

    if (success) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
      // Clean URL
      router.replace('/integrations')
    }

    if (error) {
      router.replace('/integrations')
    }
  }, [searchParams])

  const fetchData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        router.push('/login')
        return
      }

      // Fetch user
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (userData) {
        setUser(userData as UserRow)
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

      // Fetch integrations
      const { data: integrationsData } = await supabase
        .from('integrations')
        .select('*')
        .eq('user_id', authUser.id)
        .eq('is_active', true)

      if (integrationsData) {
        setIntegrations(integrationsData as Integration[])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getIntegration = (platform: PlatformType) => {
    return integrations.find((i) => i.platform === platform)
  }

  const connectedCount = integrations.length
  const totalPlatforms = Object.keys(PLATFORMS).length
  const progress = (connectedCount / totalPlatforms) * 100

  const userPlan = subscription?.plan_type || 'starter'

  const handleConnect = async (platform: PlatformType, apiKey?: string) => {
    const platformConfig = PLATFORMS[platform]

    if (platformConfig.authType === 'oauth') {
      // Redirect to OAuth flow
      window.location.href = `/api/integrations/${platform}/connect`
    } else {
      // API Key flow
      try {
        const response = await fetch(`/api/integrations/${platform}/connect`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey }),
        })

        if (!response.ok) {
          throw new Error('Failed to connect')
        }

        setSelectedPlatform(null)
        fetchData()
      } catch (error) {
        console.error('Connection error:', error)
        throw error
      }
    }
  }

  const handleDisconnect = async (platform: PlatformType) => {
    try {
      const response = await fetch(`/api/integrations/${platform}/disconnect`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to disconnect')
      }

      fetchData()
    } catch (error) {
      console.error('Disconnect error:', error)
    }
  }

  const handleSync = async (platform: PlatformType) => {
    try {
      const response = await fetch(`/api/integrations/${platform}/sync`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to sync')
      }

      fetchData()
    } catch (error) {
      console.error('Sync error:', error)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const showBanner = connectedCount === 0

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Intégrations</h1>
        <p className="text-gray-600">Connectez vos plateformes pour centraliser vos données</p>
      </div>

      {/* Progress Overview */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">Progression</h3>
              <p className="text-sm text-gray-600">
                {connectedCount} sur {totalPlatforms} plateformes connectées
              </p>
            </div>
            <Badge variant={connectedCount >= 4 ? 'default' : 'outline'} className="text-lg px-4 py-2">
              {connectedCount}/{totalPlatforms}
            </Badge>
          </div>
          <Progress value={progress} className="h-3 mb-2" />
          {progress < 50 && (
            <p className="text-sm text-orange-600 flex items-center gap-2 mt-4">
              <TrendingUp className="h-4 w-4" />
              Connectez plus de plateformes pour débloquer tous les workflows
            </p>
          )}
        </CardContent>
      </Card>

      {/* First Time Banner */}
      {showBanner && (
        <Card className="mb-8 bg-gradient-to-r from-primary to-blue-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  🚀 Commencez par connecter YouTube et Stripe
                </h3>
                <p className="text-blue-50">
                  Ces 2 plateformes sont essentielles pour débloquer vos workflows
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="bg-white text-primary hover:bg-gray-100"
                  onClick={() => setSelectedPlatform(PLATFORMS.youtube)}
                >
                  <Plug className="h-4 w-4 mr-2" />
                  Connecter YouTube
                </Button>
                <Button
                  variant="outline"
                  className="bg-white text-primary hover:bg-gray-100"
                  onClick={() => setSelectedPlatform(PLATFORMS.stripe)}
                >
                  <Plug className="h-4 w-4 mr-2" />
                  Connecter Stripe
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.values(PLATFORMS).map((platform) => {
          const integration = getIntegration(platform.id)
          const isConnected = !!integration

          return (
            <IntegrationCard
              key={platform.id}
              platform={platform}
              isConnected={isConnected}
              data={integration ? {
                account_name: integration.config?.account_name || integration.config?.channel_name,
                stats: integration.config?.stats,
                last_sync: integration.last_sync,
              } : undefined}
              userPlan={userPlan}
              onConnect={() => setSelectedPlatform(platform)}
              onDisconnect={() => handleDisconnect(platform.id)}
              onSync={() => handleSync(platform.id)}
            />
          )
        })}
      </div>

      {/* Connection Modal */}
      {selectedPlatform && (
        <ConnectionModal
          platform={selectedPlatform}
          isOpen={true}
          onClose={() => setSelectedPlatform(null)}
          onConnect={(apiKey) => handleConnect(selectedPlatform.id, apiKey)}
        />
      )}
    </DashboardLayout>
  )
}
