"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, RotateCcw } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useState } from 'react'

interface RevenueData {
  date: string
  total: number
  youtube: number
  linkedin: number
  instagram: number
  other: number
}

interface RevenueChartProps {
  data: RevenueData[]
}

const PLATFORM_COLORS = {
  total: '#2563EB',
  youtube: '#FF0000',
  linkedin: '#0A66C2',
  instagram: '#E4405F',
  other: '#6B7280',
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const [visibleLines, setVisibleLines] = useState({
    total: true,
    youtube: true,
    linkedin: true,
    instagram: true,
    other: true,
  })

  const toggleLine = (key: keyof typeof visibleLines) => {
    setVisibleLines(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return (value / 1000).toFixed(0) + 'K €'
    }
    return value.toFixed(0) + ' €'
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium mb-2">
            {format(new Date(label), 'dd MMMM yyyy', { locale: fr })}
          </p>
          {payload.map((entry: any) => (
            <p key={entry.dataKey} className="text-sm" style={{ color: entry.color }}>
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
          <CardTitle>Évolution des revenus</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              PNG
            </Button>
            <Button variant="outline" size="sm">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => format(new Date(date), 'dd MMM', { locale: fr })}
                stroke="#6B7280"
              />
              <YAxis
                tickFormatter={formatCurrency}
                stroke="#6B7280"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                onClick={(e) => toggleLine(e.dataKey as keyof typeof visibleLines)}
                wrapperStyle={{ cursor: 'pointer' }}
              />
              {visibleLines.total && (
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke={PLATFORM_COLORS.total}
                  strokeWidth={3}
                  name="Total"
                  dot={false}
                />
              )}
              {visibleLines.youtube && (
                <Line
                  type="monotone"
                  dataKey="youtube"
                  stroke={PLATFORM_COLORS.youtube}
                  strokeWidth={2}
                  name="YouTube"
                  dot={false}
                />
              )}
              {visibleLines.linkedin && (
                <Line
                  type="monotone"
                  dataKey="linkedin"
                  stroke={PLATFORM_COLORS.linkedin}
                  strokeWidth={2}
                  name="LinkedIn"
                  dot={false}
                />
              )}
              {visibleLines.instagram && (
                <Line
                  type="monotone"
                  dataKey="instagram"
                  stroke={PLATFORM_COLORS.instagram}
                  strokeWidth={2}
                  name="Instagram"
                  dot={false}
                />
              )}
              {visibleLines.other && (
                <Line
                  type="monotone"
                  dataKey="other"
                  stroke={PLATFORM_COLORS.other}
                  strokeWidth={2}
                  name="Autre"
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
