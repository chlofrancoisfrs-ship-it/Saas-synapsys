import {
  Lightbulb,
  Video,
  Clock,
  TrendingUp,
  Phone,
  MessageSquare,
  Send,
  Repeat,
  Target,
  DollarSign,
  Share2
} from 'lucide-react'

export type WorkflowType =
  | 'creator_insights'
  | 'youtube_conversion'
  | 'time_to_cash'
  | 'performance_tracking'
  | 'call_analysis'
  | 'whatsapp_onboarding'
  | 'follow_up'
  | 'content_repurposing'
  | 'lead_scoring'
  | 'revenue_attribution'
  | 'telegram_poster'

export type WorkflowFrequency = 'daily' | 'weekly' | 'on_demand'
export type WorkflowPlan = 'starter' | 'premium'

export interface WorkflowConfig {
  id: WorkflowType
  name: string
  description: string
  longDescription: string
  icon: any
  color: string
  plan: WorkflowPlan
  isPremiumOnly: boolean
  defaultFrequency: WorkflowFrequency
  allowedFrequencies: WorkflowFrequency[]
  requiredIntegrations: string[]
  configFields: WorkflowConfigField[]
  statsLabels: string[]
}

export interface WorkflowConfigField {
  key: string
  label: string
  type: 'text' | 'number' | 'textarea' | 'select' | 'multiselect' | 'checkbox' | 'slider' | 'radio'
  required?: boolean
  options?: { value: string; label: string }[]
  min?: number
  max?: number
  step?: number
  defaultValue?: any
  placeholder?: string
  helpText?: string
}

