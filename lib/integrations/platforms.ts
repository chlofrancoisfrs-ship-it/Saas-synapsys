// =====================================================
// PLATFORM CONFIGURATIONS
// =====================================================

export type PlatformType =
  | 'youtube'
  | 'linkedin'
  | 'instagram'
  | 'stripe'
  | 'calendly'
  | 'whatsapp'
  | 'telegram'
  | 'phantombuster'

export interface PlatformConfig {
  id: PlatformType
  name: string
  description: string
  logo: string // SVG or emoji
  color: string
  authType: 'oauth' | 'api_key'
  isPremiumOnly: boolean
  benefits: string[]
  scopes?: string[]
  docs?: string
}

export const PLATFORMS: Record<PlatformType, PlatformConfig> = {
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    description: 'Analysez vos vidéos et votre audience',
    logo: '📺',
    color: '#FF0000',
    authType: 'oauth',
    isPremiumOnly: false,
    benefits: [
      'Analytics de vos vidéos',
      'Suivi des abonnés',
      'Tracking des conversions',
    ],
    scopes: [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/youtube.analytics.readonly',
    ],
    docs: 'https://developers.google.com/youtube/v3',
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Suivez vos posts et votre réseau professionnel',
    logo: '💼',
    color: '#0077B5',
    authType: 'oauth',
    isPremiumOnly: false,
    benefits: [
      'Analytics des posts',
      'Suivi des connexions',
      'Engagement tracking',
    ],
    scopes: ['r_liteprofile', 'r_organization_social'],
    docs: 'https://docs.microsoft.com/en-us/linkedin/shared/authentication/authentication',
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    description: 'Analysez vos posts et stories',
    logo: '📷',
    color: '#E4405F',
    authType: 'oauth',
    isPremiumOnly: false,
    benefits: [
      'Insights des posts',
      'Analytics des stories',
      'Tracking engagement',
    ],
    scopes: ['instagram_basic', 'instagram_manage_insights', 'pages_show_list'],
    docs: 'https://developers.facebook.com/docs/instagram-api',
  },
  stripe: {
    id: 'stripe',
    name: 'Stripe',
    description: 'Centralisez vos données de paiement',
    logo: '💳',
    color: '#635BFF',
    authType: 'oauth',
    isPremiumOnly: false,
    benefits: [
      'Données de transactions',
      'Analytics de revenus',
      'Tracking clients',
    ],
    docs: 'https://stripe.com/docs/api',
  },
  calendly: {
    id: 'calendly',
    name: 'Calendly',
    description: 'Suivez vos rendez-vous et disponibilités',
    logo: '📅',
    color: '#006BFF',
    authType: 'oauth',
    isPremiumOnly: false,
    benefits: [
      'Events schedulés',
      'Stats de bookings',
      'Taux de conversion',
    ],
    scopes: ['default'],
    docs: 'https://developer.calendly.com/api-docs',
  },
  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Automatisez vos messages WhatsApp',
    logo: '💬',
    color: '#25D366',
    authType: 'api_key',
    isPremiumOnly: true,
    benefits: [
      'Messages automatisés',
      'Templates WhatsApp',
      'Analytics messages',
    ],
    docs: 'https://developers.facebook.com/docs/whatsapp',
  },
  telegram: {
    id: 'telegram',
    name: 'Telegram',
    description: 'Automatisez votre canal Telegram',
    logo: '✈️',
    color: '#0088CC',
    authType: 'api_key',
    isPremiumOnly: true,
    benefits: [
      'Bot automation',
      'Canal analytics',
      'Messages automatiques',
    ],
    docs: 'https://core.telegram.org/bots/api',
  },
  phantombuster: {
    id: 'phantombuster',
    name: 'PhantomBuster',
    description: 'Automatisez vos extractions de données',
    logo: '👻',
    color: '#8B5CF6',
    authType: 'api_key',
    isPremiumOnly: true,
    benefits: [
      'Phantoms automation',
      'Data extraction',
      'Lead generation',
    ],
    docs: 'https://hub.phantombuster.com/reference',
  },
}

export const getPlatformConfig = (platform: PlatformType): PlatformConfig => {
  return PLATFORMS[platform]
}

export const getOAuthPlatforms = (): PlatformConfig[] => {
  return Object.values(PLATFORMS).filter((p) => p.authType === 'oauth')
}

export const getApiKeyPlatforms = (): PlatformConfig[] => {
  return Object.values(PLATFORMS).filter((p) => p.authType === 'api_key')
}
