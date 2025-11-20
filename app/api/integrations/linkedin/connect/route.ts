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
        platform: 'linkedin',
        expires_at: expiresAt,
      })

    // Build OAuth URL
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/linkedin/callback`,
      scope: 'r_liteprofile r_emailaddress w_member_social r_organization_social rw_organization_admin',
      state: state,
    })

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params}`

    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('LinkedIn connect error:', error)
    return NextResponse.redirect(
      new URL('/integrations?error=connection_failed', request.url)
    )
  }
}
