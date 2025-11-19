// =====================================================
// STRIPE PLANS & PRICING CONFIGURATION
// =====================================================

export type BillingPeriod = 'monthly' | 'yearly'
export type PlanType = 'starter' | 'premium'

export interface PlanFeature {
  text: string
  included: boolean
}

export interface PlanConfig {
  id: PlanType
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  stripePriceMonthly: string
  stripePriceYearly: string
  trialDays: number
  features: PlanFeature[]
  workflowsIncluded: string[]
  maxIntegrations: number | 'unlimited'
  support: string
  popular?: boolean
}

// Prix des plans
export const PLAN_PRICES = {
  starter: {
    monthly: 80,
    yearly: 768, // 80 * 12 * 0.8 (20% de réduction)
  },
  premium: {
    monthly: 350,
    yearly: 3360, // 350 * 12 * 0.8 (20% de réduction)
  },
} as const

// IDs des prix Stripe (à remplacer par les vrais IDs depuis Stripe Dashboard)
export const STRIPE_PRICE_IDS = {
  starter: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY || 'price_starter_monthly',
    yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_YEARLY || 'price_starter_yearly',
  },
  premium: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY || 'price_premium_monthly',
    yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY || 'price_premium_yearly',
  },
} as const

// Configuration des plans
export const PLANS: Record<PlanType, PlanConfig> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'Idéal pour démarrer et automatiser vos premiers workflows',
    monthlyPrice: PLAN_PRICES.starter.monthly,
    yearlyPrice: PLAN_PRICES.starter.yearly,
    stripePriceMonthly: STRIPE_PRICE_IDS.starter.monthly,
    stripePriceYearly: STRIPE_PRICE_IDS.starter.yearly,
    trialDays: 30,
    maxIntegrations: 4,
    support: "Centre d'aide IA uniquement",
    workflowsIncluded: [
      'creator_insights',
      'youtube_conversion',
      'time_to_cash',
    ],
    features: [
      { text: '1 mois d\'essai gratuit', included: true },
      { text: '3 workflows inclus', included: true },
      { text: 'Creator Insights', included: true },
      { text: 'YouTube Conversion Tracking', included: true },
      { text: 'Time-to-Cash Analysis', included: true },
      { text: '4 connexions plateformes max', included: true },
      { text: 'YouTube, LinkedIn, Instagram, Stripe', included: true },
      { text: 'Centre d\'aide IA', included: true },
      { text: 'Dashboard analytics de base', included: true },
      { text: 'PhantomBuster', included: false },
      { text: 'Lead Scoring automatique', included: false },
      { text: 'Revenue Attribution avancée', included: false },
      { text: 'Support WhatsApp direct', included: false },
    ],
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    description: 'La solution complète pour maximiser votre génération de cash',
    monthlyPrice: PLAN_PRICES.premium.monthly,
    yearlyPrice: PLAN_PRICES.premium.yearly,
    stripePriceMonthly: STRIPE_PRICE_IDS.premium.monthly,
    stripePriceYearly: STRIPE_PRICE_IDS.premium.yearly,
    trialDays: 30,
    maxIntegrations: 'unlimited',
    support: 'WhatsApp direct + IA',
    popular: true,
    workflowsIncluded: [
      'creator_insights',
      'youtube_conversion',
      'performance_tracking',
      'call_analysis',
      'whatsapp_onboarding',
      'time_to_cash',
      'content_repurposing',
      'lead_scoring',
      'revenue_attribution',
      'telegram_poster',
      'follow_up',
    ],
    features: [
      { text: '1 mois d\'essai gratuit', included: true },
      { text: 'Tous les 11 workflows inclus', included: true },
      { text: 'Creator Insights avancés', included: true },
      { text: 'YouTube Conversion Tracking', included: true },
      { text: 'Performance Tracking temps réel', included: true },
      { text: 'Call Analysis avec IA', included: true },
      { text: 'WhatsApp Onboarding automatique', included: true },
      { text: 'Time-to-Cash Analysis', included: true },
      { text: 'Content Repurposing IA', included: true },
      { text: 'Lead Scoring automatique', included: true },
      { text: 'Revenue Attribution avancée', included: true },
      { text: 'Telegram Poster auto', included: true },
      { text: 'Follow-up automatisé', included: true },
      { text: 'Connexions illimitées', included: true },
      { text: 'Toutes les 8 plateformes', included: true },
      { text: 'PhantomBuster inclus', included: true },
      { text: 'WhatsApp, Telegram, Calendly', included: true },
      { text: 'Support WhatsApp direct', included: true },
      { text: 'Dashboard analytics avancés', included: true },
      { text: 'Rapports personnalisés', included: true },
    ],
  },
}

