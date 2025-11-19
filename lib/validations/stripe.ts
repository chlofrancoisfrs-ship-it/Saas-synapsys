// =====================================================
// STRIPE VALIDATION SCHEMAS
// =====================================================

import { z } from 'zod'

// =====================================================
// Types de base
// =====================================================

export const billingPeriodSchema = z.enum(['monthly', 'yearly'])
export const planTypeSchema = z.enum(['starter', 'premium'])

// =====================================================
// Créer une session de checkout
// =====================================================

export const createCheckoutSessionSchema = z.object({
  planType: planTypeSchema,
  billingPeriod: billingPeriodSchema,
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
})

export type CreateCheckoutSessionInput = z.infer<typeof createCheckoutSessionSchema>

// =====================================================
// Mettre à jour un abonnement
// =====================================================

export const updateSubscriptionSchema = z.object({
  newPlanType: planTypeSchema,
  newBillingPeriod: billingPeriodSchema,
})

export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>

// =====================================================
// Annuler un abonnement
// =====================================================

export const cancelSubscriptionSchema = z.object({
  immediately: z.boolean().optional().default(false),
  reason: z.string().max(500).optional(),
})

export type CancelSubscriptionInput = z.infer<typeof cancelSubscriptionSchema>

// =====================================================
// Réactiver un abonnement
// =====================================================

export const reactivateSubscriptionSchema = z.object({
  subscriptionId: z.string().min(1),
})

export type ReactivateSubscriptionInput = z.infer<typeof reactivateSubscriptionSchema>

// =====================================================
// Webhook Stripe
// =====================================================

export const stripeWebhookEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({
    object: z.any(),
  }),
  created: z.number(),
})

export type StripeWebhookEvent = z.infer<typeof stripeWebhookEventSchema>

// =====================================================
// Créer un portail client
// =====================================================

export const createPortalSessionSchema = z.object({
  returnUrl: z.string().url().optional(),
})

export type CreatePortalSessionInput = z.infer<typeof createPortalSessionSchema>

// =====================================================
// Obtenir l'historique de facturation
// =====================================================

export const getInvoicesSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(10),
  startingAfter: z.string().optional(),
})

export type GetInvoicesInput = z.infer<typeof getInvoicesSchema>

// =====================================================
// Webhooks supportés
// =====================================================

export const SUPPORTED_WEBHOOK_EVENTS = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'customer.subscription.trial_will_end',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
] as const

export type SupportedWebhookEvent = typeof SUPPORTED_WEBHOOK_EVENTS[number]
