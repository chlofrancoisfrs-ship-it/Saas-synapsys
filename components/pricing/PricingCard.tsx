"use client"

import { PlanConfig, BillingPeriod, calculatePrice, calculateYearlySavings } from '@/lib/stripe/plans'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PricingCardProps {
  plan: PlanConfig
  billingPeriod: BillingPeriod
  onSelectPlan: (planId: string, period: BillingPeriod) => void
  isLoading?: boolean
  currentPlan?: string
  highlighted?: boolean
}

export default function PricingCard({
  plan,
  billingPeriod,
  onSelectPlan,
  isLoading = false,
  currentPlan,
  highlighted = false,
}: PricingCardProps) {
  const price = calculatePrice(plan.id, billingPeriod)
  const monthlyEquivalent = billingPeriod === 'yearly' ? price / 12 : price
  const savings = billingPeriod === 'yearly' ? calculateYearlySavings(plan.id) : 0
  const isCurrentPlan = currentPlan === plan.id

  return (
    <Card
      className={cn(
        'relative flex flex-col',
        highlighted && 'border-2 border-primary shadow-lg scale-105',
        isCurrentPlan && 'border-2 border-green-500'
      )}
    >
      {/* Badge Popular ou Plan actuel */}
      {highlighted && !isCurrentPlan && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-white px-4 py-1">
            Plus populaire
          </Badge>
        </div>
      )}
      {isCurrentPlan && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Badge className="bg-green-500 text-white px-4 py-1">
            Plan actuel
          </Badge>
        </div>
      )}

      <CardHeader>
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <CardDescription className="text-base">
          {plan.description}
        </CardDescription>

        {/* Prix */}
        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">
              {Math.floor(monthlyEquivalent)}€
            </span>
            <span className="text-gray-600">/mois</span>
          </div>

          {billingPeriod === 'yearly' && (
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-600">
                Facturé {price}€ par an
              </p>
              <p className="text-sm font-medium text-green-600">
                Économisez {savings}€ par an
              </p>
            </div>
          )}
        </div>

        {/* Essai gratuit */}
        <div className="mt-3">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {plan.trialDays} jours d&apos;essai gratuit
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        {/* Liste des fonctionnalités */}
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              {feature.included ? (
                <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              ) : (
                <X className="h-5 w-5 text-gray-300 shrink-0 mt-0.5" />
              )}
              <span
                className={cn(
                  'text-sm',
                  feature.included ? 'text-gray-900' : 'text-gray-400 line-through'
                )}
              >
                {feature.text}
              </span>
            </li>
          ))}
        </ul>

        {/* Informations supplémentaires */}
        <div className="mt-6 pt-6 border-t space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Intégrations:</span>
            <span className="font-medium">
              {plan.maxIntegrations === 'unlimited' ? 'Illimitées' : plan.maxIntegrations}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Support:</span>
            <span className="font-medium">{plan.support}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          size="lg"
          variant={highlighted ? 'default' : 'outline'}
          onClick={() => onSelectPlan(plan.id, billingPeriod)}
          disabled={isLoading || isCurrentPlan}
        >
          {isCurrentPlan
            ? 'Plan actuel'
            : isLoading
            ? 'Chargement...'
            : `Commencer l'essai gratuit`}
        </Button>
      </CardFooter>
    </Card>
  )
}
