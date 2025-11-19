# Synapsys - Plateforme SaaS pour Infopreneurs

Synapsys est une plateforme SaaS conçue pour les infopreneurs qui vendent des formations en ligne. Elle centralise toutes vos données business et optimise votre temps pour générer du cash.

## Problème résolu

Centralisez toutes les données business et optimisez le temps pour générer du cash.

## Stack technique

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: API Routes Next.js + Supabase
- **Base de données**: PostgreSQL (Supabase)
- **Authentification**: Supabase Auth (email/password + Google OAuth)
- **Paiement**: Stripe (abonnements récurrents)
- **Workflows**: N8N (auto-connecté pour chaque utilisateur)
- **Email**: Resend
- **Langues**: Français + Anglais (sélection à l'inscription)

## Couleurs de la marque

- **Primaire**: Bleu (#2563EB)
- **Secondaire**: Blanc (#FFFFFF)
- **Accent**: Bleu clair (#60A5FA)
- **Arrière-plan**: Gris clair (#F9FAFB)
- **Texte**: Gris foncé (#111827)

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- Node.js 18+ et npm
- Un compte Supabase
- Un compte Stripe
- Un compte Resend
- Une instance N8N (optionnel)

## Installation

1. **Cloner le projet**

```bash
git clone <repository-url>
cd synapsys
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configurer les variables d'environnement**

Créez un fichier `.env` à la racine du projet et copiez le contenu de `.env.example` :

```bash
cp .env.example .env
```

Puis remplissez les variables d'environnement avec vos clés :

```env
# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# N8N
N8N_API_URL=your_n8n_api_url
N8N_API_KEY=your_n8n_api_key

# Resend
RESEND_API_KEY=your_resend_api_key
```

## Configuration Supabase

### 1. Créer un projet Supabase

Rendez-vous sur [Supabase](https://supabase.com) et créez un nouveau projet.

### 2. Créer les tables

Exécutez les migrations SQL suivantes dans l'éditeur SQL de Supabase :

```sql
-- Table users
CREATE TABLE users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  language TEXT DEFAULT 'fr' CHECK (language IN ('fr', 'en')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table subscriptions
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  price_id TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  cancel_at TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE
);

-- Table integrations
CREATE TABLE integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  credentials JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table workflows
CREATE TABLE workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  n8n_workflow_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

-- Policies for users
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Policies for subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Policies for integrations
CREATE POLICY "Users can view own integrations" ON integrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own integrations" ON integrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integrations" ON integrations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own integrations" ON integrations
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for workflows
CREATE POLICY "Users can view own workflows" ON workflows
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workflows" ON workflows
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workflows" ON workflows
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workflows" ON workflows
  FOR DELETE USING (auth.uid() = user_id);
```

### 3. Configurer l'authentification Google OAuth

1. Allez dans **Authentication** > **Providers** dans Supabase
2. Activez Google et configurez vos credentials OAuth

## Configuration Stripe

1. Créez un compte sur [Stripe](https://stripe.com)
2. Récupérez vos clés API dans **Developers** > **API keys**
3. Configurez les webhooks :
   - URL : `https://votre-domaine.com/api/stripe/webhook`
   - Événements à écouter : `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

## Configuration Resend

1. Créez un compte sur [Resend](https://resend.com)
2. Récupérez votre clé API dans les paramètres

## Lancer le projet

### Mode développement

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

### Build de production

```bash
npm run build
npm start
```

## Architecture du projet

```
synapsys/
├── app/
│   ├── (auth)/              # Pages d'authentification
│   │   ├── login/
│   │   ├── signup/
│   │   └── reset-password/
│   ├── (dashboard)/         # Pages du dashboard
│   │   ├── dashboard/
│   │   ├── workflows/
│   │   ├── analytics/
│   │   ├── integrations/
│   │   ├── settings/
│   │   └── help/
│   ├── api/                 # Routes API
│   │   ├── auth/
│   │   └── stripe/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                  # Composants shadcn/ui
│   └── dashboard/           # Composants du dashboard
├── lib/
│   ├── supabase/           # Configuration Supabase
│   ├── stripe/             # Configuration Stripe
│   └── utils.ts
├── types/
│   └── database.types.ts   # Types TypeScript pour la BDD
└── public/
```

## Fonctionnalités

### Authentification
- Connexion par email/mot de passe
- Connexion via Google OAuth
- Réinitialisation de mot de passe
- Sélection de langue (FR/EN)

### Dashboard
- Aperçu des statistiques business
- Graphiques de revenus
- Activité récente

### Workflows
- Création de workflows automatisés avec N8N
- Gestion des workflows actifs

### Analytics
- Visualisation des revenus
- Taux de conversion
- Engagement des étudiants
- KPIs

### Intégrations
- Connexion à Stripe
- Connexion à N8N
- Connexion à Resend
- Autres intégrations tierces

### Paramètres
- Gestion du profil
- Gestion de l'abonnement
- Préférences de notifications
- Paramètres de sécurité

## Scripts disponibles

- `npm run dev` - Lance le serveur de développement
- `npm run build` - Crée un build de production
- `npm start` - Lance le serveur de production
- `npm run lint` - Vérifie le code avec ESLint

## Support

Pour toute question ou problème, contactez-nous à support@synapsys.com

## Licence

Propriétaire - Tous droits réservés
