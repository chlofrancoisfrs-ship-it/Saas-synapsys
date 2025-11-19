import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'
import { createCheckoutSessionSchema } from '@/lib/validations/stripe'
import { getStripePriceId, PLANS } from '@/lib/stripe/plans'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Valider les données
    const body = await request.json()
    const validation = createCheckoutSessionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { planType, billingPeriod, successUrl, cancelUrl } = validation.data

    // Récupérer le price ID Stripe
    const priceId = getStripePriceId(planType, billingPeriod)
    const plan = PLANS[planType]

    // Vérifier si l'utilisateur a déjà un abonnement
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (existingSubscription && ['active', 'trialing'].includes(existingSubscription.status)) {
      return NextResponse.json(
        { error: 'Vous avez déjà un abonnement actif' },
        { status: 400 }
      )
    }

    // Créer la session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: plan.trialDays,
        metadata: {
          userId: user.id,
          planType: planType,
          billingPeriod: billingPeriod,
        },
      },
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
        planType: planType,
        billingPeriod: billingPeriod,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    })

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Error creating checkout session', details: error.message },
      { status: 500 }
    )
  }
}
