"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FunnelStep {
  name: string
  value: number
  percentage: number
  conversionRate?: number
}

interface FunnelChartProps {
  steps: FunnelStep[]
  previousSteps?: FunnelStep[]
}

export default function FunnelChart({ steps, previousSteps }: FunnelChartProps) {
  const maxValue = steps[0]?.value || 1

  const getChangeType = (currentStep: FunnelStep, previousStep?: FunnelStep) => {
    if (!previousStep) return null
    const change = ((currentStep.value - previousStep.value) / previousStep.value) * 100
    return {
      value: change,
      isPositive: change >= 0,
    }
  }

  const identifyBottlenecks = () => {
    const bottlenecks: string[] = []
    
    for (let i = 1; i < steps.length; i++) {
      const conversionRate = steps[i].conversionRate || 0
      const previousConversionRate = previousSteps?.[i]?.conversionRate || 0
      
      if (previousConversionRate > 0 && conversionRate < previousConversionRate) {
        const drop = ((previousConversionRate - conversionRate) / previousConversionRate) * 100
        const dropFixed = drop.toFixed(1)
        if (drop > 10) {
          bottlenecks.push(
            steps[i-1].name + ' → ' + steps[i].name + ' a chuté de ' + dropFixed + '%'
          )
        }
      }
    }
    
    return bottlenecks
  }

  const bottlenecks = identifyBottlenecks()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analyse de l&apos;Entonnoir de Conversion</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative space-y-2">
            {steps.map((step, index) => {
              const widthPercentage = (step.value / maxValue) * 100
              const previousStep = previousSteps?.[index]
              const change = getChangeType(step, previousStep)
              
              return (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{step.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">
                        {step.value.toLocaleString('fr-FR')}
                      </span>
                      <span className="text-gray-500">
                        ({step.percentage.toFixed(1)}%)
                      </span>
                      {change && (
                        <Badge
                          variant={change.isPositive ? "default" : "destructive"}
                          className={cn(
                            "text-xs",
                            change.isPositive && "bg-green-100 text-green-700"
                          )}
                        >
                          {change.isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                          {change.value > 0 ? '+' : ''}{change.value.toFixed(1)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="relative h-16 flex items-center">
                    <div
                      className="h-full rounded transition-all duration-500"
                      style={{
                        width: widthPercentage + '%',
                        background: 'linear-gradient(90deg, hsl(' + (220 - index * 30) + ', 80%, ' + (60 - index * 5) + '%) 0%, hsl(' + (160 - index * 30) + ', 70%, ' + (55 - index * 5) + '%) 100%)',
                      }}
                    >
                      <div className="h-full flex items-center justify-center text-white font-medium text-sm">
                        {step.percentage.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  
                  {index < steps.length - 1 && step.conversionRate !== undefined && (
                    <div className="flex items-center justify-center text-xs text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        ↓ {step.conversionRate.toFixed(1)}% de conversion
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {bottlenecks.length > 0 && (
            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-orange-900 mb-2">
                    Goulots d&apos;étranglement identifiés
                  </p>
                  <ul className="space-y-1 text-sm text-orange-800">
                    {bottlenecks.map((bottleneck, idx) => (
                      <li key={idx}>⚠️ {bottleneck}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {previousSteps && (
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-3">
                Comparaison avec la période précédente
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {steps.map((step, idx) => {
                  const prev = previousSteps[idx]
                  const change = prev ? ((step.value - prev.value) / prev.value) * 100 : 0
                  const isImproved = change >= 0
                  
                  return (
                    <div key={idx} className="text-center">
                      <p className="text-xs text-gray-600 mb-1">{step.name}</p>
                      <div className={cn(
                        "text-sm font-medium",
                        isImproved ? "text-green-600" : "text-red-600"
                      )}>
                        {change > 0 ? '+' : ''}{change.toFixed(1)}%
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
