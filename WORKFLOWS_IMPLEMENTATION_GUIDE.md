# Guide d'Implémentation Workflows - Suite

## ✅ Déjà Créé

### Configuration & Architecture
- ✅ `lib/workflows/workflows.ts` - Configuration des 11 workflows
- ✅ `lib/n8n/client.ts` - Client N8N pour intégration API

### Composants
- ✅ `components/workflows/WorkflowCard.tsx` - Carte workflow
- ✅ `components/workflows/ConfigurationModal.tsx` - Modal de configuration dynamique
- ✅ `components/workflows/WorkflowStats.tsx` - Affichage stats
- ✅ `components/workflows/ExecutionHistory.tsx` - Historique exécutions
- ✅ `components/workflows/ReportViewer.tsx` - Visualiseur de rapports (6 types implémentés)

## 🔨 À Terminer

### 1. Pages

#### app/(dashboard)/workflows/page.tsx

Créer avec:

```typescript
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import WorkflowCard from '@/components/workflows/WorkflowCard'
import ConfigurationModal from '@/components/workflows/ConfigurationModal'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { WORKFLOWS, getWorkflowsByPlan, WorkflowType, WorkflowConfig } from '@/lib/workflows/workflows'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'

export default function WorkflowsPage() {
  const [user, setUser] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [workflows, setWorkflows] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowConfig | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    // Fetch user + subscription + workflows from Supabase
    // Set state
  }

  const handleToggleWorkflow = async (workflowType: WorkflowType, active: boolean) => {
    const endpoint = active ? 'activate' : 'deactivate'
    const res = await fetch(`/api/workflows/${workflowType}/${endpoint}`, { method: 'POST' })
    if (!res.ok) throw new Error('Failed')
    
    if (active && workflows.filter(w => w.is_active).length === 0) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } })
    }
    
    toast.success(active ? 'Workflow activé !' : 'Workflow désactivé')
    fetchData()
  }

  const handleSaveConfiguration = async (config: Record<string, any>) => {
    if (!selectedWorkflow) return
    await fetch(`/api/workflows/${selectedWorkflow.id}/configure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })
    toast.success('Configuration enregistrée !')
    setSelectedWorkflow(null)
    fetchData()
  }

  const handleExecuteWorkflow = async (workflowType: WorkflowType) => {
    await fetch(`/api/workflows/${workflowType}/execute`, { method: 'POST' })
    toast.success('Workflow lancé !')
  }

  const userPlan = subscription?.plan_type || 'starter'
  const availableWorkflows = getWorkflowsByPlan(userPlan)

  const filteredWorkflows = availableWorkflows.filter(workflow => {
    if (searchTerm && !workflow.name.toLowerCase().includes(searchTerm.toLowerCase())) return false
    const workflowData = workflows.find(w => w.workflow_type === workflow.id)
    if (statusFilter === 'active' && !workflowData?.is_active) return false
    if (statusFilter === 'inactive' && workflowData?.is_active) return false
    return true
  })

  return (
    <DashboardLayout>
      {/* Header with stats */}
      <h1>Mes Workflows</h1>
      
      {/* Stats cards: active workflows, executions, time saved */}
      
      {/* First-time banner with quick setup button */}
      
      {/* Filters: search + status filter */}
      
      {/* Grid of WorkflowCards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredWorkflows.map(workflow => (
          <WorkflowCard
            key={workflow.id}
            workflow={workflow}
            isActive={/* ... */}
            userPlan={userPlan}
            onToggle={(active) => handleToggleWorkflow(workflow.id, active)}
            onConfigure={() => setSelectedWorkflow(workflow)}
            onExecute={() => handleExecuteWorkflow(workflow.id)}
            onViewReport={() => router.push(`/workflows/${workflow.id}/report`)}
          />
        ))}
      </div>

      {selectedWorkflow && (
        <ConfigurationModal
          workflow={selectedWorkflow}
          isOpen={true}
          currentConfig={/* ... */}
          onClose={() => setSelectedWorkflow(null)}
          onSave={handleSaveConfiguration}
        />
      )}
    </DashboardLayout>
  )
}
```

#### app/(dashboard)/workflows/[workflow_id]/report/page.tsx

```typescript
"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import ReportViewer from '@/components/workflows/ReportViewer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { WORKFLOWS, WorkflowType } from '@/lib/workflows/workflows'
import { Download, Play, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'

export default function WorkflowReportPage() {
  const params = useParams()
  const router = useRouter()
  const workflowId = params.workflow_id as WorkflowType
  const [report, setReport] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const workflow = WORKFLOWS[workflowId]

  useEffect(() => {
    fetchReport()
  }, [workflowId])

  const fetchReport = async () => {
    const res = await fetch(`/api/workflows/${workflowId}/report`)
    const data = await res.json()
    setReport(data.report)
    setIsLoading(false)
  }

  const handleReExecute = async () => {
    await fetch(`/api/workflows/${workflowId}/execute`, { method: 'POST' })
    toast.success('Workflow relancé !')
    router.push('/workflows')
  }

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    toast.info('Export PDF à venir')
  }

  if (!workflow) return <div>Workflow introuvable</div>

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push('/workflows')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux workflows
        </Button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{workflow.name}</h1>
          <p className="text-gray-600">
            Rapport du {report?.created_at && format(new Date(report.created_at), 'PPP à HH:mm', { locale: fr })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Exporter PDF
          </Button>
          <Button onClick={handleReExecute}>
            <Play className="h-4 w-4 mr-2" />
            Re-exécuter
          </Button>
        </div>
      </div>

      {/* Execution info card */}
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-500">Statut : </span>
            <span className="font-semibold text-green-600">Réussi</span>
          </div>
          <div>
            <span className="text-sm text-gray-500">Durée : </span>
            <span className="font-semibold">{report?.duration || 0}s</span>
          </div>
        </div>
      </Card>

      {/* Report viewer */}
      <ReportViewer workflowType={workflowId} reportData={report?.result} />
    </DashboardLayout>
  )
}
```

### 2. Routes API

Créer dans `app/api/workflows/`:

#### all/route.ts
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getWorkflowsByPlan } from '@/lib/workflows/workflows'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get subscription
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan_type')
    .eq('user_id', user.id)
    .single()

  const plan = sub?.plan_type || 'starter'
  const availableWorkflows = getWorkflowsByPlan(plan)

  // Get user workflows
  const { data: workflows } = await supabase
    .from('workflows')
    .select('*')
    .eq('user_id', user.id)

  return NextResponse.json({ workflows: availableWorkflows, userWorkflows: workflows })
}
```

