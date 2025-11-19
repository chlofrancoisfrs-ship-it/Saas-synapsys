"use client"

import { PLANS, WORKFLOWS_BY_PLAN, PLATFORMS_BY_PLAN } from '@/lib/stripe/plans'
import { Check, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ComparisonTable() {
  const workflows = [
    { id: 'creator_insights', name: 'Creator Insights' },
    { id: 'youtube_conversion', name: 'YouTube Conversion Tracking' },
    { id: 'time_to_cash', name: 'Time-to-Cash Analysis' },
    { id: 'performance_tracking', name: 'Performance Tracking' },
    { id: 'call_analysis', name: 'Call Analysis avec IA' },
    { id: 'whatsapp_onboarding', name: 'WhatsApp Onboarding' },
    { id: 'content_repurposing', name: 'Content Repurposing IA' },
    { id: 'lead_scoring', name: 'Lead Scoring automatique' },
    { id: 'revenue_attribution', name: 'Revenue Attribution' },
    { id: 'telegram_poster', name: 'Telegram Poster' },
    { id: 'follow_up', name: 'Follow-up automatisé' },
  ]

  const platforms = [
    { id: 'youtube', name: 'YouTube' },
    { id: 'linkedin', name: 'LinkedIn' },
    { id: 'instagram', name: 'Instagram' },
    { id: 'stripe', name: 'Stripe' },
    { id: 'calendly', name: 'Calendly' },
    { id: 'whatsapp', name: 'WhatsApp' },
    { id: 'telegram', name: 'Telegram' },
    { id: 'phantombuster', name: 'PhantomBuster' },
  ]

  const generalFeatures = [
    { id: 'trial', name: 'Essai gratuit', starter: '30 jours', premium: '30 jours' },
    { id: 'integrations', name: 'Connexions plateformes', starter: '4 max', premium: 'Illimitées' },
    { id: 'support', name: 'Support', starter: "Centre d'aide IA", premium: 'WhatsApp + IA' },
    { id: 'dashboard', name: 'Dashboard analytics', starter: 'Basique', premium: 'Avancé + Rapports' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Comparaison détaillée des plans</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-4 px-4 font-semibold text-gray-900">
                  Fonctionnalité
                </th>
                <th className="text-center py-4 px-4 font-semibold text-gray-900 bg-gray-50">
                  Starter
                </th>
                <th className="text-center py-4 px-4 font-semibold text-gray-900 bg-primary/5">
                  Premium
                </th>
              </tr>
            </thead>

            <tbody>
              {/* Fonctionnalités générales */}
              <tr className="border-b border-gray-200 bg-gray-50">
                <td colSpan={3} className="py-3 px-4 font-semibold text-gray-900">
                  Fonctionnalités générales
                </td>
              </tr>
              {generalFeatures.map((feature) => (
                <tr key={feature.id} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">{feature.name}</td>
                  <td className="text-center py-3 px-4 bg-gray-50">
                    <span className="text-sm font-medium text-gray-700">
                      {feature.starter}
                    </span>
                  </td>
                  <td className="text-center py-3 px-4 bg-primary/5">
                    <span className="text-sm font-medium text-primary">
                      {feature.premium}
                    </span>
                  </td>
                </tr>
              ))}

              {/* Workflows */}
              <tr className="border-b border-gray-200 bg-gray-50">
                <td colSpan={3} className="py-3 px-4 font-semibold text-gray-900">
                  Workflows disponibles
                </td>
              </tr>
              {workflows.map((workflow) => {
                const inStarter = WORKFLOWS_BY_PLAN.starter.includes(workflow.id as any)
                const inPremium = WORKFLOWS_BY_PLAN.premium.includes(workflow.id as any)
                return (
                  <tr key={workflow.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-900">{workflow.name}</td>
                    <td className="text-center py-3 px-4 bg-gray-50">
                      {inStarter ? (
                        <Check className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="text-center py-3 px-4 bg-primary/5">
                      {inPremium ? (
                        <Check className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                  </tr>
                )
              })}

              {/* Plateformes */}
              <tr className="border-b border-gray-200 bg-gray-50">
                <td colSpan={3} className="py-3 px-4 font-semibold text-gray-900">
                  Plateformes connectées
                </td>
              </tr>
              {platforms.map((platform) => {
                const inStarter = PLATFORMS_BY_PLAN.starter.includes(platform.id as any)
                const inPremium = PLATFORMS_BY_PLAN.premium.includes(platform.id as any)
                return (
                  <tr key={platform.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-900">{platform.name}</td>
                    <td className="text-center py-3 px-4 bg-gray-50">
                      {inStarter ? (
                        <Check className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="text-center py-3 px-4 bg-primary/5">
                      {inPremium ? (
                        <Check className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Note */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> Tous les plans incluent un essai gratuit de 30 jours.
            Vous pouvez changer de plan ou annuler à tout moment.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
