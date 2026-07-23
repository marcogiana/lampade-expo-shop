import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, message, product } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Campi obbligatori mancanti.' }, { status: 400 });
    }

    console.log('[contatti] nuova richiesta:', { name, email, phone, product, message });

    if (process.env.RESEND_API_KEY && process.env.CONTACT_NOTIFICATION_EMAIL) {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      const recipients = process.env.CONTACT_NOTIFICATION_EMAIL.split(',').map((e) => e.trim()).filter(Boolean);
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'sito@eleluci.it',
        to: recipients,
        replyTo: email,
        subject: `Nuovo contatto dal sito — ${name}`,
        text: `Nome: ${name}\nEmail: ${email}\nTelefono: ${phone || 'n/d'}\nProdotto: ${product || 'n/d'}\n\nMessaggio:\n${message}`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[contatti] errore invio:', err);
    return NextResponse.json({ error: 'Errore interno.' }, { status: 500 });
  }
}
