import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function WorkflowsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workflows</h1>
          <p className="text-gray-600 mt-2">
            Automatisez vos tâches avec N8N
          </p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Nouveau workflow</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vos workflows</CardTitle>
          <CardDescription>
            Gérez tous vos workflows automatisés en un seul endroit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            Aucun workflow pour le moment. Créez votre premier workflow pour commencer.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
