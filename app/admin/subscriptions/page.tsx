"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SubscriptionRow, UserRow } from '@/types/database'
import { PLANS } from '@/lib/stripe/plans'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Search, Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface SubscriptionWithUser extends SubscriptionRow {
  user: UserRow
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const supabase = createClient()

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true)

      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          user:users!subscriptions_user_id_fkey (*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setSubscriptions(data as any)
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculer les statistiques
  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter(s => s.status === 'active').length,
    trialing: subscriptions.filter(s => s.status === 'trialing').length,
    canceled: subscriptions.filter(s => s.status === 'canceled').length,
    pastDue: subscriptions.filter(s => s.status === 'past_due').length,
    mrr: subscriptions
      .filter(s => ['active', 'trialing'].includes(s.status))
      .reduce((acc, s) => {
        if (!s.plan_type) return acc
        const plan = PLANS[s.plan_type]
        const price = s.billing_period === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice / 12
        return acc + price
      }, 0),
  }

  // Filtrer les abonnements
  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = searchTerm === '' ||
      sub.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'trialing':
        return <Badge className="bg-blue-500">Essai</Badge>
      case 'active':
        return <Badge className="bg-green-500">Actif</Badge>
      case 'canceled':
        return <Badge variant="destructive">Annulé</Badge>
      case 'past_due':
        return <Badge className="bg-orange-500">En retard</Badge>
      case 'incomplete':
        return <Badge variant="outline">Incomplet</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gestion des abonnements
        </h1>
        <p className="text-gray-600">
          Vue d&apos;ensemble de tous les abonnements utilisateurs
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total abonnements
            </CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Actifs
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-gray-600">{stats.trialing} en essai</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              MRR
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.mrr.toFixed(0)}€</div>
            <p className="text-xs text-gray-600">Revenu mensuel récurrent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Problèmes
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pastDue}</div>
            <p className="text-xs text-gray-600">Paiements en retard</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtre par statut */}
            <div className="flex gap-2">
              {['all', 'active', 'trialing', 'canceled', 'past_due'].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                >
                  {status === 'all' ? 'Tous' :
                   status === 'active' ? 'Actifs' :
                   status === 'trialing' ? 'Essai' :
                   status === 'canceled' ? 'Annulés' :
                   'En retard'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des abonnements */}
      <Card>
        <CardHeader>
          <CardTitle>Abonnements ({filteredSubscriptions.length})</CardTitle>
          <CardDescription>
            Liste de tous les abonnements avec leurs détails
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-sm">Utilisateur</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Plan</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Période</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Statut</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Créé le</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Expire le</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscriptions.map((sub) => (
                  <tr key={sub.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{sub.user?.full_name || 'N/A'}</p>
                        <p className="text-sm text-gray-600">{sub.user?.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">
                        {sub.plan_type ? PLANS[sub.plan_type].name : 'N/A'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm">
                        {sub.billing_period === 'monthly' ? 'Mensuel' : 'Annuel'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(sub.status)}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {format(new Date(sub.created_at), 'dd/MM/yyyy', { locale: fr })}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {sub.current_period_end ?
                        format(new Date(sub.current_period_end), 'dd/MM/yyyy', { locale: fr }) :
                        'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(
                          `https://dashboard.stripe.com/subscriptions/${sub.stripe_subscription_id}`,
                          '_blank'
                        )}
                      >
                        Voir dans Stripe
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredSubscriptions.length === 0 && (
              <div className="text-center py-8 text-gray-600">
                Aucun abonnement trouvé
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
