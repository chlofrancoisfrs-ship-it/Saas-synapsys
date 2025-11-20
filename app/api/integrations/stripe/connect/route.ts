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
        platform: 'stripe',
        expires_at: expiresAt,
      })

    // Build Stripe Connect OAuth URL
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.STRIPE_CONNECT_CLIENT_ID!,
      scope: 'read_write',
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/stripe/callback`,
      state: state,
    })

    const authUrl = `https://connect.stripe.com/oauth/authorize?${params}`

    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Stripe connect error:', error)
    return NextResponse.redirect(
      new URL('/integrations?error=connection_failed', request.url)
    )
  }
}
