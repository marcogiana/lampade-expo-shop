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

    // Nelle versioni recenti dell'API Stripe, l'indirizzo di spedizione si trova
    // in collected_information.shipping_details (in passato era shipping_details
    // direttamente sulla sessione).
    const shipping = (session as any).collected_information?.shipping_details as
      | { name?: string; address?: Stripe.Address }
      | undefined;

    const buyerName = shipping?.name || session.customer_details?.name || 'n/d';
    const buyerEmail = session.customer_details?.email || 'n/d';
    const buyerPhone = session.customer_details?.phone || 'n/d';
    const shippingAddress = shipping?.address
      ? [
          shipping.address.line1,
          shipping.address.line2,
          shipping.address.postal_code,
          shipping.address.city,
          shipping.address.state,
          shipping.address.country,
        ]
          .filter(Boolean)
          .join(', ')
      : null;

    let productsText = 'Non disponibile';
    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
      if (lineItems.data.length > 0) {
        productsText = lineItems.data
          .map((li) => `- ${li.description} × ${li.quantity} — €${((li.amount_total || 0) / 100).toFixed(2)}`)
          .join('\n');
      }
    } catch (e) {
      console.error('[webhook] impossibile recuperare i prodotti acquistati:', e);
    }

    console.log('[webhook] Ordine pagato:', {
      id: session.id,
      email: buyerEmail,
      amount: session.amount_total,
    });

    if (process.env.RESEND_API_KEY && process.env.ORDER_NOTIFICATION_EMAIL) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        const recipients = process.env.ORDER_NOTIFICATION_EMAIL.split(',').map((e) => e.trim()).filter(Boolean);
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'ordini@eleluci.it',
          to: recipients,
          subject: `Nuovo ordine ricevuto — ${buyerName}`,
          text: `PRODOTTI ACQUISTATI:\n${productsText}\n\nTOTALE: €${((session.amount_total || 0) / 100).toFixed(2)}\n\nDATI ACQUIRENTE:\nNome: ${buyerName}\nEmail: ${buyerEmail}\nTelefono: ${buyerPhone}\nIndirizzo di spedizione: ${shippingAddress || 'n/d'}\n\nSession ID: ${session.id}\n\nRicorda: per segnare la lampada come venduta, cancella il valore nella colonna "PREZZO SCONTANTO EXPO" della relativa riga sul Google Sheet — sparirà automaticamente dal sito entro pochi minuti.`,
        });
      } catch (e) {
        console.error('[webhook] invio email notifica fallito:', e);
      }
    }
  }

  return NextResponse.json({ received: true });
}
