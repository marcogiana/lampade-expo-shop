import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Necessario per verificare la firma Stripe sul corpo raw della richiesta.
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Webhook non configurato.' }, { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    console.error('[webhook] firma non valida:', err);
    return NextResponse.json({ error: 'Firma non valida' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log('[webhook] Ordine pagato:', {
      id: session.id,
      email: session.customer_details?.email,
      amount: session.amount_total,
    });

    if (process.env.RESEND_API_KEY && process.env.ORDER_NOTIFICATION_EMAIL) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'ordini@eleluci.it',
          to: process.env.ORDER_NOTIFICATION_EMAIL,
          subject: `Nuovo ordine ricevuto — ${session.id}`,
          text: `Cliente: ${session.customer_details?.email || 'n/d'}\nTotale: €${((session.amount_total || 0) / 100).toFixed(2)}\nSession ID: ${session.id}\n\nVedi i dettagli completi nella dashboard Stripe.`,
        });
      } catch (e) {
        console.error('[webhook] invio email notifica fallito:', e);
      }
    }
  }

  return NextResponse.json({ received: true });
}
