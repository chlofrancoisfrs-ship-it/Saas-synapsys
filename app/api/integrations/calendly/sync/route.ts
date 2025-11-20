import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { decrypt, encrypt } from '@/lib/integrations/encryption'

async function refreshAccessToken(refreshToken: string) {
  const response = await fetch('https://auth.calendly.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.CALENDLY_CLIENT_ID,
      client_secret: process.env.CALENDLY_CLIENT_SECRET,
    }),
  })

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
      .eq('platform', 'calendly')
      .eq('is_active', true)
      .single()

    if (integrationError || !integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
    }

    // Decrypt tokens
    let accessToken = await decrypt(integration.access_token)

    // Check if token needs refresh
    const expiresAt = new Date(integration.token_expires_at)
    const now = new Date()
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000)

    if (expiresAt < fiveMinutesFromNow && integration.refresh_token) {
      const refreshToken = await decrypt(integration.refresh_token)
      const newTokens = await refreshAccessToken(refreshToken)

      accessToken = newTokens.access_token
      const encryptedAccessToken = await encrypt(accessToken)
      const encryptedRefreshToken = await encrypt(newTokens.refresh_token)
      const newExpiresAt = new Date(
        Date.now() + (newTokens.expires_in || 7200) * 1000
      ).toISOString()

      await supabase
        .from('integrations')
        .update({
          access_token: encryptedAccessToken,
          refresh_token: encryptedRefreshToken,
          token_expires_at: newExpiresAt,
        })
        .eq('id', integration.id)
    }

    // Fetch latest user data
    const userResponse = await fetch('https://api.calendly.com/users/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!userResponse.ok) {
      throw new Error('Failed to fetch Calendly data')
    }

    const userData = await userResponse.json()
    const calendlyUser = userData.resource

    // Update integration config
    await supabase
      .from('integrations')
      .update({
        config: {
          calendly_uri: calendlyUser.uri,
          account_name: calendlyUser.name,
          email: calendlyUser.email,
          timezone: calendlyUser.timezone,
          stats: {},
        },
        last_sync: new Date().toISOString(),
      })
      .eq('id', integration.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Calendly sync error:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
