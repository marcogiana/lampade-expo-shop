'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useCart } from '@/components/CartContext';

export default function OrdineSuccessoPage() {
  const { clear } = useCart();

  useEffect(() => {
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="mx-auto max-w-lg px-5 py-28 text-center">
      <span className="glow-dot mx-auto mb-6 block h-3 w-3 rounded-full bg-brass" style={{ boxShadow: '0 0 24px 6px rgba(228,192,126,0.6)' }} />
      <h1 className="font-display text-3xl italic text-paper">Ordine confermato</h1>
      <p className="mt-4 text-sm text-muted">
        Grazie! Abbiamo ricevuto il pagamento. Ti contatteremo a breve per organizzare la consegna o il ritiro.
      </p>
      <Link href="/" className="mt-8 inline-block rounded-full bg-brass px-6 py-3 text-sm font-medium text-ink">
        Torna al catalogo
      </Link>
    </main>
  );
}
