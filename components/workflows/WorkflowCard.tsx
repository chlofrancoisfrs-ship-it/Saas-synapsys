"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { WorkflowConfig } from '@/lib/workflows/workflows'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Play, Settings, FileText, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WorkflowCardProps {
  workflow: WorkflowConfig
  isActive: boolean
  userPlan: 'starter' | 'premium'
  lastRun?: string
  nextRun?: string
  stats?: Record<string, string | number>
  onToggle: (active: boolean) => Promise<void>
  onConfigure: () => void
  onExecute?: () => void
  onViewReport?: () => void
}

export default function WorkflowCard({
  workflow,
  isActive,
  userPlan,
  lastRun,
  nextRun,
  stats,
  onToggle,
  onConfigure,
  onExecute,
  onViewReport,
}: WorkflowCardProps) {
  const [isTogglingworkflow, setIsToggling] = useState(false)
  const Icon = workflow.icon

  const canAccess = !workflow.isPremiumOnly || userPlan === 'premium'
  const canExecuteNow = workflow.allowedFrequencies.includes('on_demand')

  const handleToggle = async (checked: boolean) => {
    if (!canAccess) return
    
    try {
      setIsToggling(true)
      await onToggle(checked)
    } catch (error) {
      console.error('Error toggling workflow:', error)
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all hover:shadow-lg',
      !canAccess && 'opacity-60'
    )}>
      {/* Premium Badge */}
      {workflow.isPremiumOnly && (
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-purple-100 text-purple-700">
            <Lock className="h-3 w-3 mr-1" />
            Premium
          </Badge>
        </div>
      )}

      <CardHeader>
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className="h-12 w-12 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${workflow.color}15` }}
          >
            <Icon className="h-6 w-6" style={{ color: workflow.color }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-lg">{workflow.name}</CardTitle>
              <Switch
                checked={isActive}
                onCheckedChange={handleToggle}
                disabled={!canAccess || isToggling}
              />
            </div>
            <CardDescription className="mt-1">
              {workflow.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center gap-2">
          <Badge variant={isActive ? 'default' : 'outline'} className={cn(
            isActive && 'bg-green-100 text-green-700'
          )}>
            {isActive ? 'Actif' : 'Inactif'}
          </Badge>
          {isActive && (
            <span className="text-xs text-gray-500">
              Fréquence : {workflow.defaultFrequency === 'daily' ? 'Quotidienne' : workflow.defaultFrequency === 'weekly' ? 'Hebdomadaire' : 'On-demand'}
            </span>
          )}
        </div>

        {/* Execution Info */}
        <div className="text-sm space-y-1">
          {lastRun && (
            <div className="text-gray-600">
              Dernière exécution : {formatDistanceToNow(new Date(lastRun), { addSuffix: true, locale: fr })}
            </div>
          )}
          {!lastRun && (
            <div className="text-gray-500 italic">
              Jamais exécuté
            </div>
          )}
          {isActive && nextRun && (
            <div className="text-gray-600">
              Prochaine exécution : {formatDistanceToNow(new Date(nextRun), { addSuffix: true, locale: fr })}
            </div>
          )}
        </div>

        {/* Stats */}
        {stats && Object.keys(stats).length > 0 && (
          <div className="grid grid-cols-3 gap-2 pt-2 border-t">
            {workflow.statsLabels.slice(0, 3).map((label, index) => {
              const statKey = Object.keys(stats)[index]
              const statValue = statKey ? stats[statKey] : '-'
              
              return (
                <div key={label} className="text-center">
                  <div className="text-xs text-gray-500">{label}</div>
                  <div className="font-semibold text-sm" style={{ color: workflow.color }}>
                    {statValue}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        {lastRun && onViewReport && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onViewReport}
          >
            <FileText className="h-4 w-4 mr-2" />
            Voir le rapport
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={onConfigure}
          disabled={!canAccess}
        >
          <Settings className="h-4 w-4 mr-2" />
          Configurer
        </Button>

        {canExecuteNow && onExecute && (
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={onExecute}
            disabled={!canAccess || !isActive}
            style={{ backgroundColor: canAccess && isActive ? workflow.color : undefined }}
          >
            <Play className="h-4 w-4 mr-2" />
            Exécuter
          </Button>
        )}
      </CardFooter>

      {!canAccess && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
          <div className="text-center p-4">
            <Lock className="h-8 w-8 mx-auto text-purple-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">Passez à Premium</p>
            <p className="text-xs text-gray-600">pour débloquer ce workflow</p>
          </div>
        </div>
      )}
    </Card>
  )
}
