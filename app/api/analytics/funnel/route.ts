import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Mock funnel data
    const steps = [
      {
        name: 'Impressions/Vues',
        value: 45678,
        percentage: 100,
        conversionRate: 20.5,
      },
      {
        name: 'Clics/Engagements',
        value: 9360,
        percentage: 20.5,
        conversionRate: 9.5,
      },
      {
        name: 'Appels générés',
        value: 89,
        percentage: 0.95,
        conversionRate: 28.1,
      },
      {
        name: 'Ventes closes',
        value: 25,
        percentage: 0.27,
      },
    ]

    const previousSteps = [
      { name: 'Impressions/Vues', value: 39000, percentage: 100, conversionRate: 18.2 },
      { name: 'Clics/Engagements', value: 7098, percentage: 18.2, conversionRate: 10.6 },
      { name: 'Appels générés', value: 75, percentage: 0.96, conversionRate: 24.0 },
      { name: 'Ventes closes', value: 18, percentage: 0.23 },
    ]

    return NextResponse.json({
      steps,
      previousSteps,
      comparison: {
        topOfFunnel: 17.1,
        middleFunnel: 31.8,
        bottomFunnel: 18.7,
        conversion: 38.9,
      }
    })
  } catch (error: any) {
    console.error('Error fetching funnel:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
