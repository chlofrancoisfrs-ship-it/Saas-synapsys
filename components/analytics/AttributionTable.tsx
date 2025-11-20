"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface AttributionData {
  source: string
  firstTouch: number
  lastTouch: number
  linear: number
  timeDecay: number
  positionBased: number
  color: string
}

interface AttributionTableProps {
  data: AttributionData[]
  selectedModel: string
  onModelChange: (model: string) => void
}

const ATTRIBUTION_MODELS = [
  {
    key: 'firstTouch',
    name: 'First Touch',
    description: '100% au premier point de contact',
  },
  {
    key: 'lastTouch',
    name: 'Last Touch',
    description: '100% au dernier point de contact',
  },
  {
    key: 'linear',
    name: 'Linear',
    description: 'Réparti équitablement entre tous',
  },
  {
    key: 'timeDecay',
    name: 'Time Decay',
    description: 'Pondéré par proximité temporelle',
  },
  {
    key: 'positionBased',
    name: 'Position Based',
    description: '40% first, 40% last, 20% middle',
  },
]

export default function AttributionTable({ data, selectedModel, onModelChange }: AttributionTableProps) {
  const [hoveredModel, setHoveredModel] = useState<string | null>(null)

  const getTotalForModel = (modelKey: string) => {
    return data.reduce((sum, item) => sum + (item[modelKey as keyof AttributionData] as number), 0)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Modèles d&apos;Attribution</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Comparez comment chaque source contribue aux revenus
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            Modèle actif: {ATTRIBUTION_MODELS.find(m => m.key === selectedModel)?.name}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Model selector */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {ATTRIBUTION_MODELS.map((model) => (
            <Button
              key={model.key}
              variant={selectedModel === model.key ? 'default' : 'outline'}
              size="sm"
              className={cn(
                "flex flex-col items-start h-auto py-3 relative",
                selectedModel === model.key && "ring-2 ring-offset-2 ring-blue-500"
              )}
              onClick={() => onModelChange(model.key)}
              onMouseEnter={() => setHoveredModel(model.key)}
              onMouseLeave={() => setHoveredModel(null)}
            >
              <div className="flex items-center gap-2 mb-1">
                {selectedModel === model.key && (
                  <Check className="h-3 w-3" />
                )}
                <span className="font-medium text-xs">{model.name}</span>
              </div>
              {(hoveredModel === model.key || selectedModel === model.key) && (
                <span className="text-xs text-gray-500 text-left">
                  {model.description}
                </span>
              )}
            </Button>
          ))}
        </div>

        {/* Attribution table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium text-sm text-gray-600">Source</th>
                {ATTRIBUTION_MODELS.map(model => (
                  <th
                    key={model.key}
                    className={cn(
                      "text-right p-3 font-medium text-sm",
                      selectedModel === model.key ? "text-blue-600 bg-blue-50" : "text-gray-600"
                    )}
                  >
                    {model.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-sm">{item.source}</span>
                    </div>
                  </td>
                  {ATTRIBUTION_MODELS.map(model => (
                    <td
                      key={model.key}
                      className={cn(
                        "text-right p-3 text-sm font-medium",
                        selectedModel === model.key && "bg-blue-50 text-blue-900"
                      )}
                    >
                      {formatCurrency(item[model.key as keyof AttributionData] as number)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 font-bold">
                <td className="p-3 text-sm">Total</td>
                {ATTRIBUTION_MODELS.map(model => (
                  <td
                    key={model.key}
                    className={cn(
                      "text-right p-3 text-sm",
                      selectedModel === model.key && "bg-blue-100 text-blue-900"
                    )}
                  >
                    {formatCurrency(getTotalForModel(model.key))}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Visualization hint */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>💡 Conseil:</strong> Le modèle <strong>{ATTRIBUTION_MODELS.find(m => m.key === selectedModel)?.name}</strong> est actuellement utilisé pour calculer vos revenus par source. Vous pouvez changer de modèle à tout moment dans vos préférences.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
