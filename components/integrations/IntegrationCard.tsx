"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PlatformType, PlatformConfig } from '@/lib/integrations/platforms'
import { Plug, Unplug, RefreshCw, Lock, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

interface IntegrationCardProps {
  platform: PlatformConfig
  isConnected: boolean
  data?: {
    account_name?: string
    stats?: Record<string, any>
    last_sync?: string
  }
  userPlan: 'starter' | 'premium'
  onConnect: () => void
  onDisconnect: () => void
  onSync: () => Promise<void>
}

export default function IntegrationCard({
  platform,
  isConnected,
  data,
  userPlan,
  onConnect,
  onDisconnect,
  onSync,
}: IntegrationCardProps) {
  const [isSyncing, setIsSyncing] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const canConnect = !platform.isPremiumOnly || userPlan === 'premium'

  const handleSync = async () => {
    try {
      setIsSyncing(true)
      await onSync()
    } catch (error) {
      console.error('Sync error:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir déconnecter ${platform.name} ?`)) {
      return
    }

    try {
      setIsDisconnecting(true)
      await onDisconnect()
    } catch (error) {
      console.error('Disconnect error:', error)
    } finally {
      setIsDisconnecting(false)
    }
  }

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all hover:shadow-lg',
      !canConnect && 'opacity-60'
    )}>
      {/* Premium Badge */}
      {platform.isPremiumOnly && (
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-purple-100 text-purple-700">
            <Lock className="h-3 w-3 mr-1" />
            Premium
          </Badge>
        </div>
      )}

      <CardHeader>
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div
            className="h-12 w-12 rounded-lg flex items-center justify-center text-2xl shrink-0"
            style={{ backgroundColor: `${platform.color}15` }}
          >
            {platform.logo}
          </div>

          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2">
              {platform.name}
              {isConnected && (
                <Badge className="bg-green-100 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connecté
                </Badge>
              )}
              {!isConnected && (
                <Badge variant="outline" className="text-gray-600">
                  Non connecté
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              {platform.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Connection Info */}
        {isConnected && data ? (
          <div className="space-y-3">
            {data.account_name && (
              <div className="text-sm">
                <span className="font-medium">Compte : </span>
                <span className="text-gray-600">{data.account_name}</span>
              </div>
            )}

            {data.stats && Object.keys(data.stats).length > 0 && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                {Object.entries(data.stats).slice(0, 4).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <div className="text-gray-500 text-xs">{key}</div>
                    <div className="font-medium">{value}</div>
                  </div>
                ))}
              </div>
            )}

            {data.last_sync && (
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Dernière sync : {formatDistanceToNow(new Date(data.last_sync), { addSuffix: true, locale: fr })}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Connectez {platform.name} pour :
            </p>
            <ul className="space-y-1">
              {platform.benefits.slice(0, 3).map((benefit, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {!isConnected ? (
            <Button
              onClick={onConnect}
              disabled={!canConnect}
              className="w-full"
              style={{ backgroundColor: canConnect ? platform.color : undefined }}
            >
              <Plug className="h-4 w-4 mr-2" />
              Connecter {platform.name}
            </Button>
          ) : (
            <>
              <Button
                onClick={handleSync}
                disabled={isSyncing}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className={cn('h-4 w-4 mr-2', isSyncing && 'animate-spin')} />
                {isSyncing ? 'Sync...' : 'Synchroniser'}
              </Button>
              <Button
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                variant="outline"
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Unplug className="h-4 w-4 mr-2" />
                Déconnecter
              </Button>
            </>
          )}
        </div>

        {!canConnect && (
          <p className="text-xs text-center text-gray-500 mt-2">
            Passez à Premium pour connecter cette plateforme
          </p>
        )}
      </CardContent>
    </Card>
  )
}
