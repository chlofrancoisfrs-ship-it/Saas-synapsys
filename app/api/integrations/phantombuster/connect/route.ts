import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { encrypt } from '@/lib/integrations/encryption'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { apiKey } = body

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 })
    }

    // Validate PhantomBuster API key by fetching user info
    const userResponse = await fetch('https://api.phantombuster.com/api/v2/user', {
      headers: {
        'X-Phantombuster-Key': apiKey,
      },
    })

    if (!userResponse.ok) {
      return NextResponse.json({ error: 'Invalid PhantomBuster API key' }, { status: 400 })
    }

    const userData = await userResponse.json()

    // Fetch agents list to get stats
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

    // Encrypt API key
    const encryptedApiKey = await encrypt(apiKey)

    // Store or update integration
    const { data: existingIntegration } = await supabase
      .from('integrations')
      .select('id')
      .eq('user_id', user.id)
      .eq('platform', 'phantombuster')
      .single()

    const integrationData = {
      user_id: user.id,
      platform: 'phantombuster',
      access_token: encryptedApiKey,
      refresh_token: null,
      token_expires_at: null,
      is_active: true,
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
    }

    if (existingIntegration) {
      await supabase
        .from('integrations')
        .update(integrationData)
        .eq('id', existingIntegration.id)
    } else {
      await supabase.from('integrations').insert(integrationData)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PhantomBuster connect error:', error)
    return NextResponse.json({ error: 'Connection failed' }, { status: 500 })
  }
}
