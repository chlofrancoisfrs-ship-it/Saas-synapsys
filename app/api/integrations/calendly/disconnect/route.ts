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
      .eq('platform', 'calendly')
      .single()

    if (integrationError || !integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
    }

    // Revoke Calendly token
    try {
      const accessToken = await decrypt(integration.access_token)
      await fetch('https://auth.calendly.com/oauth/token/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          token: accessToken,
        }),
      })
    } catch (error) {
      console.error('Failed to revoke Calendly token:', error)
      // Continue even if revocation fails
    }

    // Deactivate integration
    await supabase
      .from('integrations')
      .update({ is_active: false })
      .eq('id', integration.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Calendly disconnect error:', error)
    return NextResponse.json({ error: 'Disconnect failed' }, { status: 500 })
  }
}
