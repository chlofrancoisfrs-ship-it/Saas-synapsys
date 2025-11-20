import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { WORKFLOWS, WorkflowType } from '@/lib/workflows/workflows'
import { n8nClient } from '@/lib/n8n/client'

const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour in ms
const MAX_EXECUTIONS_PER_HOUR = 10

export async function POST(
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
      return NextResponse.json(
        { error: 'Veuillez d\'abord configurer ce workflow' },
        { status: 400 }
      )
    }

    if (!workflow.is_active) {
      return NextResponse.json(
        { error: 'Ce workflow n\'est pas actif' },
        { status: 400 }
      )
    }

    // Rate limiting - check manual executions in last hour
    const oneHourAgo = new Date(Date.now() - RATE_LIMIT_WINDOW).toISOString()
    const { data: recentRuns, count } = await supabase
      .from('workflow_runs')
      .select('*', { count: 'exact' })
      .eq('workflow_id', workflow.id)
      .eq('trigger', 'manual')
      .gte('created_at', oneHourAgo)

    if (count && count >= MAX_EXECUTIONS_PER_HOUR) {
      return NextResponse.json(
        { error: `Limite d'exécutions atteinte (${MAX_EXECUTIONS_PER_HOUR} par heure)` },
        { status: 429 }
      )
    }

    // Create workflow run record
    const { data: workflowRun, error: runError } = await supabase
      .from('workflow_runs')
      .insert({
        workflow_id: workflow.id,
        status: 'running',
        trigger: 'manual',
      })
      .select()
      .single()

    if (runError) throw runError

    // Execute in N8N
    const n8nResult = await n8nClient.executeWorkflow({
      user_id: user.id,
      workflow_type: workflowType,
      trigger: 'manual',
    })

    if (!n8nResult.success) {
      // Update run status to failed
      await supabase
        .from('workflow_runs')
        .update({
          status: 'failed',
          error_message: 'Erreur lors de l\'exécution dans N8N',
          completed_at: new Date().toISOString(),
        })
        .eq('id', workflowRun.id)

      return NextResponse.json(
        { error: 'Erreur lors de l\'exécution dans N8N' },
        { status: 500 }
      )
    }

    // Update run with execution ID
    await supabase
      .from('workflow_runs')
      .update({
        n8n_execution_id: n8nResult.execution_id,
      })
      .eq('id', workflowRun.id)

    // Create notification
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'workflow_executed',
      title: 'Workflow démarré',
      message: `Le workflow ${workflowConfig.name} a été lancé manuellement`,
      data: { 
        workflow_type: workflowType,
        run_id: workflowRun.id,
      },
    })

    return NextResponse.json({
      success: true,
      run_id: workflowRun.id,
      execution_id: n8nResult.execution_id,
    })
  } catch (error: any) {
    console.error('Error executing workflow:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
