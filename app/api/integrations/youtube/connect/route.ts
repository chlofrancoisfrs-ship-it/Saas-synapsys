import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { generateStateToken } from '@/lib/integrations/encryption'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Generate CSRF state token
    const state = generateStateToken()

    // Store state token temporarily (expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    await supabase
      .from('oauth_states')
      .insert({
        user_id: user.id,
        state: state,
        platform: 'youtube',
        expires_at: expiresAt,
      })

    // Build OAuth URL
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/youtube/callback`,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.analytics.readonly https://www.googleapis.com/auth/userinfo.email',
      access_type: 'offline',
      prompt: 'consent',
      state: state,
    })

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`

    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('YouTube connect error:', error)
    return NextResponse.redirect(
      new URL('/integrations?error=connection_failed', request.url)
    )
  }
}
