import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get integration
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('id, is_active, last_sync, config')
      .eq('user_id', user.id)
      .eq('platform', 'telegram')
      .single()

    if (integrationError || !integration) {
      return NextResponse.json({
        connected: false,
        platform: 'telegram'
      })
    }

    return NextResponse.json({
      connected: integration.is_active,
      platform: 'telegram',
      last_sync: integration.last_sync,
      account_name: integration.config?.account_name,
      stats: integration.config?.stats,
    })
  } catch (error) {
    console.error('Telegram status error:', error)
    return NextResponse.json({ error: 'Status check failed' }, { status: 500 })
  }
}
