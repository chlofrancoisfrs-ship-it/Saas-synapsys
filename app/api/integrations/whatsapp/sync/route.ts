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
      .eq('platform', 'whatsapp')
      .eq('is_active', true)
      .single()

    if (integrationError || !integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
    }

    // Decrypt API key
    const apiKey = await decrypt(integration.access_token)
    const [phoneNumberId, accessToken] = apiKey.split(':')

    // Fetch latest phone number data
    const phoneResponse = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!phoneResponse.ok) {
      throw new Error('Failed to fetch WhatsApp data')
    }

    const phoneData = await phoneResponse.json()

    // Update integration config
    await supabase
      .from('integrations')
      .update({
        config: {
          phone_number_id: phoneNumberId,
          account_name: phoneData.display_phone_number || phoneData.verified_name,
          verified_name: phoneData.verified_name,
          quality_rating: phoneData.quality_rating,
          stats: {},
        },
        last_sync: new Date().toISOString(),
      })
      .eq('id', integration.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('WhatsApp sync error:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
