import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'
import { updateSubscriptionSchema, cancelSubscriptionSchema } from '@/lib/validations/stripe'
import { getStripePriceId } from '@/lib/stripe/plans'

// Mettre à jour l'abonnement (upgrade/downgrade)
export async function PATCH(request: Request) {
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
    const validation = updateSubscriptionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { newPlanType, newBillingPeriod } = validation.data

    // Récupérer l'abonnement actuel
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (subError || !subscription) {
      return NextResponse.json(
        { error: 'Aucun abonnement trouvé' },
        { status: 404 }
      )
    }

    // Récupérer le nouveau price ID
    const newPriceId = getStripePriceId(newPlanType, newBillingPeriod)

    // Mettre à jour l'abonnement Stripe
    const updatedSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        items: [
          {
            id: (await stripe.subscriptions.retrieve(subscription.stripe_subscription_id)).items.data[0].id,
            price: newPriceId,
          },
        ],
        proration_behavior: 'create_prorations',
        metadata: {
          userId: user.id,
          planType: newPlanType,
          billingPeriod: newBillingPeriod,
        },
      }
    )

    // Mettre à jour dans la base de données
    await supabase
      .from('subscriptions')
      .update({
        plan_type: newPlanType,
        billing_period: newBillingPeriod,
        price_id: newPriceId,
      })
      .eq('user_id', user.id)

    return NextResponse.json({
      message: 'Abonnement mis à jour avec succès',
      subscription: updatedSubscription,
    })
  } catch (error: any) {
    console.error('Error updating subscription:', error)
    return NextResponse.json(
      { error: 'Error updating subscription', details: error.message },
      { status: 500 }
    )
  }
}

// Annuler l'abonnement
export async function DELETE(request: Request) {
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
    const validation = cancelSubscriptionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { immediately, reason } = validation.data

    // Récupérer l'abonnement actuel
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (subError || !subscription) {
      return NextResponse.json(
        { error: 'Aucun abonnement trouvé' },
        { status: 404 }
      )
    }

    // Annuler l'abonnement Stripe
    let canceledSubscription
    if (immediately) {
      // Annulation immédiate
      canceledSubscription = await stripe.subscriptions.cancel(
        subscription.stripe_subscription_id,
        {
          cancellation_details: {
            comment: reason,
          },
        }
      )

      // Mettre à jour dans la base de données
      await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          ended_at: new Date().toISOString(),
          cancel_at_period_end: false,
        })
        .eq('user_id', user.id)
    } else {
      // Annulation à la fin de la période
      canceledSubscription = await stripe.subscriptions.update(
        subscription.stripe_subscription_id,
        {
          cancel_at_period_end: true,
          cancellation_details: {
            comment: reason,
          },
        }
      )

      // Mettre à jour dans la base de données
      await supabase
        .from('subscriptions')
        .update({
          cancel_at_period_end: true,
        })
        .eq('user_id', user.id)
    }

    return NextResponse.json({
      message: immediately
        ? 'Abonnement annulé immédiatement'
        : 'Abonnement annulé à la fin de la période',
      subscription: canceledSubscription,
    })
  } catch (error: any) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json(
      { error: 'Error canceling subscription', details: error.message },
      { status: 500 }
    )
  }
}
