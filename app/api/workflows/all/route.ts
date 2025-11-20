import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { WORKFLOWS, getWorkflowsByPlan } from '@/lib/workflows/workflows'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_type')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    const userPlan = subscription?.plan_type || 'starter'

    // Get available workflows for user's plan
    const availableWorkflows = getWorkflowsByPlan(userPlan)

    // Get user's workflow configurations
    const { data: userWorkflows } = await supabase
      .from('workflows')
      .select('*')
      .eq('user_id', user.id)

    // Combine workflow configs with user data
    const workflowsWithData = availableWorkflows.map(workflow => {
      const userWorkflow = userWorkflows?.find(w => w.workflow_type === workflow.id)
      return {
        ...workflow,
        user_workflow: userWorkflow || null,
        is_active: userWorkflow?.is_active || false,
        is_configured: !!userWorkflow,
      }
    })

    return NextResponse.json({
      workflows: workflowsWithData,
      user_plan: userPlan,
    })
  } catch (error: any) {
    console.error('Error fetching workflows:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
