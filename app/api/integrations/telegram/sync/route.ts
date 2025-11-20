import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/integrations/encryption'

export async function POST(request: NextRequest) {
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
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', 'telegram')
      .eq('is_active', true)
      .single()

    if (integrationError || !integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
    }

    // Decrypt API key
    const apiKey = await decrypt(integration.access_token)

    // Fetch latest bot data
    const botResponse = await fetch(
      `https://api.telegram.org/bot${apiKey}/getMe`
    )

    if (!botResponse.ok) {
      throw new Error('Failed to fetch Telegram bot data')
    }

    const botData = await botResponse.json()

    if (!botData.ok) {
      throw new Error('Invalid bot token')
    }

    const bot = botData.result

    // Update integration config
    await supabase
      .from('integrations')
      .update({
        config: {
          bot_id: bot.id,
          account_name: bot.username,
          bot_name: `${bot.first_name}${bot.last_name ? ' ' + bot.last_name : ''}`,
          can_read_messages: bot.can_read_all_group_messages,
          stats: {},
        },
        last_sync: new Date().toISOString(),
      })
      .eq('id', integration.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Telegram sync error:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
