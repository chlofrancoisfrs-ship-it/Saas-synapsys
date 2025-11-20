import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const platforms = searchParams.getAll('platforms')

    // Mock data for now - would query from analytics_aggregates table
    const kpis = {
      totalRevenue: 12345.67,
      totalTraffic: 45678,
      avgEngagement: 4.2,
      totalConversions: 89,
    }

    const previousPeriodKpis = {
      totalRevenue: 10500.00,
      totalTraffic: 39000,
      avgEngagement: 3.8,
      totalConversions: 75,
    }

    const percentageChanges = {
      totalRevenue: ((kpis.totalRevenue - previousPeriodKpis.totalRevenue) / previousPeriodKpis.totalRevenue) * 100,
      totalTraffic: ((kpis.totalTraffic - previousPeriodKpis.totalTraffic) / previousPeriodKpis.totalTraffic) * 100,
      avgEngagement: ((kpis.avgEngagement - previousPeriodKpis.avgEngagement) / previousPeriodKpis.avgEngagement) * 100,
      totalConversions: ((kpis.totalConversions - previousPeriodKpis.totalConversions) / previousPeriodKpis.totalConversions) * 100,
    }

    return NextResponse.json({
      kpis,
      previousPeriodKpis,
      percentageChanges,
      sparklineData: {
        revenue: [100, 120, 110, 140, 130, 150, 145],
        traffic: [1000, 1100, 1050, 1200, 1150, 1250, 1300],
        engagement: [3.5, 3.7, 3.6, 3.9, 4.0, 4.1, 4.2],
      }
    })
  } catch (error: any) {
    console.error('Error fetching analytics overview:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
