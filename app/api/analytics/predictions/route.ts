import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { subDays, addDays, format } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Mock historical data
    const historicalData = Array.from({ length: 20 }, (_, i) => ({
      date: format(subDays(new Date(), 20 - i), 'yyyy-MM-dd'),
      value: 300 + Math.random() * 200 + i * 15,
    }))

    // Mock projection data
    const lastValue = historicalData[historicalData.length - 1].value
    const projectionData = Array.from({ length: 10 }, (_, i) => {
      const baseValue = lastValue + (i + 1) * 20
      return {
        date: format(addDays(new Date(), i + 1), 'yyyy-MM-dd'),
        value: baseValue,
        lower: baseValue * 0.85,
        upper: baseValue * 1.15,
      }
    })

    const currentRevenue = historicalData.reduce((sum, d) => sum + d.value, 0)
    const daysElapsed = historicalData.length
    const avgDailyRevenue = currentRevenue / daysElapsed
    const daysInMonth = 30
    const projectedRevenue = avgDailyRevenue * daysInMonth
    const monthlyGoal = 15000

    const probability = Math.min((projectedRevenue / monthlyGoal) * 100, 99)
    const variance = historicalData.reduce((sum, d, i, arr) => {
      const avg = currentRevenue / arr.length
      return sum + Math.pow(d.value - avg, 2)
    }, 0) / historicalData.length
    const stdDev = Math.sqrt(variance)
    const coefficientOfVariation = (stdDev / avgDailyRevenue) * 100

    let confidence: 'high' | 'medium' | 'low'
    if (coefficientOfVariation < 20) confidence = 'high'
    else if (coefficientOfVariation < 40) confidence = 'medium'
    else confidence = 'low'

    const recommendations = [
      '📈 Publiez 2 vidéos supplémentaires sur LinkedIn pour +450€',
      '📞 Contactez 5 prospects qualifiés pour atteindre l\'objectif',
      '🎯 Concentrez-vous sur le contenu "Comment faire", ROI +42%',
    ]

    return NextResponse.json({
      projectedRevenue,
      monthlyGoal,
      confidence,
      probability,
      recommendations,
      historicalData,
      projectionData,
    })
  } catch (error: any) {
    console.error('Error fetching predictions:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
