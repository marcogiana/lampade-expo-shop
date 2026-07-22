'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/components/CartContext';
import { formatEuro } from '@/lib/format';

export default function CarrelloPage() {
  const { items, removeItem, setQty, total } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items.map(({ slug, qty }) => ({ slug, qty })) }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Errore durante la creazione del pagamento');
      window.location.href = data.url;
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-24 text-center">
        <h1 className="font-display text-2xl italic text-paper">Il carrello è vuoto</h1>
        <p className="mt-3 text-sm text-muted">Sfoglia il catalogo per trovare la lampada giusta.</p>
        <Link href="/" className="mt-6 inline-block rounded-full bg-brass px-6 py-3 text-sm font-medium text-ink">
          Torna al catalogo
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="mb-8 font-display text-3xl italic text-paper">Il tuo carrello</h1>
      <ul className="divide-y divide-white/10 border-y border-white/10">
        {items.map((item) => (
          <li key={item.slug} className="flex items-center justify-between gap-4 py-5">
            <div>
              <p className="font-mono text-xs uppercase tracking-wide text-brass">{item.brand}</p>
              <Link href={`/prodotti/${item.slug}`} className="text-paper hover:underline">
                {item.model}
              </Link>
              <div className="mt-2 flex items-center gap-2">
                <button
                  className="h-7 w-7 rounded border border-white/15 text-sm text-muted hover:text-paper"
                  onClick={() => setQty(item.slug, item.qty - 1)}
                >
                  −
                </button>
                <span className="w-6 text-center font-mono">{item.qty}</span>
                <button
                  className="h-7 w-7 rounded border border-white/15 text-sm text-muted hover:text-paper"
                  onClick={() => setQty(item.slug, item.qty + 1)}
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="font-mono text-paper">{formatEuro(item.price * item.qty)}</span>
              <button onClick={() => removeItem(item.slug)} className="text-xs text-muted hover:text-ember">
                rimuovi
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex items-center justify-between">
        <span className="text-muted">Totale</span>
        <span className="font-mono text-2xl text-paper">{formatEuro(total)}</span>
      </div>

      {error && <p className="mt-4 text-sm text-ember">{error}</p>}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="flex-1 rounded-full bg-brass py-3 text-sm font-medium text-ink transition hover:bg-brass-bright disabled:opacity-60"
        >
          {loading ? 'Reindirizzamento…' : 'Vai al pagamento'}
        </button>
        <Link
          href="/contatti"
          className="flex-1 rounded-full border border-white/15 py-3 text-center text-sm text-paper transition hover:border-brass hover:text-brass"
        >
          Contattaci prima di acquistare
        </Link>
      </div>
    </main>
  );
}
