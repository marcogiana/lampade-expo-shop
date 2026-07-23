'use client';

import { useState, FormEvent } from 'react';

export default function ContattiPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    setStatus('loading');
    const form = new FormData(formEl);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          phone: form.get('phone'),
          message: form.get('message'),
          product: form.get('product'),
        }),
      });
      if (!res.ok) throw new Error();
      setStatus('ok');
      formEl.reset();
    } catch {
      setStatus('error');
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-16">
      <h1 className="font-display text-3xl italic text-paper">Contattaci</h1>
      <p className="mt-3 text-sm text-muted">
        Vuoi sapere di più su un pezzo, chiedere una foto aggiuntiva o organizzare il ritiro? Scrivici, ti rispondiamo
        di persona.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs text-muted" htmlFor="name">Nome e cognome</label>
            <input required id="name" name="name" className="w-full rounded-lg border border-white/15 bg-surface px-3 py-2.5 text-paper outline-none focus:border-brass" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted" htmlFor="email">Email</label>
            <input required type="email" id="email" name="email" className="w-full rounded-lg border border-white/15 bg-surface px-3 py-2.5 text-paper outline-none focus:border-brass" />
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs text-muted" htmlFor="phone">Telefono (opzionale)</label>
            <input id="phone" name="phone" className="w-full rounded-lg border border-white/15 bg-surface px-3 py-2.5 text-paper outline-none focus:border-brass" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted" htmlFor="product">Prodotto di interesse (opzionale)</label>
            <input id="product" name="product" placeholder="Es. FLOS - Arco" className="w-full rounded-lg border border-white/15 bg-surface px-3 py-2.5 text-paper outline-none focus:border-brass" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-muted" htmlFor="message">Messaggio</label>
          <textarea required id="message" name="message" rows={5} className="w-full rounded-lg border border-white/15 bg-surface px-3 py-2.5 text-paper outline-none focus:border-brass" />
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full rounded-full bg-brass py-3 text-sm font-medium text-ink transition hover:bg-brass-bright disabled:opacity-60 sm:w-auto sm:px-8"
        >
          {status === 'loading' ? 'Invio…' : 'Invia richiesta'}
        </button>

        {status === 'ok' && <p className="text-sm text-brass">Messaggio inviato. Ti risponderemo a breve.</p>}
        {status === 'error' && <p className="text-sm text-ember">Qualcosa è andato storto. Riprova o scrivici direttamente su eleluci.it.</p>}
      </form>
    </main>
  );
}
