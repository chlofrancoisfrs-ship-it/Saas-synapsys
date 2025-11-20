import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

interface WorkflowRun {
  id: string
  status: 'success' | 'failed' | 'running'
  created_at: string
  duration?: number
  result?: any
}

interface ExecutionHistoryProps {
  runs: WorkflowRun[]
  onViewReport?: (runId: string) => void
}

export default function ExecutionHistory({ runs, onViewReport }: ExecutionHistoryProps) {
  if (runs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="h-12 w-12 mx-auto mb-3 text-gray-400" />
        <p>Aucune exécution pour le moment</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {runs.map(run => (
        <div
          key={run.id}
          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3 flex-1">
            {run.status === 'success' && (
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
            )}
            {run.status === 'failed' && (
              <XCircle className="h-5 w-5 text-red-600 shrink-0" />
            )}
            {run.status === 'running' && (
              <Clock className="h-5 w-5 text-blue-600 shrink-0 animate-spin" />
            )}

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    run.status === 'success'
                      ? 'default'
                      : run.status === 'failed'
                      ? 'destructive'
                      : 'outline'
                  }
                  className={run.status === 'success' ? 'bg-green-100 text-green-700' : ''}
                >
                  {run.status === 'success' && 'Réussi'}
                  {run.status === 'failed' && 'Échec'}
                  {run.status === 'running' && 'En cours'}
                </Badge>
                <span className="text-sm text-gray-600">
                  {formatDistanceToNow(new Date(run.created_at), { addSuffix: true, locale: fr })}
                </span>
              </div>
              {run.duration && (
                <p className="text-xs text-gray-500 mt-1">
                  Durée : {Math.floor(run.duration / 60)}m {run.duration % 60}s
                </p>
              )}
            </div>
          </div>

          {run.status === 'success' && onViewReport && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewReport(run.id)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Voir le rapport
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}
