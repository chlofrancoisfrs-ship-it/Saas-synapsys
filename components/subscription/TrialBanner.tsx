"use client"

import { SubscriptionRow } from '@/types/database'
import { differenceInDays, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { AlertCircle, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface TrialBannerProps {
  subscription: SubscriptionRow | null
}

export default function TrialBanner({ subscription }: TrialBannerProps) {
  // N'afficher que si en période d'essai
  if (!subscription || subscription.status !== 'trialing' || !subscription.trial_end) {
    return null
  }

  const trialEnd = new Date(subscription.trial_end)
  const daysRemaining = differenceInDays(trialEnd, new Date())

  // Choisir la couleur selon les jours restants
  const getBannerColor = () => {
    if (daysRemaining <= 3) return 'bg-red-50 border-red-200 text-red-900'
    if (daysRemaining <= 7) return 'bg-orange-50 border-orange-200 text-orange-900'
    return 'bg-blue-50 border-blue-200 text-blue-900'
  }

  const getIconColor = () => {
    if (daysRemaining <= 3) return 'text-red-600'
    if (daysRemaining <= 7) return 'text-orange-600'
    return 'text-blue-600'
  }

  return (
    <div className={`p-4 border rounded-lg ${getBannerColor()}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className={`h-5 w-5 shrink-0 mt-0.5 ${getIconColor()}`} />
        <div className="flex-1">
          <p className="font-medium mb-1">
            {daysRemaining === 0
              ? "Votre période d'essai se termine aujourd'hui"
              : daysRemaining === 1
              ? "Votre période d'essai se termine demain"
              : `Il vous reste ${daysRemaining} jours d'essai gratuit`}
          </p>
          <p className="text-sm opacity-90">
            <Calendar className="inline h-4 w-4 mr-1" />
            Fin de l&apos;essai le {format(trialEnd, 'dd MMMM yyyy', { locale: fr })}
            {' - '}
            {daysRemaining <= 7
              ? "N'oubliez pas d'ajouter un moyen de paiement pour continuer après l'essai."
              : "Profitez de toutes les fonctionnalités sans limite."}
          </p>
        </div>
        {daysRemaining <= 7 && (
          <Link href="/settings/billing">
            <Button size="sm" variant="outline">
              Gérer
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
