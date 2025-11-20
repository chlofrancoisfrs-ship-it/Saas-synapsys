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

    // Check for OAuth errors
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
      .eq('platform', 'youtube')
      .single()

    if (stateError || !stateData) {
      return NextResponse.redirect(
        new URL('/integrations?error=invalid_state', request.url)
      )
    }

    // Check if state is expired
    if (new Date(stateData.expires_at) < new Date()) {
      await supabase.from('oauth_states').delete().eq('id', stateData.id)
      return NextResponse.redirect(
        new URL('/integrations?error=state_expired', request.url)
      )
    }

    // Delete used state
    await supabase.from('oauth_states').delete().eq('id', stateData.id)

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/youtube/callback`,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens')
    }

    const tokens = await tokenResponse.json()

    // Fetch YouTube channel info
    const channelResponse = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true',
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    )

    const channelData = await channelResponse.json()
    const channel = channelData.items?.[0]

    if (!channel) {
      throw new Error('No YouTube channel found')
    }

    // Encrypt tokens
    const encryptedAccessToken = await encrypt(tokens.access_token)
    const encryptedRefreshToken = tokens.refresh_token
      ? await encrypt(tokens.refresh_token)
      : null

    // Calculate token expiry
    const expiresAt = new Date(
      Date.now() + (tokens.expires_in || 3600) * 1000
    ).toISOString()

    // Store or update integration
    const { data: existingIntegration } = await supabase
      .from('integrations')
      .select('id')
      .eq('user_id', user.id)
      .eq('platform', 'youtube')
      .single()

    const integrationData = {
      user_id: user.id,
      platform: 'youtube',
      access_token: encryptedAccessToken,
      refresh_token: encryptedRefreshToken,
      token_expires_at: expiresAt,
      is_active: true,
      config: {
        channel_id: channel.id,
        channel_name: channel.snippet.title,
        channel_thumbnail: channel.snippet.thumbnails.default.url,
        stats: {
          Abonnés: parseInt(channel.statistics.subscriberCount).toLocaleString('fr-FR'),
          Vidéos: parseInt(channel.statistics.videoCount).toLocaleString('fr-FR'),
          Vues: parseInt(channel.statistics.viewCount).toLocaleString('fr-FR'),
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
      new URL('/integrations?success=youtube_connected', request.url)
    )
  } catch (error) {
    console.error('YouTube callback error:', error)
    return NextResponse.redirect(
      new URL('/integrations?error=connection_failed', request.url)
    )
  }
}
