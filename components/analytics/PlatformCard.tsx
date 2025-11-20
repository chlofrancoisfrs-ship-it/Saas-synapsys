"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Heart, TrendingUp, DollarSign, TrendingDown, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlatformStats {
  views: number
  engagement: number
  engagementRate: number
  revenue: number
  change: number
}

interface PlatformCardProps {
  platform: 'youtube' | 'linkedin' | 'instagram' | 'other'
  stats: PlatformStats
  sparklineData: number[]
  onViewDetails: () => void
}

const PLATFORM_CONFIG = {
  youtube: { name: 'YouTube', color: '#FF0000', icon: '▶️' },
  linkedin: { name: 'LinkedIn', color: '#0A66C2', icon: '💼' },
  instagram: { name: 'Instagram', color: '#E4405F', icon: '📸' },
  other: { name: 'Autre', color: '#6B7280', icon: '🔗' },
}

export default function PlatformCard({ platform, stats, sparklineData, onViewDetails }: PlatformCardProps) {
  const config = PLATFORM_CONFIG[platform]
  const isPositive = stats.change >= 0

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{config.icon}</span>
            <CardTitle className="text-lg">{config.name}</CardTitle>
          </div>
          <Badge
            variant={isPositive ? "default" : "destructive"}
            className={cn(isPositive ? "bg-green-100 text-green-700" : "")}
          >
            {isPositive ? '↗️' : '↘️'} {stats.change > 0 ? '+' : ''}{stats.change.toFixed(1)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Eye className="h-4 w-4" />
              <span>Vues</span>
            </div>
            <p className="text-xl font-bold">{stats.views.toLocaleString('fr-FR')}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Heart className="h-4 w-4" />
              <span>Engagement</span>
            </div>
            <p className="text-xl font-bold">{stats.engagement.toLocaleString('fr-FR')}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp className="h-4 w-4" />
              <span>Taux</span>
            </div>
            <p className="text-xl font-bold">{stats.engagementRate.toFixed(1)}%</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="h-4 w-4" />
              <span>Revenus</span>
            </div>
            <p className="text-xl font-bold">{stats.revenue.toLocaleString('fr-FR')} €</p>
          </div>
        </div>

        <div className="h-12 flex items-end gap-0.5">
          {sparklineData.map((val, idx) => {
            const max = Math.max(...sparklineData)
            const height = max > 0 ? (val / max) * 100 : 0
            return (
              <div
                key={idx}
                className="flex-1 rounded-t"
                style={{
                  height: height + '%',
                  backgroundColor: config.color,
                  opacity: 0.6 + (idx / sparklineData.length) * 0.4,
                }}
              />
            )
          })}
        </div>

        <Button variant="outline" className="w-full" onClick={onViewDetails}>
          Voir détails
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
