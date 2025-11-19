"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PLANS, PRICING_FAQ, BillingPeriod } from '@/lib/stripe/plans'
import PricingCard from '@/components/pricing/PricingCard'
import PricingToggle from '@/components/pricing/PricingToggle'
import ComparisonTable from '@/components/pricing/ComparisonTable'
import { Card, CardContent } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Shield, Zap, TrendingUp } from 'lucide-react'

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSelectPlan = async (planId: string, period: BillingPeriod) => {
    try {
      setIsLoading(true)

      // Appel à l'API pour créer une session de checkout
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType: planId,
          billingPeriod: period,
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session')
      }

      const { url } = await response.json()

      if (url) {
        // Redirection vers Stripe Checkout
        window.location.href = url
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Choisissez votre plan
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Commencez avec 30 jours d&apos;essai gratuit. Aucune carte bancaire requise.
            Annulez à tout moment.
          </p>

          {/* Toggle */}
          <div className="mb-12">
            <PricingToggle value={billingPeriod} onChange={setBillingPeriod} />
          </div>

          {/* Plans */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <PricingCard
              plan={PLANS.starter}
              billingPeriod={billingPeriod}
              onSelectPlan={handleSelectPlan}
              isLoading={isLoading}
            />
            <PricingCard
              plan={PLANS.premium}
              billingPeriod={billingPeriod}
              onSelectPlan={handleSelectPlan}
              isLoading={isLoading}
              highlighted
            />
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Pourquoi choisir Synapsys ?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    Automatisation totale
                  </h3>
                  <p className="text-gray-600">
                    Automatisez vos workflows de vente et concentrez-vous sur la création de contenu
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    Analytics puissants
                  </h3>
                  <p className="text-gray-600">
                    Suivez vos performances et optimisez votre génération de revenus
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    Sécurité maximale
                  </h3>
                  <p className="text-gray-600">
                    Vos données sont protégées avec un chiffrement de niveau bancaire
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tableau de comparaison */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <ComparisonTable />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Questions fréquentes
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {PRICING_FAQ.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Prêt à automatiser votre business ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez les centaines d&apos;infopreneurs qui utilisent Synapsys pour maximiser leurs revenus
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleSelectPlan('starter', billingPeriod)}
              className="px-8 py-4 bg-white text-primary rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              disabled={isLoading}
            >
              Commencer avec Starter
            </button>
            <button
              onClick={() => handleSelectPlan('premium', billingPeriod)}
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
              disabled={isLoading}
            >
              Passer à Premium
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