// Workflows disponibles par plan
export const WORKFLOWS_BY_PLAN = {
  starter: PLANS.starter.workflowsIncluded,
  premium: PLANS.premium.workflowsIncluded,
} as const

// Plateformes disponibles par plan
export const PLATFORMS_BY_PLAN = {
  starter: ['youtube', 'linkedin', 'instagram', 'stripe'],
  premium: ['youtube', 'linkedin', 'instagram', 'stripe', 'calendly', 'whatsapp', 'telegram', 'phantombuster'],
} as const

// Calculer le prix selon la période de facturation
export function calculatePrice(plan: PlanType, period: BillingPeriod): number {
  return period === 'monthly' ? PLAN_PRICES[plan].monthly : PLAN_PRICES[plan].yearly
}

// Calculer l'économie annuelle
export function calculateYearlySavings(plan: PlanType): number {
  const monthlyTotal = PLAN_PRICES[plan].monthly * 12
  const yearlyPrice = PLAN_PRICES[plan].yearly
  return monthlyTotal - yearlyPrice
}

// Obtenir le pourcentage de réduction annuelle
export function getYearlyDiscountPercentage(): number {
  return 20
}

// Obtenir le prix ID Stripe selon plan et période
export function getStripePriceId(plan: PlanType, period: BillingPeriod): string {
  return STRIPE_PRICE_IDS[plan][period]
}

// Vérifier si un workflow est disponible pour un plan
export function isWorkflowAvailable(plan: PlanType, workflowType: string): boolean {
  return WORKFLOWS_BY_PLAN[plan].includes(workflowType as any)
}

// Vérifier si une plateforme est disponible pour un plan
export function isPlatformAvailable(plan: PlanType, platform: string): boolean {
  return PLATFORMS_BY_PLAN[plan].includes(platform as any)
}

// Obtenir le nombre max d'intégrations pour un plan
export function getMaxIntegrations(plan: PlanType): number | 'unlimited' {
  return PLANS[plan].maxIntegrations
}

// FAQ pour la page pricing
export const PRICING_FAQ = [
  {
    question: 'Comment fonctionne l\'essai gratuit ?',
    answer: 'Vous bénéficiez de 30 jours d\'essai gratuit sur tous nos plans. Une carte bancaire est requise lors de l\'inscription, mais vous ne serez facturé qu\'à la fin de la période d\'essai. Vous pouvez annuler à tout moment pendant l\'essai sans frais.',
  },
  {
    question: 'Puis-je annuler mon abonnement à tout moment ?',
    answer: 'Oui, absolument. Vous pouvez annuler votre abonnement à tout moment depuis votre espace de facturation. Vous conserverez l\'accès jusqu\'à la fin de votre période de facturation en cours.',
  },
  {
    question: 'Quand suis-je facturé ?',
    answer: 'Vous êtes facturé à la fin de votre période d\'essai gratuit de 30 jours, puis de manière récurrente chaque mois ou chaque année selon votre choix. Vous recevrez toujours un email de confirmation après chaque paiement.',
  },
  {
    question: 'Puis-je changer de plan plus tard ?',
    answer: 'Oui, vous pouvez passer au plan supérieur (upgrade) ou inférieur (downgrade) à tout moment. Pour un upgrade, le prorata sera facturé immédiatement. Pour un downgrade, le changement prendra effet à la fin de votre période de facturation actuelle.',
  },
  {
    question: 'Que se passe-t-il si mon paiement échoue ?',
    answer: 'Si un paiement échoue, nous réessaierons automatiquement plusieurs fois sur 7 jours. Vous recevrez des notifications par email pour mettre à jour votre moyen de paiement. Après 7 jours, votre accès sera suspendu jusqu\'à régularisation.',
  },
  {
    question: 'Puis-je obtenir une facture ?',
    answer: 'Oui, vous recevez automatiquement une facture par email après chaque paiement. Vous pouvez également télécharger toutes vos factures depuis votre espace de facturation à tout moment.',
  },
  {
    question: 'Proposez-vous des réductions pour les paiements annuels ?',
    answer: 'Oui ! En choisissant la facturation annuelle, vous économisez 20% par rapport au paiement mensuel. C\'est l\'équivalent de 2 mois gratuits par an.',
  },
  {
    question: 'Mes données sont-elles sécurisées ?',
    answer: 'Absolument. Nous utilisons Stripe pour gérer tous les paiements, qui est conforme PCI DSS niveau 1 (le plus haut niveau de sécurité). Nous ne stockons jamais vos informations de carte bancaire sur nos serveurs.',
  },
]
