import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { decrypt, encrypt } from '@/lib/integrations/encryption'

async function refreshLongLivedToken(accessToken: string) {
  const response = await fetch(
    `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${accessToken}`
  )

  if (!response.ok) {
    throw new Error('Failed to refresh token')
  }

  return await response.json()
}

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
      .eq('platform', 'instagram')
      .eq('is_active', true)
      .single()

    if (integrationError || !integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
    }

    // Decrypt access token
    let accessToken = await decrypt(integration.access_token)

    // Check if token needs refresh (if expires in < 7 days)
    const expiresAt = new Date(integration.token_expires_at)
    const now = new Date()
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    if (expiresAt < sevenDaysFromNow) {
      const newToken = await refreshLongLivedToken(accessToken)
      accessToken = newToken.access_token

      const encryptedAccessToken = await encrypt(accessToken)
      const newExpiresAt = new Date(
        Date.now() + (newToken.expires_in || 5184000) * 1000
      ).toISOString()

      await supabase
        .from('integrations')
        .update({
          access_token: encryptedAccessToken,
          token_expires_at: newExpiresAt,
        })
        .eq('id', integration.id)
    }

    // Fetch latest profile data
    const profileResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${accessToken}`
    )

    if (!profileResponse.ok) {
      throw new Error('Failed to fetch Instagram data')
    }

    const profile = await profileResponse.json()

    // Update integration config
    await supabase
      .from('integrations')
      .update({
        config: {
          user_id: profile.id,
          account_name: profile.username,
          account_type: profile.account_type,
          stats: {
            Publications: profile.media_count?.toLocaleString('fr-FR') || '0',
          },
        },
        last_sync: new Date().toISOString(),
      })
      .eq('id', integration.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Instagram sync error:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
