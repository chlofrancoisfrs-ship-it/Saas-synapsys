import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { subDays, format } from 'date-fns'

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
    const granularity = searchParams.get('granularity') || 'day'

    // Generate mock data for 30 days
    const data = []
    for (let i = 30; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd')
      data.push({
        date,
        total: Math.random() * 1000 + 500,
        youtube: Math.random() * 400 + 100,
        linkedin: Math.random() * 300 + 100,
        instagram: Math.random() * 200 + 50,
        other: Math.random() * 150 + 50,
      })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error fetching revenue chart:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
