import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { BarChart3, TrendingUp, Users, DollarSign } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Mock data - à remplacer par de vraies données de la base de données
  const stats = [
    {
      title: "Revenus ce mois",
      value: "€2,450",
      change: "+12.5%",
      icon: DollarSign,
      trend: "up",
    },
    {
      title: "Étudiants actifs",
      value: "156",
      change: "+8.2%",
      icon: Users,
      trend: "up",
    },
    {
      title: "Taux de conversion",
      value: "3.2%",
      change: "+0.5%",
      icon: TrendingUp,
      trend: "up",
    },
    {
      title: "Workflows actifs",
      value: "8",
      change: "+2",
      icon: BarChart3,
      trend: "up",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenue, {user?.user_metadata?.full_name || user?.email}
        </h1>
        <p className="text-gray-600 mt-2">
          Voici un aperçu de votre activité
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-green-600 mt-1">
                  {stat.change} par rapport au mois dernier
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Aperçu des revenus</CardTitle>
            <CardDescription>
              Vos revenus des 12 derniers mois
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              Graphique à venir (intégration avec Recharts)
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>
              Dernières actions sur votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Nouveau workflow créé
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Il y a 2 heures
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Intégration Stripe connectée
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Il y a 5 heures
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Nouvelle vente réalisée
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Il y a 1 jour
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
