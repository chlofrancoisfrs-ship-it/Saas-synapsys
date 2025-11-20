import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Mock attribution data
    const data = [
      {
        source: 'YouTube',
        color: '#FF0000',
        firstTouch: 4200,
        lastTouch: 3800,
        linear: 3900,
        timeDecay: 4100,
        positionBased: 4000,
      },
      {
        source: 'LinkedIn',
        color: '#0A66C2',
        firstTouch: 3100,
        lastTouch: 3500,
        linear: 3200,
        timeDecay: 3300,
        positionBased: 3250,
      },
      {
        source: 'Instagram',
        color: '#E4405F',
        firstTouch: 2800,
        lastTouch: 2500,
        linear: 2700,
        timeDecay: 2600,
        positionBased: 2650,
      },
      {
        source: 'Autre',
        color: '#6B7280',
        firstTouch: 2100,
        lastTouch: 2400,
        linear: 2300,
        timeDecay: 2200,
        positionBased: 2250,
      },
    ]

    return NextResponse.json({
      sources: data,
      selectedModel: 'linear',
    })
  } catch (error: any) {
    console.error('Error fetching attribution:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
