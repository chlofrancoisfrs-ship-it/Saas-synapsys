"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { UserRow } from '@/types/database'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import ReportViewer from '@/components/workflows/ReportViewer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { WORKFLOWS, WorkflowType } from '@/lib/workflows/workflows'
import { ArrowLeft, Download, Calendar, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'

interface WorkflowRun {
  id: string
  workflow_id: string
  status: 'success' | 'failed' | 'running'
  created_at: string
  completed_at?: string
  duration?: number
  result?: any
  error_message?: string
}

export default function WorkflowReportPage({ params }: { params: { workflow_id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const runId = searchParams.get('run_id')
  
  const [user, setUser] = useState<UserRow | null>(null)
  const [workflowRun, setWorkflowRun] = useState<WorkflowRun | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  const workflowType = params.workflow_id as WorkflowType
  const workflowConfig = WORKFLOWS[workflowType]

  useEffect(() => {
    loadData()
  }, [runId])

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

      setUser(userData)

      if (runId) {
        // Load specific run
        const { data: runData } = await supabase
          .from('workflow_runs')
          .select('*')
          .eq('id', runId)
          .single()

        setWorkflowRun(runData)
      } else {
        // Load latest successful run
        const { data: runData } = await supabase
          .from('workflow_runs')
          .select('*')
          .eq('user_id', authUser.id)
          .eq('status', 'success')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        setWorkflowRun(runData)
      }
    } catch (error) {
      console.error('Error loading report:', error)
      toast.error('Erreur lors du chargement du rapport')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportPDF = async () => {
    try {
      setIsExporting(true)
      // TODO: Implement PDF export using jsPDF or similar
      toast.success('Export PDF en cours de développement')
    } catch (error) {
      toast.error('Erreur lors de l\'export PDF')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExecuteAgain = async () => {
    try {
      const response = await fetch(`/api/workflows/${workflowType}/execute`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur')
      }

      toast.success('Nouvelle exécution lancée')
      router.push('/workflows')
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'exécution')
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    )
  }

  if (!workflowRun) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <XCircle className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Aucun rapport disponible
          </h2>
          <p className="text-gray-600 mb-6">
            Ce workflow n&apos;a pas encore été exécuté avec succès
          </p>
          <Button onClick={() => router.push('/workflows')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux workflows
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/workflows')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${workflowConfig.color}15` }}
                >
                  <workflowConfig.icon className="h-5 w-5" style={{ color: workflowConfig.color }} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {workflowConfig.name}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {workflowConfig.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExecuteAgain}
            >
              <Loader2 className="h-4 w-4 mr-2" />
              Exécuter à nouveau
            </Button>
            <Button
              onClick={handleExportPDF}
              disabled={isExporting}
              style={{ backgroundColor: workflowConfig.color }}
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Export en cours...' : 'Exporter PDF'}
            </Button>
          </div>
        </div>

        {/* Execution Info */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {workflowRun.status === 'success' && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  {workflowRun.status === 'failed' && (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  {workflowRun.status === 'running' && (
                    <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                  )}
                  <span className="text-sm font-medium text-gray-600">Statut</span>
                </div>
                <Badge
                  variant={
                    workflowRun.status === 'success'
                      ? 'default'
                      : workflowRun.status === 'failed'
                      ? 'destructive'
                      : 'outline'
                  }
                  className={workflowRun.status === 'success' ? 'bg-green-100 text-green-700' : ''}
                >
                  {workflowRun.status === 'success' && 'Réussi'}
                  {workflowRun.status === 'failed' && 'Échec'}
                  {workflowRun.status === 'running' && 'En cours'}
                </Badge>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Exécuté</span>
                </div>
                <p className="text-sm text-gray-900">
                  {formatDistanceToNow(new Date(workflowRun.created_at), {
                    addSuffix: true,
                    locale: fr
                  })}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Durée</span>
                </div>
                <p className="text-sm text-gray-900">
                  {workflowRun.duration
                    ? `${Math.floor(workflowRun.duration / 60)}m ${workflowRun.duration % 60}s`
                    : 'N/A'}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">ID d&apos;exécution</span>
                </div>
                <p className="text-xs text-gray-900 font-mono">
                  {workflowRun.id.substring(0, 8)}...
                </p>
              </div>
            </div>

            {workflowRun.error_message && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-900 font-medium mb-1">Erreur</p>
                <p className="text-sm text-red-700">{workflowRun.error_message}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Report Content */}
        {workflowRun.status === 'success' && workflowRun.result && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Résultats du rapport
              </h2>
              <ReportViewer
                workflowType={workflowType}
                reportData={workflowRun.result}
              />
            </CardContent>
          </Card>
        )}

        {workflowRun.status === 'running' && (
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="h-12 w-12 mx-auto mb-4 text-blue-600 animate-spin" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Exécution en cours...
              </h3>
              <p className="text-gray-600">
                Le rapport sera disponible une fois l&apos;exécution terminée
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
