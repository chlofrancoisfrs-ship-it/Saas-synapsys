# Workflows System - Remaining Implementation

## ✅ Completed

1. **lib/workflows/workflows.ts** - Configuration des 11 workflows
2. **lib/n8n/client.ts** - Client N8N pour intégration API
3. **components/workflows/WorkflowCard.tsx** - Composant carte workflow

## 🔨 À Compléter

### 1. Components (components/workflows/)

#### ConfigurationModal.tsx
```typescript
// Modal de configuration avec formulaire dynamique selon le workflow
// - Gère tous les types de champs (text, number, select, multiselect, slider, etc.)
// - Validation avec Zod
// - Sauvegarde configuration dans Supabase
```

#### WorkflowStats.tsx
```typescript
// Affichage des statistiques spécifiques par workflow
// - Props: workflowType, stats
// - Rendu conditionnel selon type
```

#### ExecutionHistory.tsx  
```typescript
// Tableau historique des exécutions
// - Liste des 10 dernières runs
// - Status, date, durée
// - Lien vers rapport
```

#### ReportViewer.tsx
```typescript
// Affichage rapport formaté selon type de workflow
// - Switch/case sur workflowType
// - Rendu spécifique pour chaque workflow
// - Graphiques avec Recharts
// - Export PDF
```

### 2. Pages

#### app/(dashboard)/workflows/page.tsx
```typescript
// Page principale workflows
// - Header avec stats globales
// - Filtres (actifs/inactifs, plan, search)
// - Grid de WorkflowCards (2 cols desktop, 1 mobile)
// - First-time banner avec suggestions
// - Confetti animation première activation
```

#### app/(dashboard)/workflows/[workflow_id]/report/page.tsx
```typescript
// Page détail rapport
// - Dynamic route avec workflow_id
// - Récupère dernier rapport depuis workflow_runs
// - Affiche ReportViewer
// - Bouton export PDF
// - Bouton re-exécuter
```

### 3. API Routes

#### /api/workflows/all/route.ts
```typescript
// GET - Liste tous les workflows pour l'user
// - Filtre par plan (starter vs premium)
// - Join avec workflow_runs pour lastRun
// - Retourne config, status, stats
```

#### /api/workflows/[workflow_id]/route.ts
```typescript
// GET - Détails workflow spécifique
// - Historique 10 dernières exécutions
// - Config actuelle
```

#### /api/workflows/[workflow_id]/activate/route.ts
```typescript
// POST - Active workflow
// - Vérifie plan user
// - Vérifie intégrations requises connectées
// - Update is_active = true
// - Webhook N8N pour activer
```

#### /api/workflows/[workflow_id]/deactivate/route.ts
```typescript
// POST - Désactive workflow
// - Update is_active = false
// - Webhook N8N pour désactiver
```

#### /api/workflows/[workflow_id]/configure/route.ts
```typescript
// POST - Sauvegarde configuration
// - Validation config selon workflow type
// - Update workflows.config (JSONB)
// - Si actif : webhook N8N update
```

#### /api/workflows/[workflow_id]/execute/route.ts
```typescript
// POST - Exécution immédiate
// - Vérifie workflow permet on-demand
// - Rate limiting (max 10/heure)
// - Webhook N8N trigger
// - Retourne execution_id
```

#### /api/workflows/[workflow_id]/callback/route.ts
```typescript
// POST - Reçoit résultats N8N
// - Vérifie signature webhook
// - Créer workflow_run
// - Stocker result (JSONB)
// - Créer notification
// - Envoyer email si configuré
```

#### /api/workflows/[workflow_id]/report/route.ts
```typescript
// GET - Récupère dernier rapport
// - Query workflow_runs
// - Retourne result formaté
```

### 4. Helpers & Utils

#### lib/workflows/helpers.ts
```typescript
// Fonctions utilitaires
export function validateWorkflowConfig(workflowType, config)
export function canUserActivateWorkflow(userPlan, workflowType, activeCount)
export function getDefaultConfig(workflowType)
export function formatWorkflowResult(workflowType, result)
```

#### lib/workflows/notifications.ts
```typescript
// Gestion notifications workflow
export async function sendWorkflowNotification(userId, workflowId, status, result)
export async function sendWorkflowEmail(userId, workflowType, reportUrl)
```

### 5. UI Components manquants

Vérifier que ces composants shadcn/ui sont installés:
- [x] Switch
- [ ] Slider (pour les config sliders)

### 6. Environment Variables

Ajouter à .env.local:
```env
# N8N Integration
N8N_API_URL=https://your-n8n-instance.com
N8N_API_KEY=your_api_key
SYNAPSYS_WEBHOOK_SECRET=your_webhook_secret

# App URL pour callbacks
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 7. Database Migrations

Table `workflow_runs` existe déjà dans schema. Vérifier qu'elle a:
- result JSONB pour stocker rapports
- duration INTEGER pour temps exécution
- error_message TEXT

### 8. N8N Workflows Templates

Pour chaque workflow, créer template N8N:
1. creator_insights.json
2. youtube_conversion.json
3. time_to_cash.json
4. performance_tracking.json
5. call_analysis.json
6. whatsapp_onboarding.json
7. follow_up.json
8. content_repurposing.json
9. lead_scoring.json
10. revenue_attribution.json
11. telegram_poster.json

Structure type:
- Webhook Start (activation)
- Schedule Trigger (cron)
- HTTP Request (fetch données APIs)
- Code/Function (logique analyse)
- Webhook Response (callback Synapsys)

### 9. Tests

Pour chaque workflow:
- [ ] Test activation
- [ ] Test configuration
- [ ] Test exécution
- [ ] Test callback
- [ ] Test rapport
- [ ] Test restrictions plan
- [ ] Test notifications

### 10. Documentation

Créer docs/workflows.md:
- Guide utilisateur par workflow
- Exemples de configuration
- Interprétation des rapports
- FAQ

## Ordre de développement recommandé

1. Terminer composants (ConfigurationModal, ReportViewer, etc.)
2. Créer page principale /workflows
3. Créer routes API (all, activate, deactivate, configure)
4. Créer page /workflows/[id]/report
5. Créer route API callback
6. Tester avec mock data
7. Créer templates N8N
8. Tests end-to-end

## Estimations

- Components: 4-6h
- Pages: 3-4h  
- API Routes: 5-6h
- N8N Templates: 8-10h (1h/workflow)
- Tests & Debug: 4-5h

**Total: ~25-30h**
