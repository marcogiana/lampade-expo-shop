import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts } from '@/lib/products';
import { formatEuro } from '@/lib/format';

type Body = {
  items?: { slug: string; qty: number }[];
  customerType?: 'privato' | 'azienda';
  name?: string; // nome e cognome (privato) o ragione sociale (azienda)
  contactName?: string; // referente (solo azienda)
  email?: string;
  phone?: string;
  fiscalCode?: string;
  vatNumber?: string;
  sdiCode?: string;
  pec?: string;
  address?: string;
  zip?: string;
  city?: string;
  province?: string;
  shippingRequested?: boolean;
  shippingDifferent?: boolean;
  shippingAddress?: string;
  shippingZip?: string;
  shippingCity?: string;
  shippingProvince?: string;
  notes?: string;
  privacy?: boolean;
  website?: string; // honeypot anti-spam: deve restare vuoto
};

const s = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;

    // Honeypot: i bot compilano il campo nascosto. Rispondiamo "ok" senza fare nulla.
    if (s(body.website)) return NextResponse.json({ ok: true });

    const customerType = body.customerType === 'azienda' ? 'azienda' : 'privato';
    const name = s(body.name);
    const contactName = s(body.contactName);
    const email = s(body.email);
    const phone = s(body.phone, 40);
    const fiscalCode = s(body.fiscalCode, 16).toUpperCase().replace(/\s+/g, '');
    const vatNumber = s(body.vatNumber, 20).replace(/\D/g, '');
    const sdiCode = s(body.sdiCode, 7).toUpperCase().replace(/\s+/g, '');
    const pec = s(body.pec);
    const address = s(body.address);
    const zip = s(body.zip, 10);
    const city = s(body.city);
    const province = s(body.province, 3).toUpperCase();
    const shippingRequested = !!body.shippingRequested;
    const shippingDifferent = shippingRequested && !!body.shippingDifferent;
    const shippingAddress = s(body.shippingAddress);
    const shippingZip = s(body.shippingZip, 10);
    const shippingCity = s(body.shippingCity);
    const shippingProvince = s(body.shippingProvince, 3).toUpperCase();
    const notes = s(body.notes, 2000);

    // --- Validazione ---
    const errors: string[] = [];
    if (!name) errors.push(customerType === 'azienda' ? 'Ragione sociale mancante.' : 'Nome e cognome mancanti.');
    if (!/^\S+@\S+\.\S+$/.test(email)) errors.push('Email non valida.');
    if (phone.replace(/\D/g, '').length < 6) errors.push('Telefono mancante.');
    if (!address || !zip || !city || !province) errors.push('Indirizzo di fatturazione incompleto.');
    if (customerType === 'privato') {
      if (!/^[A-Z0-9]{16}$/.test(fiscalCode)) errors.push('Codice fiscale non valido (16 caratteri).');
    } else {
      if (!/^\d{11}$/.test(vatNumber)) errors.push('Partita IVA non valida (11 cifre).');
      if (!sdiCode && !pec) errors.push('Inserisci il codice destinatario (SDI) o la PEC.');
    }
    if (shippingDifferent && (!shippingAddress || !shippingZip || !shippingCity || !shippingProvince)) {
      errors.push('Indirizzo di spedizione incompleto.');
    }
    if (!body.privacy) errors.push('Devi accettare l\'informativa privacy.');
    if (errors.length) return NextResponse.json({ error: errors[0], errors }, { status: 400 });

    // --- Carrello: prezzi e disponibilità riletti dal catalogo, mai dal client ---
    const cartItems = Array.isArray(body.items) ? body.items : [];
    if (cartItems.length === 0) return NextResponse.json({ error: 'Il carrello è vuoto.' }, { status: 400 });

    const catalog = await getAllProducts();
    const lines: { fullName: string; qty: number; unit: number; stock: number | null }[] = [];
    for (const ci of cartItems) {
      const p = catalog.find((x) => x.slug === ci.slug);
      if (!p) continue;
      let qty = Math.max(1, Math.min(10, Math.floor(Number(ci.qty)) || 1));
      if (typeof p.stock === 'number' && p.stock > 0) qty = Math.min(qty, p.stock);
      lines.push({ fullName: p.fullName, qty, unit: p.price, stock: typeof p.stock === 'number' ? p.stock : null });
    }
    if (lines.length === 0) {
      return NextResponse.json(
        { error: 'I prodotti nel carrello non sono più disponibili. Aggiorna il carrello e riprova.' },
        { status: 400 }
      );
    }
    const total = lines.reduce((sum, l) => sum + l.unit * l.qty, 0);

    // --- Email ---
    const apiKey = process.env.RESEND_API_KEY;
    const recipients = (process.env.CONTACT_NOTIFICATION_EMAIL || process.env.ORDER_NOTIFICATION_EMAIL || '')
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);
    if (!apiKey || recipients.length === 0) {
      console.error('[order-request] Resend non configurato: mancano RESEND_API_KEY o CONTACT_NOTIFICATION_EMAIL');
      return NextResponse.json({ error: 'Invio non disponibile al momento. Scrivici dalla pagina Contatti.' }, { status: 500 });
    }

    const linesText = lines
      .map(
        (l) =>
          `• ${l.fullName} — ${l.qty} × ${formatEuro(l.unit)} = ${formatEuro(l.unit * l.qty)}` +
          (l.stock !== null ? `  (pezzi a magazzino: ${l.stock})` : '')
      )
      .join('\n');

    const invoiceText = [
      `Tipo cliente: ${customerType === 'azienda' ? 'Azienda / professionista' : 'Privato'}`,
      `${customerType === 'azienda' ? 'Ragione sociale' : 'Nome e cognome'}: ${name}`,
      customerType === 'azienda' && contactName ? `Referente: ${contactName}` : '',
      customerType === 'azienda' ? `Partita IVA: ${vatNumber}` : '',
      fiscalCode ? `Codice fiscale: ${fiscalCode}` : '',
      customerType === 'azienda' ? `Codice destinatario (SDI): ${sdiCode || 'n/d'}` : '',
      customerType === 'azienda' ? `PEC: ${pec || 'n/d'}` : '',
      `Indirizzo di fatturazione: ${address}, ${zip} ${city} (${province})`,
    ]
      .filter(Boolean)
      .join('\n');

    const shippingText = !shippingRequested
      ? 'NON richiesta (ritiro in showroom)'
      : shippingDifferent
        ? `Richiesta (costi da comunicare) — ${shippingAddress}, ${shippingZip} ${shippingCity} (${shippingProvince})`
        : 'Richiesta (costi da comunicare) — stesso indirizzo di fatturazione';

    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);
    const from = process.env.RESEND_FROM_EMAIL || 'ordini@eleluci.it';

    const { error: sendError } = await resend.emails.send({
      from,
      to: recipients,
      replyTo: email,
      subject: `Richiesta d'ordine dal sito — ${name} — ${formatEuro(total)}`,
      text: [
        `Nuova richiesta d'ordine da outlet.eleluci.it (nessun pagamento effettuato: da concordare col cliente).`,
        '',
        'PRODOTTI',
        linesText,
        `TOTALE (IVA inclusa, spedizione esclusa): ${formatEuro(total)}`,
        '',
        'DATI PER LA FATTURA',
        invoiceText,
        '',
        'CONTATTI',
        `Email: ${email}`,
        `Telefono: ${phone}`,
        '',
        'SPEDIZIONE',
        shippingText,
        '',
        'NOTE DEL CLIENTE',
        notes || '—',
        '',
        '—',
        'Promemoria: quando la vendita è confermata, nel Google Sheet metti i pezzi a 0 (colonna DISPONIBILITA\') oppure svuota il prezzo EXPO, così la lampada sparisce dal sito.',
      ].join('\n'),
    });
    if (sendError) {
      console.error('[order-request] errore Resend:', sendError);
      return NextResponse.json({ error: 'Invio non riuscito. Riprova o scrivici dalla pagina Contatti.' }, { status: 500 });
    }

    // Copia di conferma al cliente (se fallisce, la richiesta è comunque arrivata a noi).
    try {
      await resend.emails.send({
        from,
        to: [email],
        replyTo: recipients,
        subject: 'Abbiamo ricevuto la tua richiesta — Studio Luce',
        text: [
          `Ciao ${customerType === 'azienda' && contactName ? contactName : name},`,
          '',
          'abbiamo ricevuto la tua richiesta d\'ordine. Ti ricontatteremo al più presto per confermare la disponibilità, la spedizione e il pagamento. Fino ad allora non è stato addebitato nulla.',
          ...(shippingRequested ? ['', 'Hai richiesto la spedizione: i relativi costi saranno applicati e te li comunicheremo prima della conferma.'] : []),
          '',
          'Riepilogo:',
          linesText,
          `Totale (IVA inclusa, spedizione esclusa): ${formatEuro(total)}`,
          '',
          'Studio Luce',
        ].join('\n'),
      });
    } catch (e) {
      console.warn('[order-request] conferma al cliente non inviata:', e);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[order-request] errore:', err);
    return NextResponse.json({ error: 'Errore interno. Riprova.' }, { status: 500 });
  }
}
