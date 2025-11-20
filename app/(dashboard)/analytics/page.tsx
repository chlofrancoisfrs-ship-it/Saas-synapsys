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
import FunnelChart from '@/components/analytics/FunnelChart'
import AttributionTable from '@/components/analytics/AttributionTable'
import PredictionsCard from '@/components/analytics/PredictionsCard'
import ScheduleReportModal from '@/components/analytics/ScheduleReportModal'
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
  const [funnelData, setFunnelData] = useState<any>(null)
  const [attributionData, setAttributionData] = useState<any>(null)
  const [predictionsData, setPredictionsData] = useState<any>(null)
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [selectedAttributionModel, setSelectedAttributionModel] = useState('linear')

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

      const [
        overviewRes,
        revenueRes,
        platformsRes,
        contentRes,
        funnelRes,
        attributionRes,
        predictionsRes
      ] = await Promise.all([
        fetch('/api/analytics/overview?' + params),
        fetch('/api/analytics/revenue-chart?' + params),
        fetch('/api/analytics/platform-breakdown?' + params),
        fetch('/api/analytics/top-content?' + params),
        fetch('/api/analytics/funnel?' + params),
        fetch('/api/analytics/attribution?' + params),
        fetch('/api/analytics/predictions'),
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

      if (contentRes.ok) {
        const data = await contentRes.json()
        setContentData(data)
      }

      if (funnelRes.ok) {
        const data = await funnelRes.json()
        setFunnelData(data)
      }

      if (attributionRes.ok) {
        const data = await attributionRes.json()
        setAttributionData(data)
        setSelectedAttributionModel(data.selectedModel || 'linear')
      }

      if (predictionsRes.ok) {
        const data = await predictionsRes.json()
        setPredictionsData(data)
      }

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
    setScheduleModalOpen(true)
  }

  const handleSaveSchedule = async (config: any) => {
    try {
      const response = await fetch('/api/analytics/schedule-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur')
      }

      toast.success('Rapport programmé avec succès')
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la programmation')
      throw error
    }
  }

  const handleAttributionModelChange = (model: string) => {
    setSelectedAttributionModel(model)
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

        {/* Funnel Analysis */}
        {funnelData && (
          <FunnelChart
            steps={funnelData.steps}
            previousSteps={funnelData.previousSteps}
          />
        )}

        {/* Attribution Model & Predictions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {attributionData && (
            <AttributionTable
              data={attributionData.sources}
              selectedModel={selectedAttributionModel}
              onModelChange={handleAttributionModelChange}
            />
          )}

          {predictionsData && (
            <PredictionsCard
              projectedRevenue={predictionsData.projectedRevenue}
              monthlyGoal={predictionsData.monthlyGoal}
              confidence={predictionsData.confidence}
              probability={predictionsData.probability}
              recommendations={predictionsData.recommendations}
              historicalData={predictionsData.historicalData}
              projectionData={predictionsData.projectionData}
            />
          )}
        </div>
      </div>

      {/* Schedule Report Modal */}
      <ScheduleReportModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        onSchedule={handleSaveSchedule}
      />
    </DashboardLayout>
  )
}
