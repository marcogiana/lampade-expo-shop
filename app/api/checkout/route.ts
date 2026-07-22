import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAllProducts } from '@/lib/products';

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Pagamenti non configurati: manca STRIPE_SECRET_KEY nelle variabili d\'ambiente.' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const body = await req.json();
    const cartItems: { slug: string; qty: number }[] = body.items || [];

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: 'Il carrello è vuoto.' }, { status: 400 });
    }

    // Non ci fidiamo dei prezzi mandati dal client: li ricalcoliamo dal catalogo.
    const catalog = await getAllProducts();
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const ci of cartItems) {
      const product = catalog.find((p) => p.slug === ci.slug);
      if (!product) continue;
      const qty = Math.max(1, Math.min(10, Number(ci.qty) || 1));
      lineItems.push({
        quantity: qty,
        price_data: {
          currency: 'eur',
          unit_amount: Math.round(product.price * 100),
          product_data: {
            name: `${product.brand} — ${product.model}`,
            description: product.code ? `Codice: ${product.code}` : undefined,
          },
        },
      });
    }

    if (lineItems.length === 0) {
      return NextResponse.json({ error: 'Nessun prodotto valido nel carrello.' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || process.env.SITE_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      shipping_address_collection: { allowed_countries: ['IT', 'FR', 'CH', 'AT', 'DE'] },
      success_url: `${origin}/ordine/successo?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/carrello`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('[checkout] errore:', err);
    return NextResponse.json({ error: 'Errore durante la creazione del pagamento. Riprova.' }, { status: 500 });
  }
}
