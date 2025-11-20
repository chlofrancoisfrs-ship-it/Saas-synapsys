import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { WORKFLOWS, WorkflowType, canUserAccessWorkflow } from '@/lib/workflows/workflows'
import { n8nClient } from '@/lib/n8n/client'

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

    // Check user plan
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_type')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    const userPlan = subscription?.plan_type || 'starter'

    if (!canUserAccessWorkflow(userPlan, workflowType)) {
      return NextResponse.json(
        { error: 'Ce workflow nécessite un plan Premium' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { config } = body

    if (!config) {
      return NextResponse.json({ error: 'Configuration required' }, { status: 400 })
    }

    // Validate required fields
    for (const field of workflowConfig.configFields) {
      if (field.required && !config[field.key]) {
        return NextResponse.json(
          { error: `Le champ "${field.label}" est requis` },
          { status: 400 }
        )
      }
    }

    // Check if workflow exists
    let { data: workflow } = await supabase
      .from('workflows')
      .select('*')
      .eq('user_id', user.id)
      .eq('workflow_type', workflowType)
      .single()

    if (workflow) {
      // Update existing workflow
      const { data: updatedWorkflow, error: updateError } = await supabase
        .from('workflows')
        .update({
          config,
          updated_at: new Date().toISOString(),
        })
        .eq('id', workflow.id)
        .select()
        .single()

      if (updateError) throw updateError

      // Update config in N8N if active
      if (workflow.is_active) {
        await n8nClient.updateWorkflowConfig(user.id, workflowType, config)
      }

      return NextResponse.json({
        success: true,
        workflow: updatedWorkflow,
      })
    } else {
      // Create new workflow
      const { data: newWorkflow, error: createError } = await supabase
        .from('workflows')
        .insert({
          user_id: user.id,
          workflow_type: workflowType,
          config,
          is_active: false,
        })
        .select()
        .single()

      if (createError) throw createError

      return NextResponse.json({
        success: true,
        workflow: newWorkflow,
      })
    }
  } catch (error: any) {
    console.error('Error configuring workflow:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
