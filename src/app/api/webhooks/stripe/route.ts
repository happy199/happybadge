import { NextRequest, NextResponse } from 'next/server'
import { StripeService } from '@/lib/stripe'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Signature manquante' }, { status: 400 })
    }

    // Vérifier la signature du webhook
    const event = await StripeService.handleWebhook(body, signature)

    // Traiter l'événement
    await StripeService.processWebhookEvent(event)

    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Mettre à jour la base de données selon le type d'événement
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object, supabase)
        break
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object, supabase)
        break
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object, supabase)
        break
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object, supabase)
        break
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object, supabase)
        break
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object, supabase)
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Erreur webhook Stripe:', error)
    return NextResponse.json(
      { error: 'Erreur webhook' },
      { status: 400 }
    )
  }
}

async function handleCheckoutCompleted(session: any, supabase: any) {
  const customerEmail = session.customer_email
  const subscriptionId = session.subscription

  if (customerEmail && subscriptionId) {
    // Mettre à jour le plan de l'utilisateur
    await supabase
      .from('users')
      .update({ plan: 'pro' })
      .eq('email', customerEmail)
  }
}

async function handleSubscriptionCreated(subscription: any, supabase: any) {
  const customerId = subscription.customer
  const subscriptionId = subscription.id

  // Récupérer l'utilisateur par customer ID
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('stripe_customer_id', customerId)
    .single()

  if (user) {
    // Mettre à jour le plan de l'utilisateur
    await supabase
      .from('users')
      .update({ 
        plan: 'pro',
        stripe_subscription_id: subscriptionId,
      })
      .eq('id', user.id)
  }
}

async function handleSubscriptionUpdated(subscription: any, supabase: any) {
  const subscriptionId = subscription.id
  const status = subscription.status

  // Mettre à jour le statut de l'abonnement
  await supabase
    .from('users')
    .update({ 
      subscription_status: status,
    })
    .eq('stripe_subscription_id', subscriptionId)
}

async function handleSubscriptionDeleted(subscription: any, supabase: any) {
  const subscriptionId = subscription.id

  // Rétrograder l'utilisateur vers le plan gratuit
  await supabase
    .from('users')
    .update({ 
      plan: 'free',
      subscription_status: 'cancelled',
    })
    .eq('stripe_subscription_id', subscriptionId)
}

async function handlePaymentSucceeded(invoice: any, supabase: any) {
  const customerId = invoice.customer
  const amount = invoice.amount_paid

  // Enregistrer le paiement réussi
  await supabase
    .from('payments')
    .insert({
      customer_id: customerId,
      amount: amount / 100, // Convertir de centimes en euros
      currency: invoice.currency,
      status: 'succeeded',
      invoice_id: invoice.id,
    })
}

async function handlePaymentFailed(invoice: any, supabase: any) {
  const customerId = invoice.customer
  const amount = invoice.amount_due

  // Enregistrer l'échec de paiement
  await supabase
    .from('payments')
    .insert({
      customer_id: customerId,
      amount: amount / 100,
      currency: invoice.currency,
      status: 'failed',
      invoice_id: invoice.id,
    })
}

