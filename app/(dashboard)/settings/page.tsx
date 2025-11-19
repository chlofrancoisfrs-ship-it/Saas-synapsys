import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600 mt-2">
          Gérez votre compte et vos préférences
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profil</CardTitle>
            <CardDescription>
              Informations de votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Email</p>
                <p className="text-sm text-gray-900">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Nom complet</p>
                <p className="text-sm text-gray-900">
                  {user?.user_metadata?.full_name || "Non renseigné"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Langue</p>
                <p className="text-sm text-gray-900">
                  {user?.user_metadata?.language === "fr" ? "Français" : "English"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Abonnement</CardTitle>
            <CardDescription>
              Gérez votre abonnement et votre facturation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Plan actuel</p>
                <p className="text-sm text-gray-900">Gratuit</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Statut</p>
                <p className="text-sm text-green-600">Actif</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Configurez vos préférences de notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700">Emails marketing</p>
                <input type="checkbox" className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700">Notifications de ventes</p>
                <input type="checkbox" className="rounded" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700">Rapports hebdomadaires</p>
                <input type="checkbox" className="rounded" defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sécurité</CardTitle>
            <CardDescription>
              Paramètres de sécurité de votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Mot de passe</p>
                <p className="text-sm text-gray-600">
                  Dernière modification il y a 30 jours
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Authentification à deux facteurs</p>
                <p className="text-sm text-gray-600">Non activée</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
