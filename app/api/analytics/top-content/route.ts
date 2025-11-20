import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { subDays } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sort_by') || 'roi'

    // Mock top content data
    const content = [
      {
        id: '1',
        title: 'Comment j\'ai doublé mon CA en 3 mois',
        platform: 'youtube',
        publishedAt: subDays(new Date(), 5).toISOString(),
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
        publishedAt: subDays(new Date(), 10).toISOString(),
        views: 8920,
        engagement: 1240,
        engagementRate: 13.9,
        calls: 18,
        revenue: 2780,
        roi: 132,
        url: 'https://linkedin.com/example',
      },
      {
        id: '3',
        title: 'Ma routine matinale d\'entrepreneur',
        platform: 'instagram',
        publishedAt: subDays(new Date(), 3).toISOString(),
        views: 12340,
        engagement: 1890,
        engagementRate: 15.3,
        calls: 15,
        revenue: 2120,
        roi: 118,
        url: 'https://instagram.com/example',
      },
    ]

    return NextResponse.json(content.slice(0, limit))
  } catch (error: any) {
    console.error('Error fetching top content:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
