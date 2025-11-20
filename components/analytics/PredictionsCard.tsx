"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, Target, Lightbulb } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts'
import { format, addDays } from 'date-fns'
import { fr } from 'date-fns/locale'

interface PredictionsCardProps {
  projectedRevenue: number
  monthlyGoal: number
  confidence: 'high' | 'medium' | 'low'
  probability: number
  recommendations: string[]
  historicalData: { date: string; value: number }[]
  projectionData: { date: string; value: number; lower: number; upper: number }[]
}

const CONFIDENCE_CONFIG = {
  high: { label: 'Haute', color: 'bg-green-100 text-green-700', icon: '✓' },
  medium: { label: 'Moyenne', color: 'bg-orange-100 text-orange-700', icon: '~' },
  low: { label: 'Faible', color: 'bg-red-100 text-red-700', icon: '!' },
}

export default function PredictionsCard({
  projectedRevenue,
  monthlyGoal,
  confidence,
  probability,
  recommendations,
  historicalData,
  projectionData,
}: PredictionsCardProps) {
  const confidenceConfig = CONFIDENCE_CONFIG[confidence]
  const progressPercentage = (projectedRevenue / monthlyGoal) * 100

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium mb-1">
            {format(new Date(payload[0].payload.date), 'dd MMM', { locale: fr })}
          </p>
          {payload.map((entry: any) => (
            <p key={entry.dataKey} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Projections Fin de Mois
          </CardTitle>
          <Badge className={confidenceConfig.color}>
            {confidenceConfig.icon} Confiance {confidenceConfig.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Projected revenue */}
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-gray-600">CA Projeté</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {formatCurrency(projectedRevenue)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Objectif</p>
              <p className="text-2xl font-semibold text-gray-700 mt-1">
                {formatCurrency(monthlyGoal)}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progression vers l&apos;objectif</span>
              <span className="font-medium">{progressPercentage.toFixed(0)}%</span>
            </div>
            <Progress
              value={Math.min(progressPercentage, 100)}
              className="h-3"
            />
          </div>

          {/* Probability */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700">
              Probabilité d&apos;atteindre l&apos;objectif
            </span>
            <Badge
              variant="outline"
              className={
                probability >= 80
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : probability >= 50
                  ? 'bg-orange-50 text-orange-700 border-orange-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }
            >
              {probability}%
            </Badge>
          </div>
        </div>

        {/* Predictive chart */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">
            Projection basée sur les tendances actuelles
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={[...historicalData, ...projectionData]}
                margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(new Date(date), 'dd MMM', { locale: fr })}
                  stroke="#6B7280"
                />
                <YAxis
                  tickFormatter={(value) => formatCurrency(value).replace(' €', '')}
                  stroke="#6B7280"
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Historical data line */}
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#2563EB"
                  strokeWidth={2}
                  dot={false}
                  name="Historique"
                />
                
                {/* Confidence area for projections */}
                <Area
                  type="monotone"
                  dataKey="upper"
                  stroke="none"
                  fill="#93C5FD"
                  fillOpacity={0.3}
                  name="Limite haute"
                />
                <Area
                  type="monotone"
                  dataKey="lower"
                  stroke="none"
                  fill="#93C5FD"
                  fillOpacity={0.3}
                  name="Limite basse"
                />
                
                {/* Today marker */}
                <ReferenceLine
                  x={historicalData[historicalData.length - 1]?.date}
                  stroke="#6B7280"
                  strokeDasharray="3 3"
                  label={{ value: "Aujourd'hui", position: 'top', fill: '#6B7280' }}
                />
                
                {/* Goal line */}
                <ReferenceLine
                  y={monthlyGoal}
                  stroke="#10B981"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  label={{ value: 'Objectif', position: 'right', fill: '#10B981' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            Recommandations pour atteindre l&apos;objectif
          </div>
          <div className="space-y-2">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg"
              >
                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-xs font-medium text-blue-700">
                  {idx + 1}
                </div>
                <p className="text-sm text-blue-900">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