export const WORKFLOWS: Record<WorkflowType, WorkflowConfig> = {
  creator_insights: {
    id: 'creator_insights',
    name: 'Creator Insights',
    description: 'Analyse les patterns de contenu performants et génère des recommandations',
    longDescription: 'Analyse automatique de vos créateurs de référence pour identifier les patterns de contenu qui performent le mieux. Reçoit des recommandations personnalisées pour votre stratégie Top/Middle/Bottom funnel.',
    icon: Lightbulb,
    color: '#F59E0B',
    plan: 'starter',
    isPremiumOnly: false,
    defaultFrequency: 'weekly',
    allowedFrequencies: ['weekly', 'on_demand'],
    requiredIntegrations: ['youtube'],
    configFields: [
      {
        key: 'platforms',
        label: 'Plateformes à analyser',
        type: 'multiselect',
        required: true,
        options: [
          { value: 'youtube', label: 'YouTube' },
          { value: 'linkedin', label: 'LinkedIn' },
          { value: 'instagram', label: 'Instagram' },
        ],
        defaultValue: ['youtube'],
      },
      {
        key: 'creator_count',
        label: 'Nombre de créateurs à analyser',
        type: 'slider',
        required: true,
        min: 5,
        max: 50,
        step: 5,
        defaultValue: 10,
        helpText: 'Plus le nombre est élevé, plus l\'analyse sera complète',
      },
      {
        key: 'niche',
        label: 'Niche de focus',
        type: 'select',
        required: true,
        options: [
          { value: 'business', label: 'Business & Entrepreneuriat' },
          { value: 'fitness', label: 'Fitness & Santé' },
          { value: 'tech', label: 'Tech & Développement' },
          { value: 'marketing', label: 'Marketing & Growth' },
          { value: 'finance', label: 'Finance & Investissement' },
          { value: 'coaching', label: 'Coaching & Développement personnel' },
        ],
        defaultValue: 'business',
      },
    ],
    statsLabels: ['Créateurs analysés', 'Patterns identifiés', 'Recommandations'],
  },

  youtube_conversion: {
    id: 'youtube_conversion',
    name: 'YouTube Conversion Tracking',
    description: 'Analyse combien chaque vidéo génère d\'appels et de conversions',
    longDescription: 'Corrélation automatique entre vos vidéos YouTube et les appels Calendly pour mesurer précisément quel contenu génère le plus de prospects qualifiés.',
    icon: Video,
    color: '#EF4444',
    plan: 'starter',
    isPremiumOnly: false,
    defaultFrequency: 'daily',
    allowedFrequencies: ['daily', 'weekly', 'on_demand'],
    requiredIntegrations: ['youtube', 'calendly'],
    configFields: [
      {
        key: 'include_shorts',
        label: 'Inclure les YouTube Shorts',
        type: 'checkbox',
        defaultValue: true,
      },
      {
        key: 'conversion_threshold',
        label: 'Seuil d\'alerte de conversion (%)',
        type: 'number',
        required: true,
        min: 0,
        max: 100,
        defaultValue: 5,
        helpText: 'Vous serez alerté si le taux de conversion descend sous ce seuil',
      },
      {
        key: 'tracking_window',
        label: 'Fenêtre de tracking (jours)',
        type: 'slider',
        required: true,
        min: 1,
        max: 30,
        step: 1,
        defaultValue: 7,
        helpText: 'Nombre de jours après visionnage pour attribuer un appel à une vidéo',
      },
    ],
    statsLabels: ['Vidéos analysées', 'Appels générés', 'Taux de conversion'],
  },

  time_to_cash: {
    id: 'time_to_cash',
    name: 'Time-to-Cash Tracker',
    description: 'Analyse vos activités vs revenus générés pour optimiser votre productivité',
    longDescription: 'Suivez précisément combien de temps vous passez sur chaque activité et combien de revenus elle génère. Obtenez un score de productivité et des recommandations de priorisation.',
    icon: Clock,
    color: '#8B5CF6',
    plan: 'starter',
    isPremiumOnly: false,
    defaultFrequency: 'weekly',
    allowedFrequencies: ['daily', 'weekly', 'on_demand'],
    requiredIntegrations: ['stripe', 'calendly'],
    configFields: [
      {
        key: 'productivity_goal',
        label: 'Objectif de productivité (/100)',
        type: 'slider',
        required: true,
        min: 50,
        max: 100,
        step: 5,
        defaultValue: 80,
      },
      {
        key: 'tracked_activities',
        label: 'Activités à tracker',
        type: 'multiselect',
        required: true,
        options: [
          { value: 'content_creation', label: 'Création de contenu' },
          { value: 'sales_calls', label: 'Appels de vente' },
          { value: 'admin', label: 'Administratif' },
          { value: 'marketing', label: 'Marketing & Promotion' },
          { value: 'product_dev', label: 'Développement produit' },
          { value: 'networking', label: 'Networking' },
        ],
        defaultValue: ['content_creation', 'sales_calls'],
      },
    ],
    statsLabels: ['Score productivité', 'Heures trackées', 'ROI moyen'],
  },

  performance_tracking: {
    id: 'performance_tracking',
    name: 'Performance Tracking',
    description: 'Suivi multi-plateformes avec alertes sur les baisses de performance',
    longDescription: 'Surveillance automatique de vos performances sur toutes vos plateformes. Détection de tendances, alertes en cas de baisse significative, et insights actionnables.',
    icon: TrendingUp,
    color: '#10B981',
    plan: 'starter',
    isPremiumOnly: false,
    defaultFrequency: 'daily',
    allowedFrequencies: ['daily', 'weekly'],
    requiredIntegrations: [],
    configFields: [
      {
        key: 'monitored_platforms',
        label: 'Plateformes à surveiller',
        type: 'multiselect',
        required: true,
        options: [
          { value: 'youtube', label: 'YouTube' },
          { value: 'linkedin', label: 'LinkedIn' },
          { value: 'instagram', label: 'Instagram' },
        ],
        defaultValue: ['youtube'],
      },
      {
        key: 'alert_threshold',
        label: 'Seuil d\'alerte baisse (%)',
        type: 'slider',
        required: true,
        min: 10,
        max: 50,
        step: 5,
        defaultValue: 20,
        helpText: 'Vous serez alerté si une métrique baisse de plus de ce pourcentage',
      },
    ],
    statsLabels: ['Plateformes surveillées', 'Tendance globale', 'Alertes actives'],
  },

  call_analysis: {
    id: 'call_analysis',
    name: 'Call Analysis',
    description: 'Analyse automatique de vos appels de vente avec extraction des pain points',
    longDescription: 'Analyse approfondie de vos appels via PhantomBuster pour extraire les pain points, objections courantes et générer automatiquement vos avatars clients.',
    icon: Phone,
    color: '#3B82F6',
    plan: 'premium',
    isPremiumOnly: true,
    defaultFrequency: 'daily',
    allowedFrequencies: ['daily', 'on_demand'],
    requiredIntegrations: ['phantombuster', 'calendly'],
    configFields: [
      {
        key: 'phantombuster_agent_url',
        label: 'URL PhantomBuster Agent',
        type: 'text',
        required: true,
        placeholder: 'https://phantombuster.com/api/...',
        helpText: 'Lien vers votre agent PhantomBuster de transcription',
      },
      {
        key: 'auto_generate_avatar',
        label: 'Générer avatar client automatiquement',
        type: 'checkbox',
        defaultValue: true,
      },
      {
        key: 'min_calls_for_avatar',
        label: 'Nombre minimum d\'appels pour générer avatar',
        type: 'number',
        required: true,
        min: 5,
        max: 50,
        defaultValue: 10,
      },
    ],
    statsLabels: ['Appels analysés', 'Taux de closing', 'Pain points identifiés'],
  },

  whatsapp_onboarding: {
    id: 'whatsapp_onboarding',
    name: 'WhatsApp Onboarding',
    description: 'Automatisation complète de l\'onboarding prospect via WhatsApp',
    longDescription: 'Séquence automatisée de messages WhatsApp personnalisés pour onboarder vos nouveaux prospects de manière efficace et chaleureuse.',
    icon: MessageSquare,
    color: '#22C55E',
    plan: 'premium',
    isPremiumOnly: true,
    defaultFrequency: 'on_demand',
    allowedFrequencies: ['on_demand'],
    requiredIntegrations: ['whatsapp'],
    configFields: [
      {
        key: 'message_1',
        label: 'Message 1 - Bienvenue',
        type: 'textarea',
        required: true,
        placeholder: 'Bonjour {{nom}}, bienvenue ! ...',
        helpText: 'Variables disponibles: {{nom}}, {{prenom}}, {{entreprise}}',
      },
      {
        key: 'delay_1',
        label: 'Délai avant message 2 (heures)',
        type: 'number',
        required: true,
        min: 1,
        max: 72,
        defaultValue: 24,
      },
      {
        key: 'message_2',
        label: 'Message 2 - Valeur',
        type: 'textarea',
        required: true,
        placeholder: 'Voici ce que nous allons faire ensemble ...',
      },
      {
        key: 'delay_2',
        label: 'Délai avant message 3 (heures)',
        type: 'number',
        required: true,
        min: 1,
        max: 72,
        defaultValue: 48,
      },
      {
        key: 'message_3',
        label: 'Message 3 - Call to action',
        type: 'textarea',
        required: true,
        placeholder: 'Prêt à passer à l\'action ? ...',
      },
    ],
    statsLabels: ['Prospects onboardés', 'Taux de réponse', 'Conversions'],
  },

  follow_up: {
    id: 'follow_up',
    name: 'Follow-up Post-Call',
    description: 'Messages automatiques personnalisés après chaque appel de vente',
    longDescription: 'Envoi automatique de messages WhatsApp ou Telegram après vos appels, personnalisés selon l\'outcome de l\'appel (intéressé, à recontacter, non qualifié).',
    icon: Send,
    color: '#EC4899',
    plan: 'premium',
    isPremiumOnly: true,
    defaultFrequency: 'on_demand',
    allowedFrequencies: ['on_demand'],
    requiredIntegrations: ['calendly'],
    configFields: [
      {
        key: 'follow_up_channel',
        label: 'Canal de suivi',
        type: 'radio',
        required: true,
        options: [
          { value: 'whatsapp', label: 'WhatsApp' },
          { value: 'telegram', label: 'Telegram' },
          { value: 'both', label: 'Les deux' },
        ],
        defaultValue: 'whatsapp',
      },
      {
        key: 'template_interested',
        label: 'Template - Prospect intéressé',
        type: 'textarea',
        required: true,
        placeholder: 'Merci pour cet échange {{nom}} ! Comme convenu...',
      },
      {
        key: 'template_callback',
        label: 'Template - À recontacter',
        type: 'textarea',
        required: true,
        placeholder: 'Merci {{nom}} ! Je te recontacte comme prévu...',
      },
      {
        key: 'template_not_qualified',
        label: 'Template - Non qualifié',
        type: 'textarea',
        required: true,
        placeholder: 'Merci pour ton temps {{nom}}. Voici quelques ressources...',
      },
    ],
    statsLabels: ['Follow-ups envoyés', 'Taux d\'ouverture', 'Réponses reçues'],
  },

  content_repurposing: {
    id: 'content_repurposing',
    name: 'Content Repurposing Engine',
    description: 'Transforme votre contenu long-form en formats courts adaptés par plateforme',
    longDescription: 'Moteur de transformation automatique de vos contenus longs (vidéos, articles) en formats courts optimisés pour chaque plateforme (Reels, Shorts, carrousels LinkedIn).',
    icon: Repeat,
    color: '#F97316',
    plan: 'premium',
    isPremiumOnly: true,
    defaultFrequency: 'on_demand',
    allowedFrequencies: ['weekly', 'on_demand'],
    requiredIntegrations: ['youtube'],
    configFields: [
      {
        key: 'source_platform',
        label: 'Plateforme source',
        type: 'select',
        required: true,
        options: [
          { value: 'youtube', label: 'YouTube' },
          { value: 'linkedin', label: 'LinkedIn' },
        ],
        defaultValue: 'youtube',
      },
      {
        key: 'target_formats',
        label: 'Formats de destination',
        type: 'multiselect',
        required: true,
        options: [
          { value: 'shorts', label: 'YouTube Shorts' },
          { value: 'reels', label: 'Instagram Reels' },
          { value: 'tiktok', label: 'TikTok' },
          { value: 'linkedin_carousel', label: 'Carrousel LinkedIn' },
          { value: 'twitter_thread', label: 'Twitter Thread' },
        ],
        defaultValue: ['shorts', 'reels'],
      },
      {
        key: 'clips_per_video',
        label: 'Nombre de clips par vidéo',
        type: 'slider',
        required: true,
        min: 1,
        max: 10,
        step: 1,
        defaultValue: 3,
      },
    ],
    statsLabels: ['Contenus transformés', 'Clips générés', 'Taux d\'engagement'],
  },

  lead_scoring: {
    id: 'lead_scoring',
    name: 'Lead Scoring & Nurturing',
    description: 'Score comportemental automatique et nurturing personnalisé',
    longDescription: 'Système de scoring automatique de vos leads basé sur leurs comportements multi-touch. Automatise le nurturing selon la température du lead.',
    icon: Target,
    color: '#06B6D4',
    plan: 'premium',
    isPremiumOnly: true,
    defaultFrequency: 'on_demand',
    allowedFrequencies: ['on_demand'],
    requiredIntegrations: [],
    configFields: [
      {
        key: 'scoring_criteria',
        label: 'Critères de scoring',
        type: 'multiselect',
        required: true,
        options: [
          { value: 'video_views', label: 'Visionnages vidéos' },
          { value: 'email_opens', label: 'Ouvertures emails' },
          { value: 'link_clicks', label: 'Clics liens' },
          { value: 'page_visits', label: 'Visites pages' },
          { value: 'social_engagement', label: 'Engagement social' },
        ],
        defaultValue: ['video_views', 'email_opens', 'link_clicks'],
      },
      {
        key: 'hot_lead_threshold',
        label: 'Seuil lead "chaud" (score/100)',
        type: 'slider',
        required: true,
        min: 50,
        max: 100,
        step: 5,
        defaultValue: 75,
      },
      {
        key: 'auto_nurturing',
        label: 'Activer nurturing automatique',
        type: 'checkbox',
        defaultValue: true,
      },
    ],
    statsLabels: ['Leads scorés', 'Leads chauds', 'Taux de conversion'],
  },

  revenue_attribution: {
    id: 'revenue_attribution',
    name: 'Revenue Attribution Model',
    description: 'Attribution multi-touch du CA par canal et prédiction revenus',
    longDescription: 'Modèle d\'attribution avancé pour comprendre précisément quel canal génère quel revenu. Calcul de LTV par source et prédictions de revenus par contenu.',
    icon: DollarSign,
    color: '#84CC16',
    plan: 'premium',
    isPremiumOnly: true,
    defaultFrequency: 'daily',
    allowedFrequencies: ['daily', 'weekly'],
    requiredIntegrations: ['stripe'],
    configFields: [
      {
        key: 'attribution_model',
        label: 'Modèle d\'attribution',
        type: 'select',
        required: true,
        options: [
          { value: 'first_touch', label: 'First Touch' },
          { value: 'last_touch', label: 'Last Touch' },
          { value: 'linear', label: 'Linéaire' },
          { value: 'time_decay', label: 'Time Decay' },
        ],
        defaultValue: 'linear',
      },
      {
        key: 'tracking_channels',
        label: 'Canaux à tracker',
        type: 'multiselect',
        required: true,
        options: [
          { value: 'youtube', label: 'YouTube' },
          { value: 'linkedin', label: 'LinkedIn' },
          { value: 'instagram', label: 'Instagram' },
          { value: 'email', label: 'Email' },
          { value: 'direct', label: 'Direct' },
        ],
        defaultValue: ['youtube', 'linkedin'],
      },
      {
        key: 'prediction_enabled',
        label: 'Activer prédictions revenus',
        type: 'checkbox',
        defaultValue: true,
      },
    ],
    statsLabels: ['CA attribué', 'LTV moyen', 'Canal le plus rentable'],
  },

  telegram_poster: {
    id: 'telegram_poster',
    name: 'Telegram Auto-Poster',
    description: 'Planification et publication automatique sur Telegram',
    longDescription: 'Automatisation complète de vos publications Telegram. Planification avancée, cross-posting depuis d\'autres plateformes, et optimisation des horaires de publication.',
    icon: Share2,
    color: '#0EA5E9',
    plan: 'premium',
    isPremiumOnly: true,
    defaultFrequency: 'on_demand',
    allowedFrequencies: ['daily', 'on_demand'],
    requiredIntegrations: ['telegram'],
    configFields: [
      {
        key: 'posting_frequency',
        label: 'Fréquence de publication',
        type: 'select',
        required: true,
        options: [
          { value: '1', label: '1 fois par jour' },
          { value: '2', label: '2 fois par jour' },
          { value: '3', label: '3 fois par jour' },
          { value: 'custom', label: 'Personnalisé' },
        ],
        defaultValue: '1',
      },
      {
        key: 'cross_post_from',
        label: 'Cross-post depuis',
        type: 'multiselect',
        required: false,
        options: [
          { value: 'youtube', label: 'YouTube' },
          { value: 'linkedin', label: 'LinkedIn' },
          { value: 'instagram', label: 'Instagram' },
        ],
        defaultValue: [],
      },
      {
        key: 'best_time_optimization',
        label: 'Optimiser horaires de publication',
        type: 'checkbox',
        defaultValue: true,
        helpText: 'Analyse automatique des meilleurs horaires selon engagement',
      },
    ],
    statsLabels: ['Publications envoyées', 'Taux d\'engagement', 'Meilleur horaire'],
  },
}

export const PREMIUM_WORKFLOWS: WorkflowType[] = [
  'call_analysis',
  'whatsapp_onboarding',
  'follow_up',
  'content_repurposing',
  'lead_scoring',
  'revenue_attribution',
  'telegram_poster',
]

export function getWorkflowsByPlan(plan: 'starter' | 'premium'): WorkflowConfig[] {
  if (plan === 'premium') {
    return Object.values(WORKFLOWS)
  }
  return Object.values(WORKFLOWS).filter(w => !w.isPremiumOnly)
}

export function canUserAccessWorkflow(userPlan: 'starter' | 'premium', workflowType: WorkflowType): boolean {
  const workflow = WORKFLOWS[workflowType]
  if (!workflow) return false
  if (workflow.isPremiumOnly && userPlan !== 'premium') return false
  return true
}

export function getWorkflowColor(workflowType: WorkflowType): string {
  return WORKFLOWS[workflowType]?.color || '#6B7280'
}

export function getWorkflowIcon(workflowType: WorkflowType) {
  return WORKFLOWS[workflowType]?.icon || Lightbulb
}
