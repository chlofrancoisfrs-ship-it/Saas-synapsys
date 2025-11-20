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

    // Get workflow
    const { data: workflow } = await supabase
      .from('workflows')
      .select('*')
      .eq('user_id', user.id)
      .eq('workflow_type', workflowType)
      .single()

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not configured' }, { status: 404 })
    }

    // Get run_id from query params if provided
    const { searchParams } = new URL(request.url)
    const runId = searchParams.get('run_id')

    let workflowRun

    if (runId) {
      // Get specific run
      const { data } = await supabase
        .from('workflow_runs')
        .select('*')
        .eq('id', runId)
        .eq('workflow_id', workflow.id)
        .single()

      workflowRun = data
    } else {
      // Get latest successful run
      const { data } = await supabase
        .from('workflow_runs')
        .select('*')
        .eq('workflow_id', workflow.id)
        .eq('status', 'success')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      workflowRun = data
    }

    if (!workflowRun) {
      return NextResponse.json(
        { error: 'No successful run found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      workflow: {
        type: workflowType,
        name: workflowConfig.name,
        description: workflowConfig.description,
      },
      run: {
        id: workflowRun.id,
        status: workflowRun.status,
        created_at: workflowRun.created_at,
        completed_at: workflowRun.completed_at,
        duration: workflowRun.duration,
        result: workflowRun.result,
        error_message: workflowRun.error_message,
      },
    })
  } catch (error: any) {
    console.error('Error fetching report:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
