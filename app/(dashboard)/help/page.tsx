import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HelpCircle, Book, MessageCircle, Mail } from "lucide-react"

export default function HelpPage() {
  const helpResources = [
    {
      title: "Documentation",
      description: "Consultez notre documentation complète",
      icon: Book,
      link: "#",
    },
    {
      title: "FAQ",
      description: "Trouvez des réponses aux questions fréquentes",
      icon: HelpCircle,
      link: "#",
    },
    {
      title: "Support par chat",
      description: "Discutez avec notre équipe de support",
      icon: MessageCircle,
      link: "#",
    },
    {
      title: "Contactez-nous",
      description: "Envoyez-nous un email",
      icon: Mail,
      link: "mailto:support@synapsys.com",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Centre d&apos;aide</h1>
        <p className="text-gray-600 mt-2">
          Trouvez de l&apos;aide et des ressources pour utiliser Synapsys
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {helpResources.map((resource) => {
          const Icon = resource.icon
          return (
            <Card key={resource.title} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{resource.title}</CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Questions fréquentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900">Comment connecter mes intégrations ?</h3>
              <p className="text-sm text-gray-600 mt-1">
                Rendez-vous dans la section Intégrations et cliquez sur le bouton Connecter pour chaque service que vous souhaitez ajouter.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Comment créer un workflow ?</h3>
              <p className="text-sm text-gray-600 mt-1">
                Allez dans la section Workflows et cliquez sur Nouveau workflow. Vous serez redirigé vers l&apos;interface N8N pour créer votre automatisation.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Puis-je changer de langue ?</h3>
              <p className="text-sm text-gray-600 mt-1">
                Oui, vous pouvez modifier la langue de votre compte dans la section Paramètres.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
