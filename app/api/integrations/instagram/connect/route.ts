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

    // Store state token temporarily
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    await supabase
      .from('oauth_states')
      .insert({
        user_id: user.id,
        state: state,
        platform: 'instagram',
        expires_at: expiresAt,
      })

    // Build OAuth URL (Instagram Basic Display API)
    const params = new URLSearchParams({
      client_id: process.env.INSTAGRAM_CLIENT_ID!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/instagram/callback`,
      scope: 'user_profile,user_media',
      response_type: 'code',
      state: state,
    })

    const authUrl = `https://api.instagram.com/oauth/authorize?${params}`

    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Instagram connect error:', error)
    return NextResponse.redirect(
      new URL('/integrations?error=connection_failed', request.url)
    )
  }
}
