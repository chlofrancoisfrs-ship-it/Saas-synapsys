import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { decrypt, encrypt } from '@/lib/integrations/encryption'

async function refreshAccessToken(refreshToken: string) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
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
      .eq('platform', 'youtube')
      .eq('is_active', true)
      .single()

    if (integrationError || !integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
    }

    // Decrypt tokens
    let accessToken = await decrypt(integration.access_token)

    // Check if token needs refresh (if expires in < 5 minutes)
    const expiresAt = new Date(integration.token_expires_at)
    const now = new Date()
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000)

    if (expiresAt < fiveMinutesFromNow && integration.refresh_token) {
      const refreshToken = await decrypt(integration.refresh_token)
      const newTokens = await refreshAccessToken(refreshToken)

      accessToken = newTokens.access_token
      const encryptedAccessToken = await encrypt(accessToken)
      const newExpiresAt = new Date(
        Date.now() + (newTokens.expires_in || 3600) * 1000
      ).toISOString()

      await supabase
        .from('integrations')
        .update({
          access_token: encryptedAccessToken,
          token_expires_at: newExpiresAt,
        })
        .eq('id', integration.id)
    }

    // Fetch latest channel data
    const channelResponse = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!channelResponse.ok) {
      throw new Error('Failed to fetch YouTube data')
    }

    const channelData = await channelResponse.json()
    const channel = channelData.items?.[0]

    if (!channel) {
      throw new Error('No YouTube channel found')
    }

    // Update integration config
    await supabase
      .from('integrations')
      .update({
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
      })
      .eq('id', integration.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('YouTube sync error:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
