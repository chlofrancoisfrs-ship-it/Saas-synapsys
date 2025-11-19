"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SubscriptionRow } from '@/types/database'
import SubscriptionStatus from '@/components/subscription/SubscriptionStatus'
import InvoiceList from '@/components/subscription/InvoiceList'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CreditCard, AlertTriangle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function BillingPage() {
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        if (error.code !== 'PGRST116') { // Pas d'erreur si pas de subscription
          console.error('Erreur:', error)
        }
        setSubscription(null)
      } else {
        setSubscription(data)
      }
    } catch (err) {
      console.error('Erreur:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la création du portail')
      }

      const { url } = await response.json()

      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Une erreur est survenue. Veuillez réessayer.')
    }
  }

  const handleUpgrade = () => {
    router.push('/pricing')
  }

  const handleCancelSubscription = async () => {
    try {
      setIsCanceling(true)

      const response = await fetch('/api/stripe/subscription', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          immediately: false,
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l\'annulation')
      }

      // Rafraîchir les données
      await fetchSubscription()
      setShowCancelDialog(false)
    } catch (error) {
      console.error('Erreur:', error)
      alert('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setIsCanceling(false)
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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Facturation et abonnement
        </h1>
        <p className="text-gray-600">
          Gérez votre abonnement, vos moyens de paiement et consultez vos factures
        </p>
      </div>

      {/* Statut de l'abonnement */}
      <SubscriptionStatus
        subscription={subscription}
        onManageSubscription={handleManageSubscription}
        onUpgrade={handleUpgrade}
      />

      {/* Gérer le paiement */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Moyen de paiement
            </CardTitle>
            <CardDescription>
              Gérez vos cartes bancaires et moyens de paiement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleManageSubscription} variant="outline">
              Gérer mes moyens de paiement
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Historique de facturation */}
      <InvoiceList />

      {/* Zone danger */}
      {subscription && subscription.status === 'active' && !subscription.cancel_at_period_end && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Zone de danger
            </CardTitle>
            <CardDescription>
              Actions irréversibles sur votre abonnement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900 mb-1">
                  Annuler l&apos;abonnement
                </p>
                <p className="text-sm text-gray-600">
                  Votre abonnement sera annulé à la fin de la période de facturation en cours.
                  Vous conserverez l&apos;accès jusqu&apos;à cette date.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowCancelDialog(true)}
              >
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Réactiver l'abonnement */}
      {subscription && subscription.cancel_at_period_end && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-700">
              Réactiver l&apos;abonnement
            </CardTitle>
            <CardDescription>
              Vous avez changé d&apos;avis ? Réactivez votre abonnement avant la fin de la période
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleManageSubscription} className="bg-green-600 hover:bg-green-700">
              Réactiver mon abonnement
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialog de confirmation d'annulation */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Votre abonnement sera annulé à la fin de la période de facturation en cours
              ({subscription?.current_period_end && new Date(subscription.current_period_end).toLocaleDateString('fr-FR')}).
              Vous conserverez l&apos;accès à toutes les fonctionnalités jusqu&apos;à cette date.
              <br /><br />
              Vous pourrez réactiver votre abonnement à tout moment avant cette date.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCanceling}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              disabled={isCanceling}
              className="bg-red-600 hover:bg-red-700"
            >
              {isCanceling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Annulation...
                </>
              ) : (
                "Confirmer l'annulation"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
