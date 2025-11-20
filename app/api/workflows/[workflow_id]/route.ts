import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { WORKFLOWS, WorkflowType } from '@/lib/workflows/workflows'

export async function GET(
  request: NextRequest,
  { params }: { params: { workflow_id: string } }
) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workflowType = params.workflow_id as WorkflowType
    const workflowConfig = WORKFLOWS[workflowType]

    if (!workflowConfig) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    // Get user's workflow configuration
    const { data: workflow } = await supabase
      .from('workflows')
      .select('*')
      .eq('user_id', user.id)
      .eq('workflow_type', workflowType)
      .single()

    // Get last 10 runs
    const { data: runs } = await supabase
      .from('workflow_runs')
      .select('*')
      .eq('workflow_id', workflow?.id || '')
      .order('created_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      workflow: {
        ...workflowConfig,
        user_config: workflow || null,
        is_active: workflow?.is_active || false,
        is_configured: !!workflow,
      },
      runs: runs || [],
    })
  } catch (error: any) {
    console.error('Error fetching workflow:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
