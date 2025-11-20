import { WorkflowType } from '@/lib/workflows/workflows'

const N8N_API_URL = process.env.N8N_API_URL || ''
const N8N_API_KEY = process.env.N8N_API_KEY || ''
const SYNAPSYS_WEBHOOK_SECRET = process.env.SYNAPSYS_WEBHOOK_SECRET || ''

export interface N8NWorkflowActivation {
  user_id: string
  workflow_type: WorkflowType
  config: Record<string, any>
  frequency: string
}

export interface N8NWorkflowExecution {
  user_id: string
  workflow_type: WorkflowType
  trigger: 'manual' | 'scheduled'
}

export class N8NClient {
  private baseUrl: string
  private apiKey: string

  constructor() {
    this.baseUrl = N8N_API_URL
    this.apiKey = N8N_API_KEY
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`N8N API error: ${response.status} - ${errorText}`)
    }

    return response.json()
  }

  async activateWorkflow(data: N8NWorkflowActivation): Promise<{ success: boolean; n8n_workflow_id?: string }> {
    try {
      const result = await this.request(`/webhook/synapsys/${data.workflow_type}/activate`, {
        method: 'POST',
        body: JSON.stringify({
          user_id: data.user_id,
          config: data.config,
          frequency: data.frequency,
        }),
      })

      return {
        success: true,
        n8n_workflow_id: result.workflow_id,
      }
    } catch (error) {
      console.error('Error activating N8N workflow:', error)
      return { success: false }
    }
  }

  async deactivateWorkflow(userId: string, workflowType: WorkflowType): Promise<{ success: boolean }> {
    try {
      await this.request(`/webhook/synapsys/${workflowType}/deactivate`, {
        method: 'POST',
        body: JSON.stringify({
          user_id: userId,
        }),
      })

      return { success: true }
    } catch (error) {
      console.error('Error deactivating N8N workflow:', error)
      return { success: false }
    }
  }

  async updateWorkflowConfig(
    userId: string,
    workflowType: WorkflowType,
    config: Record<string, any>
  ): Promise<{ success: boolean }> {
    try {
      await this.request(`/webhook/synapsys/${workflowType}/update`, {
        method: 'POST',
        body: JSON.stringify({
          user_id: userId,
          config,
        }),
      })

      return { success: true }
    } catch (error) {
      console.error('Error updating N8N workflow config:', error)
      return { success: false }
    }
  }

  async executeWorkflow(data: N8NWorkflowExecution): Promise<{ success: boolean; execution_id?: string }> {
    try {
      const result = await this.request(`/webhook/synapsys/${data.workflow_type}/execute`, {
        method: 'POST',
        body: JSON.stringify({
          user_id: data.user_id,
          trigger: data.trigger,
        }),
      })

      return {
        success: true,
        execution_id: result.execution_id,
      }
    } catch (error) {
      console.error('Error executing N8N workflow:', error)
      return { success: false }
    }
  }

  async getWorkflowStatus(userId: string, workflowType: WorkflowType): Promise<{
    success: boolean
    is_active?: boolean
    last_execution?: string
    next_execution?: string
  }> {
    try {
      const result = await this.request(`/webhook/synapsys/${workflowType}/status?user_id=${userId}`, {
        method: 'GET',
      })

      return {
        success: true,
        is_active: result.is_active,
        last_execution: result.last_execution,
        next_execution: result.next_execution,
      }
    } catch (error) {
      console.error('Error getting N8N workflow status:', error)
      return { success: false }
    }
  }
}

export const n8nClient = new N8NClient()

// Webhook signature verification
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const crypto = require('crypto')
  const expectedSignature = crypto
    .createHmac('sha256', SYNAPSYS_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex')

  return signature === expectedSignature
}

// Generate webhook signature for outgoing requests
export function generateWebhookSignature(payload: string): string {
  const crypto = require('crypto')
  return crypto
    .createHmac('sha256', SYNAPSYS_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex')
}
