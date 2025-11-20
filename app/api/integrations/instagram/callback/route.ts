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
      .eq('platform', 'instagram')
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

    // Exchange code for short-lived token
    const formData = new FormData()
    formData.append('client_id', process.env.INSTAGRAM_CLIENT_ID!)
    formData.append('client_secret', process.env.INSTAGRAM_CLIENT_SECRET!)
    formData.append('grant_type', 'authorization_code')
    formData.append('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/instagram/callback`)
    formData.append('code', code)

    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      body: formData,
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens')
    }

    const shortLivedToken = await tokenResponse.json()

    // Exchange short-lived token for long-lived token
    const longLivedResponse = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_CLIENT_SECRET}&access_token=${shortLivedToken.access_token}`
    )

    if (!longLivedResponse.ok) {
      throw new Error('Failed to get long-lived token')
    }

    const longLivedToken = await longLivedResponse.json()

    // Fetch user profile
    const profileResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${longLivedToken.access_token}`
    )

    const profile = await profileResponse.json()

    // Encrypt tokens
    const encryptedAccessToken = await encrypt(longLivedToken.access_token)

    // Calculate token expiry (60 days for long-lived tokens)
    const expiresAt = new Date(
      Date.now() + (longLivedToken.expires_in || 5184000) * 1000
    ).toISOString()

    // Store or update integration
    const { data: existingIntegration } = await supabase
      .from('integrations')
      .select('id')
      .eq('user_id', user.id)
      .eq('platform', 'instagram')
      .single()

    const integrationData = {
      user_id: user.id,
      platform: 'instagram',
      access_token: encryptedAccessToken,
      refresh_token: null,
      token_expires_at: expiresAt,
      is_active: true,
      config: {
        user_id: profile.id,
        account_name: profile.username,
        account_type: profile.account_type,
        stats: {
          Publications: profile.media_count?.toLocaleString('fr-FR') || '0',
        },
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
      new URL('/integrations?success=instagram_connected', request.url)
    )
  } catch (error) {
    console.error('Instagram callback error:', error)
    return NextResponse.redirect(
      new URL('/integrations?error=connection_failed', request.url)
    )
  }
}
