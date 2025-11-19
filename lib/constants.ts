// Application constants

export const APP_NAME = 'Synapsys'
export const APP_DESCRIPTION = 'Centralisez toutes vos données business et optimisez votre temps pour générer du cash.'

// Brand colors
export const COLORS = {
  primary: '#2563EB',
  secondary: '#FFFFFF',
  accent: '#60A5FA',
  background: '#F9FAFB',
  text: '#111827',
}

// Supported languages
export const LANGUAGES = {
  FR: 'fr',
  EN: 'en',
} as const

// Navigation items
export const NAV_ITEMS = [
  {
    href: '/dashboard',
    label: {
      fr: 'Tableau de bord',
      en: 'Dashboard',
    },
  },
  {
    href: '/workflows',
    label: {
      fr: 'Workflows',
      en: 'Workflows',
    },
  },
  {
    href: '/analytics',
    label: {
      fr: 'Analytics',
      en: 'Analytics',
    },
  },
  {
    href: '/integrations',
    label: {
      fr: 'Intégrations',
      en: 'Integrations',
    },
  },
  {
    href: '/settings',
    label: {
      fr: 'Paramètres',
      en: 'Settings',
    },
  },
  {
    href: '/help',
    label: {
      fr: 'Aide',
      en: 'Help',
    },
  },
]

// Stripe product IDs (replace with your actual product IDs)
export const STRIPE_PRODUCTS = {
  FREE: {
    id: 'free',
    name: {
      fr: 'Gratuit',
      en: 'Free',
    },
    price: 0,
    features: [
      { fr: 'Tableau de bord basique', en: 'Basic dashboard' },
      { fr: 'Jusqu\'à 3 workflows', en: 'Up to 3 workflows' },
      { fr: 'Analytics limités', en: 'Limited analytics' },
    ],
  },
  STARTER: {
    id: 'starter',
    name: {
      fr: 'Starter',
      en: 'Starter',
    },
    price: 29,
    priceId: 'price_starter_monthly', // Replace with your Stripe price ID
    features: [
      { fr: 'Tableau de bord complet', en: 'Complete dashboard' },
      { fr: 'Jusqu\'à 10 workflows', en: 'Up to 10 workflows' },
      { fr: 'Analytics complets', en: 'Full analytics' },
      { fr: 'Intégrations illimitées', en: 'Unlimited integrations' },
    ],
  },
  PRO: {
    id: 'pro',
    name: {
      fr: 'Pro',
      en: 'Pro',
    },
    price: 99,
    priceId: 'price_pro_monthly', // Replace with your Stripe price ID
    features: [
      { fr: 'Tout de Starter', en: 'Everything in Starter' },
      { fr: 'Workflows illimités', en: 'Unlimited workflows' },
      { fr: 'Support prioritaire', en: 'Priority support' },
      { fr: 'API access', en: 'API access' },
      { fr: 'Rapports personnalisés', en: 'Custom reports' },
    ],
  },
}

// Integration types
export const INTEGRATION_TYPES = {
  STRIPE: 'stripe',
  N8N: 'n8n',
  RESEND: 'resend',
  GOOGLE_ANALYTICS: 'google_analytics',
  MAILCHIMP: 'mailchimp',
  CONVERTKIT: 'convertkit',
  ZAPIER: 'zapier',
} as const

// Workflow statuses
export const WORKFLOW_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ERROR: 'error',
} as const

// Subscription statuses
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  CANCELED: 'canceled',
  PAST_DUE: 'past_due',
  UNPAID: 'unpaid',
  TRIALING: 'trialing',
} as const
