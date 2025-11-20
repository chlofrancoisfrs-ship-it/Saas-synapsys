-- =====================================================
-- SYNAPSYS - COMPLETE DATABASE SCHEMA
-- PostgreSQL Database for SaaS Platform
-- =====================================================

-- =====================================================
-- 1. USERS TABLE
-- Extension de auth.users avec données supplémentaires
-- =====================================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  language TEXT DEFAULT 'fr' CHECK (language IN ('fr', 'en')),
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. SUBSCRIPTIONS TABLE
-- Gestion des abonnements Stripe
-- =====================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  plan_type TEXT CHECK (plan_type IN ('starter', 'premium')),
  billing_period TEXT CHECK (billing_period IN ('monthly', 'yearly')),
  status TEXT CHECK (status IN ('trialing', 'active', 'canceled', 'past_due', 'incomplete')) DEFAULT 'trialing',
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  price_id TEXT,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. INTEGRATIONS TABLE
-- Connexions aux plateformes tierces
-- =====================================================

CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  platform TEXT CHECK (platform IN ('youtube', 'linkedin', 'instagram', 'stripe', 'calendly', 'whatsapp', 'telegram', 'phantombuster')) NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}'::jsonb,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- =====================================================
-- 3B. OAUTH STATES TABLE
-- Temporary storage for OAuth state tokens (CSRF protection)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.oauth_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  state TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. WORKFLOWS TABLE
-- Automatisations N8N
-- =====================================================

CREATE TABLE IF NOT EXISTS public.workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  workflow_type TEXT CHECK (workflow_type IN (
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
    'follow_up'
  )) NOT NULL,
  n8n_workflow_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}'::jsonb,
  last_run TIMESTAMP WITH TIME ZONE,
  next_run TIMESTAMP WITH TIME ZONE,
  run_frequency TEXT CHECK (run_frequency IN ('daily', 'weekly', 'on_demand')) DEFAULT 'on_demand',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. WORKFLOW_RUNS TABLE
-- Historique des exécutions de workflows
-- =====================================================

CREATE TABLE IF NOT EXISTS public.workflow_runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('running', 'success', 'failed')) DEFAULT 'running',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  result JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. CREATOR_DATABASE TABLE
-- Base de données des créateurs (partagée entre users)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.creator_database (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT CHECK (platform IN ('youtube', 'linkedin', 'instagram')) NOT NULL,
  creator_id TEXT NOT NULL,
  creator_name TEXT,
  follower_count INTEGER,
  engagement_rate NUMERIC(5, 2),
  niche TEXT,
  last_analyzed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(platform, creator_id)
);

-- =====================================================
-- 7. CONTENT_PATTERNS TABLE
-- Patterns de contenu des créateurs
-- =====================================================

CREATE TABLE IF NOT EXISTS public.content_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES public.creator_database(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL,
  content_type TEXT,
  hook_pattern TEXT,
  engagement_score NUMERIC(5, 2),
  views INTEGER,
  funnel_stage TEXT CHECK (funnel_stage IN ('top', 'middle', 'bottom')),
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. YOUTUBE_ANALYTICS TABLE
-- Analytics YouTube par utilisateur
-- =====================================================

CREATE TABLE IF NOT EXISTS public.youtube_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  video_id TEXT NOT NULL,
  video_title TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  views INTEGER DEFAULT 0,
  watch_time INTEGER DEFAULT 0,
  engagement_rate NUMERIC(5, 2),
  calls_generated INTEGER DEFAULT 0,
  revenue_attributed NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- =====================================================
-- 9. REVENUE_TRACKING TABLE
-- Suivi des revenus par source
-- =====================================================

CREATE TABLE IF NOT EXISTS public.revenue_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  platform TEXT,
  content_id TEXT,
  revenue NUMERIC(10, 2) NOT NULL,
  source TEXT CHECK (source IN ('stripe', 'manual')) DEFAULT 'stripe',
  attribution_model TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 10. NOTIFICATIONS TABLE
-- Notifications utilisateur
-- =====================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('alert', 'warning', 'info', 'success')) DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 11. CALL_ANALYSIS TABLE
-- Analyse des appels de vente
-- =====================================================

CREATE TABLE IF NOT EXISTS public.call_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  call_id TEXT NOT NULL,
  call_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER,
  outcome TEXT CHECK (outcome IN ('closed', 'follow_up', 'lost')),
  pain_points JSONB DEFAULT '[]'::jsonb,
  objections JSONB DEFAULT '[]'::jsonb,
  customer_avatar JSONB DEFAULT '{}'::jsonb,
  source_platform TEXT,
  source_content_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, call_id)
);

