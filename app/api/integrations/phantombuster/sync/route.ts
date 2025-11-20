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
      .eq('platform', 'phantombuster')
      .eq('is_active', true)
      .single()

    if (integrationError || !integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
    }

    // Decrypt API key
    const apiKey = await decrypt(integration.access_token)

    // Fetch latest user data
    const userResponse = await fetch('https://api.phantombuster.com/api/v2/user', {
      headers: {
        'X-Phantombuster-Key': apiKey,
      },
    })

    if (!userResponse.ok) {
      throw new Error('Failed to fetch PhantomBuster data')
    }

    const userData = await userResponse.json()

    // Fetch agents list
    const agentsResponse = await fetch('https://api.phantombuster.com/api/v2/agents/fetch-all', {
      headers: {
        'X-Phantombuster-Key': apiKey,
      },
    })

    let agentCount = 0
    if (agentsResponse.ok) {
      const agentsData = await agentsResponse.json()
      agentCount = agentsData.length || 0
    }

    // Update integration config
    await supabase
      .from('integrations')
      .update({
        config: {
          user_id: userData.id,
          account_name: userData.email,
          plan: userData.plan,
          stats: {
            Agents: agentCount.toLocaleString('fr-FR'),
            'Minutes restantes': userData.timeLeft?.toLocaleString('fr-FR') || '0',
          },
        },
        last_sync: new Date().toISOString(),
      })
      .eq('id', integration.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PhantomBuster sync error:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
