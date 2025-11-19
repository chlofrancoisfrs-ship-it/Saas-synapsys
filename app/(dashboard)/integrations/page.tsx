import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function IntegrationsPage() {
  const integrations = [
    {
      name: "Stripe",
      description: "Gérez vos paiements et abonnements",
      icon: "💳",
      connected: false,
    },
    {
      name: "N8N",
      description: "Automatisez vos workflows",
      icon: "⚡",
      connected: false,
    },
    {
      name: "Resend",
      description: "Envoyez des emails transactionnels",
      icon: "📧",
      connected: false,
    },
    {
      name: "Google Analytics",
      description: "Suivez vos statistiques de trafic",
      icon: "📊",
      connected: false,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Intégrations</h1>
        <p className="text-gray-600 mt-2">
          Connectez vos outils préférés à Synapsys
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <Card key={integration.name}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="text-4xl">{integration.icon}</div>
                <div>
                  <CardTitle>{integration.name}</CardTitle>
                  <CardDescription>{integration.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                variant={integration.connected ? "outline" : "default"}
                className="w-full"
              >
                {integration.connected ? "Déconnecter" : "Connecter"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
