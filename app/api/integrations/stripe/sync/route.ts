import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/integrations/encryption'

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
      .eq('platform', 'stripe')
      .eq('is_active', true)
      .single()

    if (integrationError || !integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
    }

    // Decrypt access token
    const accessToken = await decrypt(integration.access_token)

    // Fetch account info
    const accountResponse = await fetch(
      `https://api.stripe.com/v1/accounts/${integration.config?.stripe_user_id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!accountResponse.ok) {
      throw new Error('Failed to fetch Stripe account data')
    }

    const account = await accountResponse.json()

    // Update integration config
    await supabase
      .from('integrations')
      .update({
        config: {
          stripe_user_id: integration.config?.stripe_user_id,
          account_name: account.business_profile?.name || account.email || 'Stripe Account',
          account_type: account.type,
          stats: {},
        },
        last_sync: new Date().toISOString(),
      })
      .eq('id', integration.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Stripe sync error:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
