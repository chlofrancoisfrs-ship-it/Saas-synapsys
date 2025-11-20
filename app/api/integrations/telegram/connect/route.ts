import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { encrypt } from '@/lib/integrations/encryption'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { apiKey } = body

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 })
    }

    // Validate Telegram bot token by calling getMe
    const botResponse = await fetch(
      `https://api.telegram.org/bot${apiKey}/getMe`
    )

    if (!botResponse.ok) {
      return NextResponse.json({ error: 'Invalid Telegram bot token' }, { status: 400 })
    }

    const botData = await botResponse.json()

    if (!botData.ok) {
      return NextResponse.json({ error: 'Invalid Telegram bot token' }, { status: 400 })
    }

    const bot = botData.result

    // Encrypt API key
    const encryptedApiKey = await encrypt(apiKey)

    // Store or update integration
    const { data: existingIntegration } = await supabase
      .from('integrations')
      .select('id')
      .eq('user_id', user.id)
      .eq('platform', 'telegram')
      .single()

    const integrationData = {
      user_id: user.id,
      platform: 'telegram',
      access_token: encryptedApiKey,
      refresh_token: null,
      token_expires_at: null,
      is_active: true,
      config: {
        bot_id: bot.id,
        account_name: bot.username,
        bot_name: `${bot.first_name}${bot.last_name ? ' ' + bot.last_name : ''}`,
        can_read_messages: bot.can_read_all_group_messages,
        stats: {},
      },
      last_sync: new Date().toISOString(),
    }

    if (existingIntegration) {
      await supabase
        .from('integrations')
        .update(integrationData)
        .eq('id', existingIntegration.id)
    } else {
      await supabase.from('integrations').insert(integrationData)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Telegram connect error:', error)
    return NextResponse.json({ error: 'Connection failed' }, { status: 500 })
  }
}
