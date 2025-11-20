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

    // Check required integrations
    for (const integration of workflowConfig.requiredIntegrations) {
      const { data: integrationData } = await supabase
        .from('integrations')
        .select('id')
        .eq('user_id', user.id)
        .eq('platform', integration)
        .eq('is_active', true)
        .single()

      if (!integrationData) {
        return NextResponse.json(
          { error: `L'intégration ${integration} est requise et doit être active` },
          { status: 400 }
        )
      }
    }

    // Get or create workflow
    let { data: workflow } = await supabase
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

    // Activate in N8N
    const n8nResult = await n8nClient.activateWorkflow({
      user_id: user.id,
      workflow_type: workflowType,
      config: workflow.config,
      frequency: workflow.config.frequency || workflowConfig.defaultFrequency,
    })

    if (!n8nResult.success) {
      return NextResponse.json(
        { error: 'Erreur lors de l\'activation dans N8N' },
        { status: 500 }
      )
    }

    // Update workflow in database
    const { data: updatedWorkflow, error: updateError } = await supabase
      .from('workflows')
      .update({
        is_active: true,
        n8n_workflow_id: n8nResult.n8n_workflow_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', workflow.id)
      .select()
      .single()

    if (updateError) throw updateError

    // Create notification
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'workflow_activated',
      title: 'Workflow activé',
      message: `Le workflow ${workflowConfig.name} a été activé avec succès`,
      data: { workflow_type: workflowType },
    })

    return NextResponse.json({
      success: true,
      workflow: updatedWorkflow,
    })
  } catch (error: any) {
    console.error('Error activating workflow:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
