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

    // Parse WhatsApp Business API credentials (format: phoneNumberId:accessToken)
    const [phoneNumberId, accessToken] = apiKey.split(':')

    if (!phoneNumberId || !accessToken) {
      return NextResponse.json({
        error: 'Invalid format. Use: phoneNumberId:accessToken'
      }, { status: 400 })
    }

    // Validate WhatsApp Business API credentials by fetching phone number info
    const phoneResponse = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!phoneResponse.ok) {
      return NextResponse.json({
        error: 'Invalid WhatsApp Business API credentials'
      }, { status: 400 })
    }

    const phoneData = await phoneResponse.json()

    // Encrypt API key
    const encryptedApiKey = await encrypt(apiKey)

    // Store or update integration
    const { data: existingIntegration } = await supabase
      .from('integrations')
      .select('id')
      .eq('user_id', user.id)
      .eq('platform', 'whatsapp')
      .single()

    const integrationData = {
      user_id: user.id,
      platform: 'whatsapp',
      access_token: encryptedApiKey,
      refresh_token: null,
      token_expires_at: null,
      is_active: true,
      config: {
        phone_number_id: phoneNumberId,
        account_name: phoneData.display_phone_number || phoneData.verified_name,
        verified_name: phoneData.verified_name,
        quality_rating: phoneData.quality_rating,
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
    console.error('WhatsApp connect error:', error)
    return NextResponse.json({ error: 'Connection failed' }, { status: 500 })
  }
}
