import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'
import { getInvoicesSchema } from '@/lib/validations/stripe'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit')
    const startingAfter = searchParams.get('startingAfter')

    // Valider les paramètres
    const validation = getInvoicesSchema.safeParse({
      limit: limit ? parseInt(limit) : undefined,
      startingAfter: startingAfter || undefined,
    })

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      )
    }

    // Récupérer l'abonnement de l'utilisateur
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (subError || !subscription) {
      return NextResponse.json(
        { error: 'Aucun abonnement trouvé' },
        { status: 404 }
      )
    }

    // Récupérer les factures depuis Stripe
    const invoices = await stripe.invoices.list({
      customer: subscription.stripe_customer_id,
      limit: validation.data.limit,
      starting_after: validation.data.startingAfter,
    })

    return NextResponse.json({
      invoices: invoices.data,
      hasMore: invoices.has_more,
    })
  } catch (error: any) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Error fetching invoices', details: error.message },
      { status: 500 }
    )
  }
}
