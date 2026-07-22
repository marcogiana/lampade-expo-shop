'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from './CartContext';
import { formatEuro } from '@/lib/format';

export default function CartDrawer() {
  const { items, isOpen, close, removeItem, setQty, total } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items.map(({ slug, fullName, price, qty }) => ({ slug, fullName, price, qty })) }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Errore durante la creazione del pagamento');
      window.location.href = data.url;
    } catch (e: any) {
      setError(e.message || 'Qualcosa è andato storto. Riprova.');
      setLoading(false);
    }
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/60 transition-opacity ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={close}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-surface transition-transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <h2 className="font-display text-lg italic text-paper">Il tuo carrello</h2>
          <button onClick={close} aria-label="Chiudi carrello" className="text-muted hover:text-paper">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {items.length === 0 ? (
            <p className="text-sm text-muted">Il carrello è vuoto. Sfoglia il catalogo per trovare il pezzo giusto.</p>
          ) : (
            <ul className="space-y-5">
              {items.map((item) => (
                <li key={item.slug} className="flex items-start justify-between gap-3 border-b border-white/5 pb-4">
                  <div className="min-w-0">
                    <p className="truncate text-xs uppercase tracking-wide text-brass">{item.brand}</p>
                    <Link href={`/prodotti/${item.slug}`} onClick={close} className="text-sm text-paper hover:underline">
                      {item.model}
                    </Link>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        className="h-6 w-6 rounded border border-white/15 text-xs text-muted hover:text-paper"
                        onClick={() => setQty(item.slug, item.qty - 1)}
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-mono text-sm">{item.qty}</span>
                      <button
                        className="h-6 w-6 rounded border border-white/15 text-xs text-muted hover:text-paper"
                        onClick={() => setQty(item.slug, item.qty + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-mono text-sm text-paper">{formatEuro(item.price * item.qty)}</span>
                    <button onClick={() => removeItem(item.slug)} className="text-xs text-muted hover:text-ember">
                      rimuovi
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-white/10 px-6 py-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-muted">Totale</span>
              <span className="font-mono text-lg text-paper">{formatEuro(total)}</span>
            </div>
            {error && <p className="mb-3 text-xs text-ember">{error}</p>}
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full rounded-full bg-brass py-3 text-sm font-medium text-ink transition hover:bg-brass-bright disabled:opacity-60"
            >
              {loading ? 'Reindirizzamento…' : 'Vai al pagamento'}
            </button>
            <Link
              href="/contatti"
              onClick={close}
              className="mt-3 block text-center text-xs text-muted hover:text-paper"
            >
              Preferisci essere ricontattato prima di acquistare? Scrivici
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
