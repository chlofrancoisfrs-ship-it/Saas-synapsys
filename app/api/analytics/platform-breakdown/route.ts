import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Mock platform breakdown data
    const platforms = [
      {
        platform: 'youtube',
        stats: {
          views: 15420,
          engagement: 2340,
          engagementRate: 15.2,
          revenue: 3450,
          change: 12.5,
        },
        sparklineData: [100, 120, 110, 130, 125, 140, 135],
      },
      {
        platform: 'linkedin',
        stats: {
          views: 8920,
          engagement: 1240,
          engagementRate: 13.9,
          revenue: 2780,
          change: 8.3,
        },
        sparklineData: [80, 85, 90, 88, 95, 92, 98],
      },
      {
        platform: 'instagram',
        stats: {
          views: 12340,
          engagement: 1890,
          engagementRate: 15.3,
          revenue: 2120,
          change: -3.2,
        },
        sparklineData: [110, 105, 100, 95, 90, 92, 88],
      },
      {
        platform: 'other',
        stats: {
          views: 5230,
          engagement: 780,
          engagementRate: 14.9,
          revenue: 1450,
          change: 5.7,
        },
        sparklineData: [50, 52, 54, 56, 58, 60, 62],
      },
    ]

    return NextResponse.json(platforms)
  } catch (error: any) {
    console.error('Error fetching platform breakdown:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
