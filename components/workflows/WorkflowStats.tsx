interface WorkflowStatsProps {
  workflowType: string
  stats: Record<string, string | number>
}

export default function WorkflowStats({ workflowType, stats }: WorkflowStatsProps) {
  if (!stats || Object.keys(stats).length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        Aucune statistique disponible
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {Object.entries(stats).map(([key, value]) => (
        <div key={key} className="border rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">{key}</div>
          <div className="text-lg font-semibold text-gray-900">{value}</div>
        </div>
      ))}
    </div>
  )
}
