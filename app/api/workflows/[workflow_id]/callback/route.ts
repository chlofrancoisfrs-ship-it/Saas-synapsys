import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { WORKFLOWS, WorkflowType } from '@/lib/workflows/workflows'
import { verifyWebhookSignature } from '@/lib/n8n/client'

export async function POST(
  request: NextRequest,
  { params }: { params: { workflow_id: string } }
) {
  try {
    const supabase = await createClient()
    const workflowType = params.workflow_id as WorkflowType
    const workflowConfig = WORKFLOWS[workflowType]

    if (!workflowConfig) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    // Verify webhook signature
    const signature = request.headers.get('x-n8n-signature')
    const rawBody = await request.text()
    
    if (!signature || !verifyWebhookSignature(rawBody, signature)) {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const body = JSON.parse(rawBody)
    const { 
      user_id, 
      run_id, 
      status, 
      result, 
      error_message, 
      duration,
      execution_id,
    } = body

    if (!user_id || !run_id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get workflow run
    const { data: workflowRun } = await supabase
      .from('workflow_runs')
      .select('*')
      .eq('id', run_id)
      .single()

    if (!workflowRun) {
      return NextResponse.json({ error: 'Workflow run not found' }, { status: 404 })
    }

    // Update workflow run
    const updateData: any = {
      status,
      completed_at: new Date().toISOString(),
    }

    if (duration) updateData.duration = duration
    if (result) updateData.result = result
    if (error_message) updateData.error_message = error_message
    if (execution_id) updateData.n8n_execution_id = execution_id

    const { error: updateError } = await supabase
      .from('workflow_runs')
      .update(updateData)
      .eq('id', run_id)

    if (updateError) throw updateError

    // Get workflow config for notifications
    const { data: workflow } = await supabase
      .from('workflows')
      .select('config')
      .eq('id', workflowRun.workflow_id)
      .single()

    const shouldNotify = workflow?.config?.in_app_notifications !== false

    // Create notification based on status
    if (shouldNotify) {
      let notificationTitle = ''
      let notificationMessage = ''
      let notificationType = ''

      if (status === 'success') {
        notificationTitle = 'Workflow terminé'
        notificationMessage = `Le workflow ${workflowConfig.name} s'est terminé avec succès`
        notificationType = 'workflow_success'
      } else if (status === 'failed') {
        notificationTitle = 'Workflow échoué'
        notificationMessage = `Le workflow ${workflowConfig.name} a échoué : ${error_message || 'Erreur inconnue'}`
        notificationType = 'workflow_failed'
      }

      if (notificationTitle) {
        await supabase.from('notifications').insert({
          user_id,
          type: notificationType,
          title: notificationTitle,
          message: notificationMessage,
          data: {
            workflow_type: workflowType,
            run_id,
            status,
          },
        })
      }
    }

    // Send email notification if configured
    if (workflow?.config?.email_notifications && status !== 'running') {
      // TODO: Implement email sending via Resend or similar
      console.log('Email notification would be sent to user:', user_id)
    }

    // Update workflow stats
    if (status === 'success' && result) {
      await supabase
        .from('workflows')
        .update({
          config: {
            ...workflow?.config,
            stats: result.stats || {},
          },
          last_run: new Date().toISOString(),
        })
        .eq('id', workflowRun.workflow_id)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error processing webhook callback:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
