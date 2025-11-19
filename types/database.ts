// =====================================================
// SYNAPSYS - DATABASE TYPES
// TypeScript types for all database tables
// =====================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// =====================================================
// USERS
// =====================================================

export interface User {
  id: string
  email: string | null
  full_name: string | null
  language: 'fr' | 'en'
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface UserInsert {
  id: string
  email?: string | null
  full_name?: string | null
  language?: 'fr' | 'en'
  onboarding_completed?: boolean
  created_at?: string
  updated_at?: string
}

export interface UserUpdate {
  id?: string
  email?: string | null
  full_name?: string | null
  language?: 'fr' | 'en'
  onboarding_completed?: boolean
  created_at?: string
  updated_at?: string
}

// =====================================================
// SUBSCRIPTIONS
// =====================================================

export type SubscriptionPlan = 'starter' | 'premium'
export type SubscriptionBillingPeriod = 'monthly' | 'yearly'
export type SubscriptionStatus = 'trialing' | 'active' | 'canceled' | 'past_due' | 'incomplete'

export interface Subscription {
  id: string
  user_id: string
  plan_type: SubscriptionPlan | null
  billing_period: SubscriptionBillingPeriod | null
  status: SubscriptionStatus
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  price_id: string | null
  trial_start: string | null
  trial_end: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  ended_at: string | null
  created_at: string
  updated_at: string
}

// Alias for convenience
export type SubscriptionRow = Subscription
export type UserRow = User

export interface SubscriptionInsert {
  id?: string
  user_id: string
  plan_type?: SubscriptionPlan | null
  billing_period?: SubscriptionBillingPeriod | null
  status?: SubscriptionStatus
  stripe_subscription_id?: string | null
  stripe_customer_id?: string | null
  price_id?: string | null
  trial_start?: string | null
  trial_end?: string | null
  current_period_start?: string | null
  current_period_end?: string | null
  cancel_at_period_end?: boolean
  ended_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface SubscriptionUpdate {
  id?: string
  user_id?: string
  plan_type?: SubscriptionPlan | null
  billing_period?: SubscriptionBillingPeriod | null
  status?: SubscriptionStatus
  stripe_subscription_id?: string | null
  stripe_customer_id?: string | null
  price_id?: string | null
  trial_start?: string | null
  trial_end?: string | null
  current_period_start?: string | null
  current_period_end?: string | null
  cancel_at_period_end?: boolean
  ended_at?: string | null
  created_at?: string
  updated_at?: string
}

// =====================================================
// INTEGRATIONS
// =====================================================

export type IntegrationPlatform =
  | 'youtube'
  | 'linkedin'
  | 'instagram'
  | 'stripe'
  | 'calendly'
  | 'whatsapp'
  | 'telegram'
  | 'phantombuster'

export interface Integration {
  id: string
  user_id: string
  platform: IntegrationPlatform
  access_token: string | null
  refresh_token: string | null
  token_expiry: string | null
  is_active: boolean
  config: Json
  last_sync: string | null
  created_at: string
  updated_at: string
}

export interface IntegrationInsert {
  id?: string
  user_id: string
  platform: IntegrationPlatform
  access_token?: string | null
  refresh_token?: string | null
  token_expiry?: string | null
  is_active?: boolean
  config?: Json
  last_sync?: string | null
  created_at?: string
  updated_at?: string
}

export interface IntegrationUpdate {
  id?: string
  user_id?: string
  platform?: IntegrationPlatform
  access_token?: string | null
  refresh_token?: string | null
  token_expiry?: string | null
  is_active?: boolean
  config?: Json
  last_sync?: string | null
  created_at?: string
  updated_at?: string
}

// =====================================================
// WORKFLOWS
// =====================================================

export type WorkflowType =
  | 'creator_insights'
  | 'youtube_conversion'
  | 'performance_tracking'
  | 'call_analysis'
  | 'whatsapp_onboarding'
  | 'time_to_cash'
  | 'content_repurposing'
  | 'lead_scoring'
  | 'revenue_attribution'
  | 'telegram_poster'
  | 'follow_up'

export type WorkflowFrequency = 'daily' | 'weekly' | 'on_demand'

export interface Workflow {
  id: string
  user_id: string
  workflow_type: WorkflowType
  n8n_workflow_id: string | null
  name: string
  description: string | null
  is_active: boolean
  config: Json
  last_run: string | null
  next_run: string | null
  run_frequency: WorkflowFrequency
  created_at: string
  updated_at: string
}

export interface WorkflowInsert {
  id?: string
  user_id: string
  workflow_type: WorkflowType
  n8n_workflow_id?: string | null
  name: string
  description?: string | null
  is_active?: boolean
  config?: Json
  last_run?: string | null
  next_run?: string | null
  run_frequency?: WorkflowFrequency
  created_at?: string
  updated_at?: string
}

export interface WorkflowUpdate {
  id?: string
  user_id?: string
  workflow_type?: WorkflowType
  n8n_workflow_id?: string | null
  name?: string
  description?: string | null
  is_active?: boolean
  config?: Json
  last_run?: string | null
  next_run?: string | null
  run_frequency?: WorkflowFrequency
  created_at?: string
  updated_at?: string
}

// =====================================================
// WORKFLOW_RUNS
// =====================================================

export type WorkflowRunStatus = 'running' | 'success' | 'failed'

export interface WorkflowRun {
  id: string
  workflow_id: string
  status: WorkflowRunStatus
  started_at: string
  completed_at: string | null
  result: Json
  error_message: string | null
  created_at: string
}

export interface WorkflowRunInsert {
  id?: string
  workflow_id: string
  status?: WorkflowRunStatus
  started_at?: string
  completed_at?: string | null
  result?: Json
  error_message?: string | null
  created_at?: string
}

export interface WorkflowRunUpdate {
  id?: string
  workflow_id?: string
  status?: WorkflowRunStatus
  started_at?: string
  completed_at?: string | null
  result?: Json
  error_message?: string | null
  created_at?: string
}

// =====================================================
// CREATOR_DATABASE
// =====================================================

export type CreatorPlatform = 'youtube' | 'linkedin' | 'instagram'

export interface CreatorDatabase {
  id: string
  platform: CreatorPlatform
  creator_id: string
  creator_name: string | null
  follower_count: number | null
  engagement_rate: number | null
  niche: string | null
  last_analyzed: string | null
  created_at: string
}

export interface CreatorDatabaseInsert {
  id?: string
  platform: CreatorPlatform
  creator_id: string
  creator_name?: string | null
  follower_count?: number | null
  engagement_rate?: number | null
  niche?: string | null
  last_analyzed?: string | null
  created_at?: string
}

export interface CreatorDatabaseUpdate {
  id?: string
  platform?: CreatorPlatform
  creator_id?: string
  creator_name?: string | null
  follower_count?: number | null
  engagement_rate?: number | null
  niche?: string | null
  last_analyzed?: string | null
  created_at?: string
}

// =====================================================
// CONTENT_PATTERNS
// =====================================================

export type FunnelStage = 'top' | 'middle' | 'bottom'

export interface ContentPattern {
  id: string
  creator_id: string
  platform: string
  content_type: string | null
  hook_pattern: string | null
  engagement_score: number | null
  views: number | null
  funnel_stage: FunnelStage | null
  analyzed_at: string
  created_at: string
}

export interface ContentPatternInsert {
  id?: string
  creator_id: string
  platform: string
  content_type?: string | null
  hook_pattern?: string | null
  engagement_score?: number | null
  views?: number | null
  funnel_stage?: FunnelStage | null
  analyzed_at?: string
  created_at?: string
}

export interface ContentPatternUpdate {
  id?: string
  creator_id?: string
  platform?: string
  content_type?: string | null
  hook_pattern?: string | null
  engagement_score?: number | null
  views?: number | null
  funnel_stage?: FunnelStage | null
  analyzed_at?: string
  created_at?: string
}

// =====================================================
// YOUTUBE_ANALYTICS
// =====================================================

export interface YoutubeAnalytics {
  id: string
  user_id: string
  video_id: string
  video_title: string | null
  published_at: string | null
  views: number
  watch_time: number
  engagement_rate: number | null
  calls_generated: number
  revenue_attributed: number
  created_at: string
}

export interface YoutubeAnalyticsInsert {
  id?: string
  user_id: string
  video_id: string
  video_title?: string | null
  published_at?: string | null
  views?: number
  watch_time?: number
  engagement_rate?: number | null
  calls_generated?: number
  revenue_attributed?: number
  created_at?: string
}

export interface YoutubeAnalyticsUpdate {
  id?: string
  user_id?: string
  video_id?: string
  video_title?: string | null
  published_at?: string | null
  views?: number
  watch_time?: number
  engagement_rate?: number | null
  calls_generated?: number
  revenue_attributed?: number
  created_at?: string
}

// =====================================================
// REVENUE_TRACKING
// =====================================================

export type RevenueSource = 'stripe' | 'manual'

export interface RevenueTracking {
  id: string
  user_id: string
  date: string
  platform: string | null
  content_id: string | null
  revenue: number
  source: RevenueSource
  attribution_model: string | null
  created_at: string
}

export interface RevenueTrackingInsert {
  id?: string
  user_id: string
  date: string
  platform?: string | null
  content_id?: string | null
  revenue: number
  source?: RevenueSource
  attribution_model?: string | null
  created_at?: string
}

export interface RevenueTrackingUpdate {
  id?: string
  user_id?: string
  date?: string
  platform?: string | null
  content_id?: string | null
  revenue?: number
  source?: RevenueSource
  attribution_model?: string | null
  created_at?: string
}

// =====================================================
// NOTIFICATIONS
// =====================================================

export type NotificationType = 'alert' | 'warning' | 'info' | 'success'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  is_read: boolean
  action_url: string | null
  created_at: string
}

export interface NotificationInsert {
  id?: string
  user_id: string
  type?: NotificationType
  title: string
  message: string
  is_read?: boolean
  action_url?: string | null
  created_at?: string
}

export interface NotificationUpdate {
  id?: string
  user_id?: string
  type?: NotificationType
  title?: string
  message?: string
  is_read?: boolean
  action_url?: string | null
  created_at?: string
}

// =====================================================
// CALL_ANALYSIS
// =====================================================

export type CallOutcome = 'closed' | 'follow_up' | 'lost'

export interface CallAnalysis {
  id: string
  user_id: string
  call_id: string
  call_date: string
  duration: number | null
  outcome: CallOutcome | null
  pain_points: Json
  objections: Json
  customer_avatar: Json
  source_platform: string | null
  source_content_id: string | null
  created_at: string
}

export interface CallAnalysisInsert {
  id?: string
  user_id: string
  call_id: string
  call_date: string
  duration?: number | null
  outcome?: CallOutcome | null
  pain_points?: Json
  objections?: Json
  customer_avatar?: Json
  source_platform?: string | null
  source_content_id?: string | null
  created_at?: string
}

export interface CallAnalysisUpdate {
  id?: string
  user_id?: string
  call_id?: string
  call_date?: string
  duration?: number | null
  outcome?: CallOutcome | null
  pain_points?: Json
  objections?: Json
  customer_avatar?: Json
  source_platform?: string | null
  source_content_id?: string | null
  created_at?: string
}

// =====================================================
// CUSTOMER_AVATARS
// =====================================================

export interface CustomerAvatar {
  id: string
  user_id: string
  avatar_name: string
  demographics: Json
  pain_points: Json
  goals: Json
  objections: Json
  conversion_triggers: Json
  confidence_score: number | null
  created_at: string
  updated_at: string
}

export interface CustomerAvatarInsert {
  id?: string
  user_id: string
  avatar_name: string
  demographics?: Json
  pain_points?: Json
  goals?: Json
  objections?: Json
  conversion_triggers?: Json
  confidence_score?: number | null
  created_at?: string
  updated_at?: string
}

export interface CustomerAvatarUpdate {
  id?: string
  user_id?: string
  avatar_name?: string
  demographics?: Json
  pain_points?: Json
  goals?: Json
  objections?: Json
  conversion_triggers?: Json
  confidence_score?: number | null
  created_at?: string
  updated_at?: string
}

// =====================================================
// DATABASE INTERFACE
// Main database interface combining all tables
// =====================================================

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: UserInsert
        Update: UserUpdate
      }
      subscriptions: {
        Row: Subscription
        Insert: SubscriptionInsert
        Update: SubscriptionUpdate
      }
      integrations: {
        Row: Integration
        Insert: IntegrationInsert
        Update: IntegrationUpdate
      }
      workflows: {
        Row: Workflow
        Insert: WorkflowInsert
        Update: WorkflowUpdate
      }
      workflow_runs: {
        Row: WorkflowRun
        Insert: WorkflowRunInsert
        Update: WorkflowRunUpdate
      }
      creator_database: {
        Row: CreatorDatabase
        Insert: CreatorDatabaseInsert
        Update: CreatorDatabaseUpdate
      }
      content_patterns: {
        Row: ContentPattern
        Insert: ContentPatternInsert
        Update: ContentPatternUpdate
      }
      youtube_analytics: {
        Row: YoutubeAnalytics
        Insert: YoutubeAnalyticsInsert
        Update: YoutubeAnalyticsUpdate
      }
      revenue_tracking: {
        Row: RevenueTracking
        Insert: RevenueTrackingInsert
        Update: RevenueTrackingUpdate
      }
      notifications: {
        Row: Notification
        Insert: NotificationInsert
        Update: NotificationUpdate
      }
      call_analysis: {
        Row: CallAnalysis
        Insert: CallAnalysisInsert
        Update: CallAnalysisUpdate
      }
      customer_avatars: {
        Row: CustomerAvatar
        Insert: CustomerAvatarInsert
        Update: CustomerAvatarUpdate
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      subscription_plan: SubscriptionPlan
      subscription_status: SubscriptionStatus
      integration_platform: IntegrationPlatform
      workflow_type: WorkflowType
      workflow_frequency: WorkflowFrequency
      workflow_run_status: WorkflowRunStatus
      creator_platform: CreatorPlatform
      funnel_stage: FunnelStage
      revenue_source: RevenueSource
      notification_type: NotificationType
      call_outcome: CallOutcome
    }
  }
}

// =====================================================
// HELPER TYPES
// Utility types for common operations
// =====================================================

// Type pour récupérer une table spécifique
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

// Type pour l'insertion dans une table spécifique
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

// Type pour la mise à jour d'une table spécifique
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Type pour les énumérations
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]
