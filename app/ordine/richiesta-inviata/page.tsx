import Link from 'next/link';

export default function RichiestaInviataPage() {
  return (
    <main className="mx-auto max-w-lg px-5 py-28 text-center">
      <span
        className="glow-dot mx-auto mb-6 block h-3 w-3 rounded-full bg-brass"
        style={{ boxShadow: '0 0 24px 6px rgba(228,192,126,0.6)' }}
      />
      <h1 className="font-display text-3xl italic text-paper">Richiesta inviata</h1>
      <p className="mt-4 text-sm text-muted">
        Grazie! Abbiamo ricevuto la tua richiesta d&apos;ordine e ti abbiamo scritto una email di conferma. Ti
        ricontatteremo a breve per confermare la disponibilità, la spedizione e il pagamento. Nessun importo è stato
        addebitato.
      </p>
      <Link href="/" className="mt-8 inline-block rounded-full bg-brass px-6 py-3 text-sm font-medium text-ink">
        Torna al catalogo
      </Link>
    </main>
  );
}
