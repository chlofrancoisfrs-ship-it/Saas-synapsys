import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { WORKFLOWS, WorkflowType } from '@/lib/workflows/workflows'
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

    // Get workflow
    const { data: workflow } = await supabase
      .from('workflows')
      .select('*')
      .eq('user_id', user.id)
      .eq('workflow_type', workflowType)
      .single()

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    // Deactivate in N8N
    const n8nResult = await n8nClient.deactivateWorkflow(user.id, workflowType)

    if (!n8nResult.success) {
      console.error('Error deactivating in N8N, continuing anyway')
    }

    // Update workflow in database
    const { data: updatedWorkflow, error: updateError } = await supabase
      .from('workflows')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', workflow.id)
      .select()
      .single()

    if (updateError) throw updateError

    // Create notification
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'workflow_deactivated',
      title: 'Workflow désactivé',
      message: `Le workflow ${workflowConfig.name} a été désactivé`,
      data: { workflow_type: workflowType },
    })

    return NextResponse.json({
      success: true,
      workflow: updatedWorkflow,
    })
  } catch (error: any) {
    console.error('Error deactivating workflow:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
