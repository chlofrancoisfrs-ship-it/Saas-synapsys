import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { frequency, time, dayOfWeek, dayOfMonth, format, content, recipients } = body

    if (!frequency || !time || !format || !content || !recipients || recipients.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create scheduled report in database
    const { data: scheduledReport, error } = await supabase
      .from('scheduled_reports')
      .insert({
        user_id: user.id,
        frequency,
        time,
        day_of_week: dayOfWeek,
        day_of_month: dayOfMonth,
        format,
        content,
        recipients,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      scheduled_report_id: scheduledReport.id,
    })
  } catch (error: any) {
    console.error('Error scheduling report:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
