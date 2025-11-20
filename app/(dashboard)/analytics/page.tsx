"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import AnalyticsFilters from '@/components/analytics/AnalyticsFilters'
import KPICard from '@/components/analytics/KPICard'
import RevenueChart from '@/components/analytics/RevenueChart'
import PlatformCard from '@/components/analytics/PlatformCard'
import TopContentTable from '@/components/analytics/TopContentTable'
import { Skeleton } from '@/components/ui/skeleton'
import { Wallet, Eye, Heart, PhoneCall } from 'lucide-react'
import { subDays } from 'date-fns'
import { toast } from 'sonner'

export default function AnalyticsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [platforms, setPlatforms] = useState<string[]>([])
  
  const [kpisData, setKpisData] = useState<any>(null)
  const [revenueData, setRevenueData] = useState<any>([])
  const [platformsData, setPlatformsData] = useState<any>([])
  const [contentData, setContentData] = useState<any>([])

  useEffect(() => {
    loadAnalyticsData()
  }, [dateRange, platforms])

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      const params = new URLSearchParams({
        start_date: dateRange.from.toISOString(),
        end_date: dateRange.to.toISOString(),
      })
      platforms.forEach(p => params.append('platforms', p))

      const [overviewRes, revenueRes, platformsRes] = await Promise.all([
        fetch('/api/analytics/overview?' + params),
        fetch('/api/analytics/revenue-chart?' + params),
        fetch('/api/analytics/platform-breakdown?' + params),
      ])

      if (overviewRes.ok) {
        const data = await overviewRes.json()
        setKpisData(data)
      }

      if (revenueRes.ok) {
        const data = await revenueRes.json()
        setRevenueData(data)
      }

      if (platformsRes.ok) {
        const data = await platformsRes.json()
        setPlatformsData(data)
      }

      setContentData([
        {
          id: '1',
          title: 'Comment j\'ai doublé mon CA en 3 mois',
          platform: 'youtube',
          publishedAt: new Date().toISOString(),
          views: 15420,
          engagement: 2340,
          engagementRate: 15.2,
          calls: 23,
          revenue: 3450,
          roi: 145,
          url: 'https://youtube.com/example',
        },
        {
          id: '2',
          title: 'Les 5 secrets pour réussir sur LinkedIn',
          platform: 'linkedin',
          publishedAt: subDays(new Date(), 5).toISOString(),
          views: 8920,
          engagement: 1240,
          engagementRate: 13.9,
          calls: 18,
          revenue: 2780,
          roi: 132,
          url: 'https://linkedin.com/example',
        },
      ])

    } catch (error) {
      console.error('Error loading analytics:', error)
      toast.error('Erreur lors du chargement des analytiques')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportPDF = async () => {
    toast.info('Export PDF en cours de développement')
  }

  const handleExportCSV = async () => {
    toast.info('Export CSV en cours de développement')
  }

  const handleScheduleReport = () => {
    toast.info('Programmation de rapport en cours de développement')
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-16 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">
            Analysez vos performances et optimisez votre stratégie
          </p>
        </div>

        <AnalyticsFilters
          dateRange={dateRange}
          platforms={platforms}
          onDateRangeChange={setDateRange}
          onPlatformsChange={setPlatforms}
          onExportPDF={handleExportPDF}
          onExportCSV={handleExportCSV}
          onScheduleReport={handleScheduleReport}
        />

        {kpisData && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <KPICard
              title="Revenus Totaux"
              value={kpisData.kpis.totalRevenue}
              format="currency"
              change={kpisData.percentageChanges.totalRevenue}
              changeType={kpisData.percentageChanges.totalRevenue >= 0 ? 'positive' : 'negative'}
              icon={Wallet}
              color="#10B981"
              sparklineData={kpisData.sparklineData.revenue}
            />
            <KPICard
              title="Trafic Total"
              value={kpisData.kpis.totalTraffic}
              format="number"
              change={kpisData.percentageChanges.totalTraffic}
              changeType={kpisData.percentageChanges.totalTraffic >= 0 ? 'positive' : 'negative'}
              icon={Eye}
              color="#2563EB"
              sparklineData={kpisData.sparklineData.traffic}
            />
            <KPICard
              title="Engagement Moyen"
              value={kpisData.kpis.avgEngagement}
              format="percent"
              change={kpisData.percentageChanges.avgEngagement}
              changeType={kpisData.percentageChanges.avgEngagement >= 0 ? 'positive' : 'negative'}
              icon={Heart}
              color="#8B5CF6"
              subtitle="🏆 Meilleur: YouTube"
            />
            <KPICard
              title="Conversions"
              value={kpisData.kpis.totalConversions}
              format="number"
              change={kpisData.percentageChanges.totalConversions}
              changeType={kpisData.percentageChanges.totalConversions >= 0 ? 'positive' : 'negative'}
              icon={PhoneCall}
              color="#F59E0B"
              subtitle="Taux: 4.2% • Closing: 28%"
            />
          </div>
        )}

        {revenueData.length > 0 && (
          <RevenueChart data={revenueData} />
        )}

        {platformsData.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Performance par Plateforme
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {platformsData.map((platform: any) => (
                <PlatformCard
                  key={platform.platform}
                  platform={platform.platform}
                  stats={platform.stats}
                  sparklineData={platform.sparklineData}
                  onViewDetails={() => toast.info('Détails de ' + platform.platform)}
                />
              ))}
            </div>
          </div>
        )}

        {contentData.length > 0 && (
          <TopContentTable data={contentData} />
        )}
      </div>
    </DashboardLayout>
  )
}
