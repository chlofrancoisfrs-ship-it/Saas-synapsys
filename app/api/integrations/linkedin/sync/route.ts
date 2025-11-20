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
      .eq('platform', 'linkedin')
      .eq('is_active', true)
      .single()

    if (integrationError || !integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
    }

    // Decrypt access token
    const accessToken = await decrypt(integration.access_token)

    // Fetch latest profile data
    const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!profileResponse.ok) {
      throw new Error('Failed to fetch LinkedIn data')
    }

    const profile = await profileResponse.json()

    // Update integration config
    await supabase
      .from('integrations')
      .update({
        config: {
          profile_id: profile.id,
          account_name: `${profile.localizedFirstName} ${profile.localizedLastName}`,
          stats: {},
        },
        last_sync: new Date().toISOString(),
      })
      .eq('id', integration.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('LinkedIn sync error:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
