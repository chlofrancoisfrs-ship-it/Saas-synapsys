import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { encrypt } from '@/lib/integrations/encryption'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(
        new URL(`/integrations?error=${error}`, request.url)
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/integrations?error=missing_params', request.url)
      )
    }

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Verify state token
    const { data: stateData, error: stateError } = await supabase
      .from('oauth_states')
      .select('*')
      .eq('user_id', user.id)
      .eq('state', state)
      .eq('platform', 'calendly')
      .single()

    if (stateError || !stateData) {
      return NextResponse.redirect(
        new URL('/integrations?error=invalid_state', request.url)
      )
    }

    if (new Date(stateData.expires_at) < new Date()) {
      await supabase.from('oauth_states').delete().eq('id', stateData.id)
      return NextResponse.redirect(
        new URL('/integrations?error=state_expired', request.url)
      )
    }

    await supabase.from('oauth_states').delete().eq('id', stateData.id)

    // Exchange code for tokens
    const tokenResponse = await fetch('https://auth.calendly.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.CALENDLY_CLIENT_ID,
        client_secret: process.env.CALENDLY_CLIENT_SECRET,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/calendly/callback`,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens')
    }

    const tokens = await tokenResponse.json()

    // Fetch user info
    const userResponse = await fetch('https://api.calendly.com/users/me', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    })

    const userData = await userResponse.json()
    const calendlyUser = userData.resource

    // Encrypt tokens
    const encryptedAccessToken = await encrypt(tokens.access_token)
    const encryptedRefreshToken = tokens.refresh_token
      ? await encrypt(tokens.refresh_token)
      : null

    // Calculate token expiry
    const expiresAt = new Date(
      Date.now() + (tokens.expires_in || 7200) * 1000
    ).toISOString()

    // Store or update integration
    const { data: existingIntegration } = await supabase
      .from('integrations')
      .select('id')
      .eq('user_id', user.id)
      .eq('platform', 'calendly')
      .single()

    const integrationData = {
      user_id: user.id,
      platform: 'calendly',
      access_token: encryptedAccessToken,
      refresh_token: encryptedRefreshToken,
      token_expires_at: expiresAt,
      is_active: true,
      config: {
        calendly_uri: calendlyUser.uri,
        account_name: calendlyUser.name,
        email: calendlyUser.email,
        timezone: calendlyUser.timezone,
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

    return NextResponse.redirect(
      new URL('/integrations?success=calendly_connected', request.url)
    )
  } catch (error) {
    console.error('Calendly callback error:', error)
    return NextResponse.redirect(
      new URL('/integrations?error=connection_failed', request.url)
    )
  }
}