-- =====================================================
-- 12. CUSTOMER_AVATARS TABLE
-- Profils clients types
-- =====================================================

CREATE TABLE IF NOT EXISTS public.customer_avatars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  avatar_name TEXT NOT NULL,
  demographics JSONB DEFAULT '{}'::jsonb,
  pain_points JSONB DEFAULT '[]'::jsonb,
  goals JSONB DEFAULT '[]'::jsonb,
  objections JSONB DEFAULT '[]'::jsonb,
  conversion_triggers JSONB DEFAULT '[]'::jsonb,
  confidence_score NUMERIC(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- Optimisation des performances
-- =====================================================

-- Indexes sur user_id pour toutes les tables utilisateur
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON public.integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON public.workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_workflow_id ON public.workflow_runs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_youtube_analytics_user_id ON public.youtube_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_tracking_user_id ON public.revenue_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_call_analysis_user_id ON public.call_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_avatars_user_id ON public.customer_avatars(user_id);

-- Indexes sur created_at pour tri chronologique
CREATE INDEX IF NOT EXISTS idx_subscriptions_created_at ON public.subscriptions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_integrations_created_at ON public.integrations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflows_created_at ON public.workflows(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_created_at ON public.workflow_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_analysis_created_at ON public.call_analysis(created_at DESC);

-- Indexes spécifiques
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_workflows_is_active ON public.workflows(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_integrations_platform ON public.integrations(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_revenue_tracking_date ON public.revenue_tracking(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_content_patterns_creator_id ON public.content_patterns(creator_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- Activation de la sécurité au niveau des lignes
-- =====================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_database ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youtube_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_avatars ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICIES - USERS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own data" ON public.users;
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own data" ON public.users;
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
CREATE POLICY "Users can insert own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- POLICIES - SUBSCRIPTIONS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- POLICIES - INTEGRATIONS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own integrations" ON public.integrations;
CREATE POLICY "Users can view own integrations" ON public.integrations
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own integrations" ON public.integrations;
CREATE POLICY "Users can insert own integrations" ON public.integrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own integrations" ON public.integrations;
CREATE POLICY "Users can update own integrations" ON public.integrations
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own integrations" ON public.integrations;
CREATE POLICY "Users can delete own integrations" ON public.integrations
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- POLICIES - OAUTH STATES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own oauth states" ON public.oauth_states;
CREATE POLICY "Users can view own oauth states" ON public.oauth_states
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own oauth states" ON public.oauth_states;
CREATE POLICY "Users can insert own oauth states" ON public.oauth_states
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own oauth states" ON public.oauth_states;
CREATE POLICY "Users can delete own oauth states" ON public.oauth_states
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- POLICIES - WORKFLOWS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own workflows" ON public.workflows;
CREATE POLICY "Users can view own workflows" ON public.workflows
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own workflows" ON public.workflows;
CREATE POLICY "Users can insert own workflows" ON public.workflows
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own workflows" ON public.workflows;
CREATE POLICY "Users can update own workflows" ON public.workflows
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own workflows" ON public.workflows;
CREATE POLICY "Users can delete own workflows" ON public.workflows
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- POLICIES - WORKFLOW_RUNS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own workflow runs" ON public.workflow_runs;
CREATE POLICY "Users can view own workflow runs" ON public.workflow_runs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workflows
      WHERE workflows.id = workflow_runs.workflow_id
      AND workflows.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own workflow runs" ON public.workflow_runs;
CREATE POLICY "Users can insert own workflow runs" ON public.workflow_runs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workflows
      WHERE workflows.id = workflow_runs.workflow_id
      AND workflows.user_id = auth.uid()
    )
  );

-- =====================================================
-- POLICIES - CREATOR_DATABASE (Lecture seule pour tous)
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view creator database" ON public.creator_database;
CREATE POLICY "Anyone can view creator database" ON public.creator_database
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- =====================================================
-- POLICIES - CONTENT_PATTERNS (Lecture seule pour tous)
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view content patterns" ON public.content_patterns;
CREATE POLICY "Anyone can view content patterns" ON public.content_patterns
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- =====================================================
-- POLICIES - YOUTUBE_ANALYTICS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own youtube analytics" ON public.youtube_analytics;
CREATE POLICY "Users can view own youtube analytics" ON public.youtube_analytics
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own youtube analytics" ON public.youtube_analytics;
CREATE POLICY "Users can insert own youtube analytics" ON public.youtube_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own youtube analytics" ON public.youtube_analytics;
CREATE POLICY "Users can update own youtube analytics" ON public.youtube_analytics
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- POLICIES - REVENUE_TRACKING
-- =====================================================

DROP POLICY IF EXISTS "Users can view own revenue tracking" ON public.revenue_tracking;
CREATE POLICY "Users can view own revenue tracking" ON public.revenue_tracking
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own revenue tracking" ON public.revenue_tracking;
CREATE POLICY "Users can insert own revenue tracking" ON public.revenue_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own revenue tracking" ON public.revenue_tracking;
CREATE POLICY "Users can update own revenue tracking" ON public.revenue_tracking
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- POLICIES - NOTIFICATIONS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- POLICIES - CALL_ANALYSIS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own call analysis" ON public.call_analysis;
CREATE POLICY "Users can view own call analysis" ON public.call_analysis
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own call analysis" ON public.call_analysis;
CREATE POLICY "Users can insert own call analysis" ON public.call_analysis
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own call analysis" ON public.call_analysis;
CREATE POLICY "Users can update own call analysis" ON public.call_analysis
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own call analysis" ON public.call_analysis;
CREATE POLICY "Users can delete own call analysis" ON public.call_analysis
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- POLICIES - CUSTOMER_AVATARS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own customer avatars" ON public.customer_avatars;
CREATE POLICY "Users can view own customer avatars" ON public.customer_avatars
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own customer avatars" ON public.customer_avatars;
CREATE POLICY "Users can insert own customer avatars" ON public.customer_avatars
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own customer avatars" ON public.customer_avatars;
CREATE POLICY "Users can update own customer avatars" ON public.customer_avatars
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own customer avatars" ON public.customer_avatars;
CREATE POLICY "Users can delete own customer avatars" ON public.customer_avatars
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function pour créer automatiquement un user lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, language)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'language', 'fr')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger pour créer automatiquement un user lors de l'inscription
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers pour updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_integrations_updated_at ON public.integrations;
CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_workflows_updated_at ON public.workflows;
CREATE TRIGGER update_workflows_updated_at
  BEFORE UPDATE ON public.workflows
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_customer_avatars_updated_at ON public.customer_avatars;
CREATE TRIGGER update_customer_avatars_updated_at
  BEFORE UPDATE ON public.customer_avatars
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- INITIAL DATA (Optional)
-- =====================================================

-- Vous pouvez ajouter des données initiales ici si nécessaire
-- Par exemple, des créateurs populaires dans creator_database

-- =====================================================
-- END OF SCHEMA
-- =====================================================

-- Analytics Aggregates Table
CREATE TABLE IF NOT EXISTS analytics_aggregates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  platform TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  engagement INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  calls_generated INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, date, platform)
);

