"use client"

import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import CountUp from 'react-countup'

interface KPICardProps {
  title: string
  value: number
  format?: 'currency' | 'number' | 'percent'
  change?: number
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ElementType
  color: string
  subtitle?: string
  sparklineData?: number[]
}

export default function KPICard({
  title,
  value,
  format = 'number',
  change,
  changeType = 'neutral',
  icon: Icon,
  color,
  subtitle,
  sparklineData,
}: KPICardProps) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val)
      case 'percent':
        const fixed = val.toFixed(1)
        return `${fixed}%`
      default:
        return new Intl.NumberFormat('fr-FR').format(val)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <div
            className="h-10 w-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: color + '15' }}
          >
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold text-gray-900">
              {format === 'currency' ? (
                formatValue(value)
              ) : (
                <CountUp
                  end={value}
                  duration={1.5}
                  separator=" "
                  decimals={format === 'percent' ? 1 : 0}
                  suffix={format === 'percent' ? '%' : ''}
                />
              )}
            </p>
            {change !== undefined && (
              <div
                className={cn(
                  "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded",
                  changeType === 'positive' && "text-green-700 bg-green-50",
                  changeType === 'negative' && "text-red-700 bg-red-50",
                  changeType === 'neutral' && "text-gray-700 bg-gray-50"
                )}
              >
                {changeType === 'positive' && <TrendingUp className="h-3 w-3" />}
                {changeType === 'negative' && <TrendingDown className="h-3 w-3" />}
                <span>{change > 0 ? '+' : ''}{change.toFixed(1)}%</span>
              </div>
            )}
          </div>

          {subtitle && (
            <p className="text-sm text-gray-600">{subtitle}</p>
          )}

          {sparklineData && sparklineData.length > 0 && (
            <div className="mt-3 h-12 flex items-end gap-0.5">
              {sparklineData.map((val, idx) => {
                const max = Math.max(...sparklineData)
                const height = max > 0 ? (val / max) * 100 : 0
                return (
                  <div
                    key={idx}
                    className="flex-1 rounded-t"
                    style={{
                      height: height + '%',
                      backgroundColor: color,
                      opacity: 0.6 + (idx / sparklineData.length) * 0.4,
                    }}
                  />
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