#### [workflow_id]/route.ts
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: { workflow_id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: workflow } = await supabase
    .from('workflows')
    .select('*')
    .eq('user_id', user.id)
    .eq('workflow_type', params.workflow_id)
    .single()

  // Get last 10 runs
  const { data: runs } = await supabase
    .from('workflow_runs')
    .select('*')
    .eq('workflow_id', workflow?.id)
    .order('created_at', { ascending: false })
    .limit(10)

  return NextResponse.json({ workflow, runs })
}
```

#### [workflow_id]/activate/route.ts
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { WORKFLOWS, canUserAccessWorkflow } from '@/lib/workflows/workflows'
import { n8nClient } from '@/lib/n8n/client'

export async function POST(request: NextRequest, { params }: { params: { workflow_id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const workflowType = params.workflow_id
  const workflowConfig = WORKFLOWS[workflowType]
  
  if (!workflowConfig) {
    return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
  }

  // Check user plan
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan_type')
    .eq('user_id', user.id)
    .single()

  const userPlan = sub?.plan_type || 'starter'
  
  if (!canUserAccessWorkflow(userPlan, workflowType)) {
    return NextResponse.json({ error: 'Plan Premium requis' }, { status: 403 })
  }

  // Check required integrations
  for (const integration of workflowConfig.requiredIntegrations) {
    const { data: int } = await supabase
      .from('integrations')
      .select('id')
      .eq('user_id', user.id)
      .eq('platform', integration)
      .eq('is_active', true)
      .single()

    if (!int) {
      return NextResponse.json({ 
        error: `Intégration ${integration} requise` 
      }, { status: 400 })
    }
  }

  // Create or update workflow
  const { data: existing } = await supabase
    .from('workflows')
    .select('id')
    .eq('user_id', user.id)
    .eq('workflow_type', workflowType)
    .single()

  if (existing) {
    await supabase
      .from('workflows')
      .update({ is_active: true })
      .eq('id', existing.id)
  } else {
    await supabase
      .from('workflows')
      .insert({
        user_id: user.id,
        workflow_type: workflowType,
        is_active: true,
        config: {},
        run_frequency: workflowConfig.defaultFrequency,
      })
  }

  // Activate in N8N
  await n8nClient.activateWorkflow({
    user_id: user.id,
    workflow_type: workflowType,
    config: {},
    frequency: workflowConfig.defaultFrequency,
  })

  return NextResponse.json({ success: true })
}
```

