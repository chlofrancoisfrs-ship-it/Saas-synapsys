"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ExternalLink, Eye, Search } from 'lucide-react'
import { useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface ContentItem {
  id: string
  title: string
  platform: string
  publishedAt: string
  views: number
  engagement: number
  engagementRate: number
  calls: number
  revenue: number
  roi: number
  url?: string
}

interface TopContentTableProps {
  data: ContentItem[]
}

const PLATFORM_COLORS: Record<string, string> = {
  youtube: '#FF0000',
  linkedin: '#0A66C2',
  instagram: '#E4405F',
  other: '#6B7280',
}

export default function TopContentTable({ data }: TopContentTableProps) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<keyof ContentItem>('roi')
  const [sortDesc, setSortDesc] = useState(true)

  const filteredData = data
    .filter(item => item.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const aVal = a[sortBy] as number
      const bVal = b[sortBy] as number
      return sortDesc ? bVal - aVal : aVal - bVal
    })
    .slice(0, 10)

  const handleSort = (key: keyof ContentItem) => {
    if (sortBy === key) {
      setSortDesc(!sortDesc)
    } else {
      setSortBy(key)
      setSortDesc(true)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Top Contenu Performers</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium text-sm text-gray-600">Contenu</th>
                <th className="text-left p-3 font-medium text-sm text-gray-600">Plateforme</th>
                <th className="text-right p-3 font-medium text-sm text-gray-600 cursor-pointer hover:text-gray-900" onClick={() => handleSort('views')}>Vues</th>
                <th className="text-right p-3 font-medium text-sm text-gray-600 cursor-pointer hover:text-gray-900" onClick={() => handleSort('engagement')}>Engagement</th>
                <th className="text-right p-3 font-medium text-sm text-gray-600 cursor-pointer hover:text-gray-900" onClick={() => handleSort('calls')}>Appels</th>
                <th className="text-right p-3 font-medium text-sm text-gray-600 cursor-pointer hover:text-gray-900" onClick={() => handleSort('revenue')}>Revenus</th>
                <th className="text-right p-3 font-medium text-sm text-gray-600 cursor-pointer hover:text-gray-900" onClick={() => handleSort('roi')}>ROI</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <p className="font-medium text-sm truncate max-w-xs">{item.title}</p>
                    <p className="text-xs text-gray-500">{format(new Date(item.publishedAt), 'dd MMM yyyy', { locale: fr })}</p>
                  </td>
                  <td className="p-3">
                    <Badge style={{ backgroundColor: PLATFORM_COLORS[item.platform] + '15', color: PLATFORM_COLORS[item.platform] }}>
                      {item.platform}
                    </Badge>
                  </td>
                  <td className="text-right p-3 text-sm">{item.views.toLocaleString('fr-FR')}</td>
                  <td className="text-right p-3 text-sm">
                    {item.engagement.toLocaleString('fr-FR')}
                    <span className="text-xs text-gray-500 ml-1">({item.engagementRate.toFixed(1)}%)</span>
                  </td>
                  <td className="text-right p-3 text-sm font-medium">{item.calls}</td>
                  <td className="text-right p-3 text-sm font-medium">{item.revenue.toLocaleString('fr-FR')} €</td>
                  <td className="text-right p-3">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-sm font-bold">{item.roi.toFixed(0)}%</span>
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: Math.min(item.roi, 100) + '%',
                            backgroundColor: item.roi >= 100 ? '#10B981' : item.roi >= 50 ? '#F59E0B' : '#EF4444'
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    {item.url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Aucun contenu trouvé pour cette période
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
