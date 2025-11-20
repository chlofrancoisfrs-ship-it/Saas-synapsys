"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { UserRow, SubscriptionRow } from '@/types/database'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import WorkflowCard from '@/components/workflows/WorkflowCard'
import ConfigurationModal from '@/components/workflows/ConfigurationModal'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { WORKFLOWS, WorkflowConfig, WorkflowType, getWorkflowsByPlan } from '@/lib/workflows/workflows'
import { Zap, Search, Filter, Sparkles, X } from 'lucide-react'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'

interface WorkflowData {
  id: string
  user_id: string
  workflow_type: WorkflowType
  is_active: boolean
  config: any
  last_run?: string
  next_run?: string
}

export default function WorkflowsPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserRow | null>(null)
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null)
  const [workflows, setWorkflows] = useState<WorkflowData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [planFilter, setPlanFilter] = useState<'all' | 'starter' | 'premium'>('all')
  const [showFirstTimeBanner, setShowFirstTimeBanner] = useState(false)
  const [configModalOpen, setConfigModalOpen] = useState(false)
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowType | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()

      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        router.push('/auth/login')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', authUser.id)
        .eq('status', 'active')
        .single()

      const { data: workflowsData } = await supabase
        .from('workflows')
        .select('*')
        .eq('user_id', authUser.id)

      setUser(userData)
      setSubscription(subData)
      setWorkflows(workflowsData || [])

      // Show first-time banner if no workflows configured
      if (!workflowsData || workflowsData.length === 0) {
        setShowFirstTimeBanner(true)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleWorkflow = async (workflowType: WorkflowType, isActive: boolean) => {
    try {
      const endpoint = isActive 
        ? `/api/workflows/${workflowType}/activate`
        : `/api/workflows/${workflowType}/deactivate`

      const response = await fetch(endpoint, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur')
      }

      await loadData()
      toast.success(isActive ? 'Workflow activé' : 'Workflow désactivé')

      // Confetti on first activation
      const activeWorkflows = workflows.filter(w => w.is_active)
      if (isActive && activeWorkflows.length === 0) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
      }
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue')
      throw error
    }
  }

  const handleConfigureWorkflow = (workflowType: WorkflowType) => {
    setSelectedWorkflow(workflowType)
    setConfigModalOpen(true)
  }

  const handleSaveConfig = async (config: Record<string, any>) => {
    if (!selectedWorkflow) return

    try {
      const response = await fetch(`/api/workflows/${selectedWorkflow}/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur')
      }

      await loadData()
      toast.success('Configuration enregistrée')
      setConfigModalOpen(false)
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la sauvegarde')
      throw error
    }
  }

  const handleExecuteWorkflow = async (workflowType: WorkflowType) => {
    try {
      const response = await fetch(`/api/workflows/${workflowType}/execute`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur')
      }

      toast.success('Workflow démarré')
      
      setTimeout(() => {
        loadData()
      }, 2000)
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'exécution')
    }
  }

  const handleViewReport = (workflowType: WorkflowType, runId: string) => {
    router.push(`/workflows/${workflowType}/report?run_id=${runId}`)
  }

  const handleQuickSetup = () => {
    const firstWorkflow = Object.keys(WORKFLOWS)[0] as WorkflowType
    handleConfigureWorkflow(firstWorkflow)
    setShowFirstTimeBanner(false)
  }

  const getWorkflowData = (workflowType: WorkflowType): WorkflowData | undefined => {
    return workflows.find(w => w.workflow_type === workflowType)
  }

  const userPlan = subscription?.plan_type || 'starter'
  const availableWorkflows = getWorkflowsByPlan(userPlan)

  // Filter workflows
  const filteredWorkflows = availableWorkflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const workflowData = getWorkflowData(workflow.id)
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && workflowData?.is_active) ||
                         (statusFilter === 'inactive' && (!workflowData || !workflowData.is_active))
    
    const matchesPlan = planFilter === 'all' ||
                       (planFilter === 'starter' && !workflow.isPremiumOnly) ||
                       (planFilter === 'premium' && workflow.isPremiumOnly)

    return matchesSearch && matchesStatus && matchesPlan
  })

  // Calculate stats
  const totalWorkflows = availableWorkflows.length
  const activeWorkflows = workflows.filter(w => w.is_active).length
  const totalExecutions = workflows.reduce((sum, w) => {
    // This would come from workflow_runs table
    return sum
  }, 0)

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Workflows Automatisés</h1>
            <p className="text-gray-600 mt-1">
              Configurez et gérez vos workflows d&apos;automatisation
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {userPlan === 'premium' ? '✨ Premium' : 'Starter'}
          </Badge>
        </div>

        {/* First-time banner */}
        {showFirstTimeBanner && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <Sparkles className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Bienvenue dans vos Workflows !
                    </h3>
                    <p className="text-gray-700 mb-4">
                      Vous n&apos;avez pas encore configuré de workflow. Commencez par en activer un
                      pour automatiser vos tâches et booster votre productivité.
                    </p>
                    <Button onClick={handleQuickSetup} className="bg-blue-600 hover:bg-blue-700">
                      <Zap className="h-4 w-4 mr-2" />
                      Configuration rapide
                    </Button>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFirstTimeBanner(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Workflows disponibles</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{totalWorkflows}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Workflows actifs</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{activeWorkflows}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Exécutions ce mois</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{totalExecutions}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Filter className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher un workflow..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                >
                  Tous
                </Button>
                <Button
                  variant={statusFilter === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('active')}
                >
                  Actifs
                </Button>
                <Button
                  variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('inactive')}
                >
                  Inactifs
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={planFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPlanFilter('all')}
                >
                  Tous
                </Button>
                <Button
                  variant={planFilter === 'starter' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPlanFilter('starter')}
                >
                  Starter
                </Button>
                <Button
                  variant={planFilter === 'premium' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPlanFilter('premium')}
                >
                  Premium
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workflows Grid */}
        {filteredWorkflows.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Zap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun workflow trouvé
              </h3>
              <p className="text-gray-600">
                Essayez de modifier vos filtres de recherche
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredWorkflows.map(workflow => {
              const workflowData = getWorkflowData(workflow.id)
              return (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  isActive={workflowData?.is_active || false}
                  userPlan={userPlan}
                  lastRun={workflowData?.last_run}
                  nextRun={workflowData?.next_run}
                  stats={workflowData?.config?.stats || {}}
                  onToggle={(active) => handleToggleWorkflow(workflow.id, active)}
                  onConfigure={() => handleConfigureWorkflow(workflow.id)}
                  onExecute={() => handleExecuteWorkflow(workflow.id)}
                  onViewReport={() => {
                    if (workflowData?.last_run) {
                      handleViewReport(workflow.id, workflowData.id)
                    }
                  }}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Configuration Modal */}
      {selectedWorkflow && (
        <ConfigurationModal
          workflow={WORKFLOWS[selectedWorkflow]}
          isOpen={configModalOpen}
          currentConfig={getWorkflowData(selectedWorkflow)?.config || {}}
          onClose={() => {
            setConfigModalOpen(false)
            setSelectedWorkflow(null)
          }}
          onSave={handleSaveConfig}
        />
      )}
    </DashboardLayout>
  )
}