#### [workflow_id]/deactivate/route.ts
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { n8nClient } from '@/lib/n8n/client'

export async function POST(request: NextRequest, { params }: { params: { workflow_id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await supabase
    .from('workflows')
    .update({ is_active: false })
    .eq('user_id', user.id)
    .eq('workflow_type', params.workflow_id)

  await n8nClient.deactivateWorkflow(user.id, params.workflow_id)

  return NextResponse.json({ success: true })
}
```

#### [workflow_id]/configure/route.ts
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { n8nClient } from '@/lib/n8n/client'

export async function POST(request: NextRequest, { params }: { params: { workflow_id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const config = await request.json()

  const { data: workflow } = await supabase
    .from('workflows')
    .select('id, is_active')
    .eq('user_id', user.id)
    .eq('workflow_type', params.workflow_id)
    .single()

  if (workflow) {
    await supabase
      .from('workflows')
      .update({ 
        config,
        run_frequency: config.frequency,
        is_active: true 
      })
      .eq('id', workflow.id)

    if (workflow.is_active) {
      await n8nClient.updateWorkflowConfig(user.id, params.workflow_id, config)
    }
  } else {
    await supabase
      .from('workflows')
      .insert({
        user_id: user.id,
        workflow_type: params.workflow_id,
        config,
        run_frequency: config.frequency,
        is_active: true,
      })

    await n8nClient.activateWorkflow({
      user_id: user.id,
      workflow_type: params.workflow_id,
      config,
      frequency: config.frequency,
    })
  }

  return NextResponse.json({ success: true })
}
```

#### [workflow_id]/execute/route.ts
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { WORKFLOWS } from '@/lib/workflows/workflows'
import { n8nClient } from '@/lib/n8n/client'

export async function POST(request: NextRequest, { params }: { params: { workflow_id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const workflowType = params.workflow_id
  const workflowConfig = WORKFLOWS[workflowType]

  if (!workflowConfig.allowedFrequencies.includes('on_demand')) {
    return NextResponse.json({ error: 'Workflow ne supporte pas l\'exécution manuelle' }, { status: 400 })
  }

  // Rate limiting: max 10 executions per hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const { data: recentRuns, count } = await supabase
    .from('workflow_runs')
    .select('id', { count: 'exact' })
    .eq('user_id', user.id)
    .eq('workflow_type', workflowType)
    .gte('created_at', oneHourAgo.toISOString())

  if ((count || 0) >= 10) {
    return NextResponse.json({ error: 'Rate limit dépassé (max 10/h)' }, { status: 429 })
  }

  const result = await n8nClient.executeWorkflow({
    user_id: user.id,
    workflow_type: workflowType,
    trigger: 'manual',
  })

  return NextResponse.json({ success: true, execution_id: result.execution_id })
}
```

#### [workflow_id]/callback/route.ts
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/n8n/client'

export async function POST(request: NextRequest, { params }: { params: { workflow_id: string } }) {
  const supabase = await createClient()
  
  // Verify webhook signature
  const signature = request.headers.get('x-n8n-signature')
  const body = await request.text()
  
  if (!signature || !verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const data = JSON.parse(body)
  const { user_id, status, result, error_message, duration } = data

  // Create workflow run entry
  const { data: workflow } = await supabase
    .from('workflows')
    .select('id')
    .eq('user_id', user_id)
    .eq('workflow_type', params.workflow_id)
    .single()

  if (!workflow) {
    return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
  }

  await supabase.from('workflow_runs').insert({
    workflow_id: workflow.id,
    user_id,
    workflow_type: params.workflow_id,
    status,
    result,
    error_message,
    duration,
  })

  // Update last_run
  await supabase
    .from('workflows')
    .update({ last_run: new Date().toISOString() })
    .eq('id', workflow.id)

  // Create notification
  if (status === 'success') {
    await supabase.from('notifications').insert({
      user_id,
      type: 'success',
      title: `Workflow ${params.workflow_id} terminé`,
      message: 'Votre rapport est prêt',
      action_url: `/workflows/${params.workflow_id}/report`,
    })

    // Send email if configured
    const { data: workflowData } = await supabase
      .from('workflows')
      .select('config')
      .eq('id', workflow.id)
      .single()

    if (workflowData?.config?.email_notifications) {
      // TODO: Send email via Resend
    }
  }

  return NextResponse.json({ success: true })
}
```

#### [workflow_id]/report/route.ts
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: { workflow_id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: workflow } = await supabase
    .from('workflows')
    .select('id')
    .eq('user_id', user.id)
    .eq('workflow_type', params.workflow_id)
    .single()

  if (!workflow) {
    return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
  }

  const { data: latestRun } = await supabase
    .from('workflow_runs')
    .select('*')
    .eq('workflow_id', workflow.id)
    .eq('status', 'success')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return NextResponse.json({ report: latestRun })
}
```

### 3. Environment Variables

Ajouter à `.env.local`:

```env
# N8N Integration
N8N_API_URL=https://your-n8n-instance.com
N8N_API_KEY=your_n8n_api_key
SYNAPSYS_WEBHOOK_SECRET=your_webhook_secret_key
```

### 4. Tester

```bash
npm run build
npm run dev
```

Visiter `/workflows` et tester:
1. Activation workflow
2. Configuration
3. Exécution manuelle
4. Voir rapport

## Notes d'Implémentation

- Les templates N8N doivent être créés séparément sur votre instance N8N
- Configurer les webhooks N8N pour pointer vers `/api/workflows/[workflow_id]/callback`
- Implémenter l'export PDF avec `jsPDF` ou un service tiers
- Ajouter rate limiting sur les routes sensibles
- Implémenter email notifications via Resend

## Structure Finale

```
app/
  (dashboard)/
    workflows/
      page.tsx ✅ À créer
      [workflow_id]/
        report/
          page.tsx ✅ À créer
  api/
    workflows/
      all/route.ts ✅ À créer
      [workflow_id]/
        route.ts ✅ À créer
        activate/route.ts ✅ À créer
        deactivate/route.ts ✅ À créer
        configure/route.ts ✅ À créer
        execute/route.ts ✅ À créer
        callback/route.ts ✅ À créer
        report/route.ts ✅ À créer

components/
  workflows/
    WorkflowCard.tsx ✅
    ConfigurationModal.tsx ✅
    WorkflowStats.tsx ✅
    ExecutionHistory.tsx ✅
    ReportViewer.tsx ✅

lib/
  workflows/
    workflows.ts ✅
  n8n/
    client.ts ✅
```