CREATE INDEX idx_analytics_aggregates_user_date ON analytics_aggregates(user_id, date DESC);
CREATE INDEX idx_analytics_aggregates_platform ON analytics_aggregates(platform);

-- Enable RLS
ALTER TABLE analytics_aggregates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analytics_aggregates
CREATE POLICY "Users can view their own analytics"
  ON analytics_aggregates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics"
  ON analytics_aggregates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics"
  ON analytics_aggregates FOR UPDATE
  USING (auth.uid() = user_id);

-- Scheduled Reports Table
CREATE TABLE IF NOT EXISTS scheduled_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'custom')),
  time TIME NOT NULL,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  day_of_month INTEGER CHECK (day_of_month BETWEEN 1 AND 31),
  format TEXT[] NOT NULL,
  content TEXT[] NOT NULL,
  recipients TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_scheduled_reports_user ON scheduled_reports(user_id);
CREATE INDEX idx_scheduled_reports_active ON scheduled_reports(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE scheduled_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scheduled_reports
CREATE POLICY "Users can view their own scheduled reports"
  ON scheduled_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scheduled reports"
  ON scheduled_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled reports"
  ON scheduled_reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled reports"
  ON scheduled_reports FOR DELETE
  USING (auth.uid() = user_id);

-- Content Performance Table (for top content tracking)
CREATE TABLE IF NOT EXISTS content_performance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL,
  content_id TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  views INTEGER DEFAULT 0,
  engagement INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  calls_generated INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  roi DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, platform, content_id)
);

CREATE INDEX idx_content_performance_user ON content_performance(user_id);
CREATE INDEX idx_content_performance_platform ON content_performance(platform);
CREATE INDEX idx_content_performance_roi ON content_performance(roi DESC);

-- Enable RLS
ALTER TABLE content_performance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content_performance
CREATE POLICY "Users can view their own content performance"
  ON content_performance FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own content performance"
  ON content_performance FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content performance"
  ON content_performance FOR UPDATE
  USING (auth.uid() = user_id);

