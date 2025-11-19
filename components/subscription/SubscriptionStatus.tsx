"use client"

import { SubscriptionRow } from '@/types/database'
import { PLANS } from '@/lib/stripe/plans'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface SubscriptionStatusProps {
  subscription: SubscriptionRow | null
  onManageSubscription: () => void
  onUpgrade?: () => void
}

export default function SubscriptionStatus({
  subscription,
  onManageSubscription,
  onUpgrade,
}: SubscriptionStatusProps) {
  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aucun abonnement actif</CardTitle>
          <CardDescription>
            Commencez dès maintenant avec un essai gratuit de 30 jours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onUpgrade}>
            Choisir un plan
          </Button>
        </CardContent>
      </Card>
    )
  }

  const plan = subscription.plan_type ? PLANS[subscription.plan_type] : null
  const isTrialing = subscription.status === 'trialing'
  const isActive = subscription.status === 'active'
  const isCanceled = subscription.status === 'canceled'
  const isPastDue = subscription.status === 'past_due'

  const getStatusBadge = () => {
    switch (subscription.status) {
      case 'trialing':
        return <Badge className="bg-blue-500">Essai gratuit</Badge>
      case 'active':
        return <Badge className="bg-green-500">Actif</Badge>
      case 'canceled':
        return <Badge variant="destructive">Annulé</Badge>
      case 'past_due':
        return <Badge className="bg-orange-500">Paiement en attente</Badge>
      case 'incomplete':
        return <Badge variant="outline">Incomplet</Badge>
      default:
        return <Badge variant="outline">{subscription.status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3">
              {plan?.name || 'Plan inconnu'}
              {getStatusBadge()}
            </CardTitle>
            <CardDescription>
              {plan?.description || ''}
            </CardDescription>
          </div>
          {isActive && (
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          )}
          {isPastDue && (
            <AlertCircle className="h-8 w-8 text-orange-500" />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Informations de facturation */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-start gap-3">
            <CreditCard className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Période de facturation
              </p>
              <p className="text-sm text-gray-600">
                {subscription.billing_period === 'monthly' ? 'Mensuelle' : 'Annuelle'}
              </p>
            </div>
          </div>

          {subscription.current_period_end && (
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {isCanceled ? 'Fin d\'accès' : 'Prochaine facturation'}
                </p>
                <p className="text-sm text-gray-600">
                  {format(new Date(subscription.current_period_end), 'dd MMMM yyyy', { locale: fr })}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Message d'essai */}
        {isTrialing && subscription.trial_end && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Période d&apos;essai active</strong> - Votre essai se termine le{' '}
              {format(new Date(subscription.trial_end), 'dd MMMM yyyy', { locale: fr })}.
              Vous ne serez facturé qu&apos;à la fin de cette période.
            </p>
          </div>
        )}

        {/* Message annulation */}
        {isCanceled && subscription.cancel_at_period_end && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-900">
              <strong>Abonnement annulé</strong> - Votre accès se termine le{' '}
              {subscription.current_period_end && format(new Date(subscription.current_period_end), 'dd MMMM yyyy', { locale: fr })}.
              Vous pouvez réactiver votre abonnement à tout moment.
            </p>
          </div>
        )}

        {/* Message paiement échoué */}
        {isPastDue && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-900">
              <strong>Paiement échoué</strong> - Veuillez mettre à jour votre moyen de paiement pour continuer à utiliser le service.
            </p>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={onManageSubscription} variant="outline">
            Gérer l&apos;abonnement
          </Button>
          {subscription.plan_type === 'starter' && onUpgrade && isActive && (
            <Button onClick={onUpgrade}>
              Passer à Premium
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
