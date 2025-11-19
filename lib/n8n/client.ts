// N8N Client - Configuration pour interagir avec l'API N8N

interface N8NConfig {
  apiUrl: string
  apiKey: string
}

class N8NClient {
  private config: N8NConfig

  constructor() {
    this.config = {
      apiUrl: process.env.N8N_API_URL || '',
      apiKey: process.env.N8N_API_KEY || '',
    }
  }

  async createWorkflow(userId: string, workflowData: any) {
    try {
      const response = await fetch(`${this.config.apiUrl}/workflows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': this.config.apiKey,
        },
        body: JSON.stringify({
          ...workflowData,
          userId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create workflow')
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating N8N workflow:', error)
      throw error
    }
  }

  async getWorkflow(workflowId: string) {
    try {
      const response = await fetch(`${this.config.apiUrl}/workflows/${workflowId}`, {
        headers: {
          'X-N8N-API-KEY': this.config.apiKey,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to get workflow')
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting N8N workflow:', error)
      throw error
    }
  }

  async activateWorkflow(workflowId: string) {
    try {
      const response = await fetch(`${this.config.apiUrl}/workflows/${workflowId}/activate`, {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': this.config.apiKey,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to activate workflow')
      }

      return await response.json()
    } catch (error) {
      console.error('Error activating N8N workflow:', error)
      throw error
    }
  }

  async deactivateWorkflow(workflowId: string) {
    try {
      const response = await fetch(`${this.config.apiUrl}/workflows/${workflowId}/deactivate`, {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': this.config.apiKey,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to deactivate workflow')
      }

      return await response.json()
    } catch (error) {
      console.error('Error deactivating N8N workflow:', error)
      throw error
    }
  }

  async deleteWorkflow(workflowId: string) {
    try {
      const response = await fetch(`${this.config.apiUrl}/workflows/${workflowId}`, {
        method: 'DELETE',
        headers: {
          'X-N8N-API-KEY': this.config.apiKey,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete workflow')
      }

      return true
    } catch (error) {
      console.error('Error deleting N8N workflow:', error)
      throw error
    }
  }
}

export const n8nClient = new N8NClient()
