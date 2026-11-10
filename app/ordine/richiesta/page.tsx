'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCart } from '@/components/CartContext';
import { formatEuro } from '@/lib/format';

const input =
  'w-full rounded-lg border border-white/15 bg-surface px-3 py-2.5 text-paper outline-none focus:border-brass';
const label = 'mb-1.5 block text-xs text-muted';

export default function RichiestaOrdinePage() {
  const { items, total, clear } = useCart();
  const router = useRouter();
  const [customerType, setCustomerType] = useState<'privato' | 'azienda'>('privato');
  const [shippingDifferent, setShippingDifferent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    setError(null);
    setLoading(true);
    const f = new FormData(formEl);
    const g = (k: string) => String(f.get(k) || '');
    try {
      const res = await fetch('/api/order-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(({ slug, qty }) => ({ slug, qty })),
          customerType,
          name: g('name'),
          contactName: g('contactName'),
          email: g('email'),
          phone: g('phone'),
          fiscalCode: g('fiscalCode'),
          vatNumber: g('vatNumber'),
          sdiCode: g('sdiCode'),
          pec: g('pec'),
          address: g('address'),
          zip: g('zip'),
          city: g('city'),
          province: g('province'),
          shippingDifferent,
          shippingAddress: g('shippingAddress'),
          shippingZip: g('shippingZip'),
          shippingCity: g('shippingCity'),
          shippingProvince: g('shippingProvince'),
          notes: g('notes'),
          privacy: f.get('privacy') === 'on',
          website: g('website'),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Invio non riuscito. Riprova.');
      clear();
      router.push('/ordine/richiesta-inviata');
    } catch (err: any) {
      setError(err.message || 'Qualcosa è andato storto. Riprova.');
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-24 text-center">
        <h1 className="font-display text-2xl italic text-paper">Il carrello è vuoto</h1>
        <p className="mt-3 text-sm text-muted">Aggiungi almeno una lampada per inviare la richiesta.</p>
        <Link href="/" className="mt-6 inline-block rounded-full bg-brass px-6 py-3 text-sm font-medium text-ink">
          Torna al catalogo
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="font-display text-3xl italic text-paper">Richiedi l&apos;ordine</h1>
      <p className="mt-3 text-sm text-muted">
        Compila i dati per la fattura. Non devi pagare ora: ti ricontatteremo per confermare disponibilità,
        spedizione e modalità di pagamento.
      </p>

      <section className="mt-8 rounded-xl border border-white/10 bg-surface p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-paper">Il tuo ordine</h2>
          <Link href="/carrello" className="text-xs text-muted hover:text-paper">
            Modifica carrello
          </Link>
        </div>
        <ul className="divide-y divide-white/10 text-sm">
          {items.map((item) => (
            <li key={item.slug} className="flex items-center justify-between gap-4 py-2">
              <span className="text-paper">
                {item.fullName} <span className="text-muted">× {item.qty}</span>
              </span>
              <span className="font-mono text-paper">{formatEuro(item.price * item.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
          <span className="text-sm text-muted">Totale (IVA inclusa, spedizione esclusa)</span>
          <span className="font-mono text-lg text-paper">{formatEuro(total)}</span>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="mt-10 space-y-8">
        <fieldset>
          <legend className="mb-3 text-sm font-medium text-paper">Dati di fatturazione</legend>

          <div className="mb-5 flex gap-3">
            {(['privato', 'azienda'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setCustomerType(t)}
                className={`flex-1 rounded-full border py-2.5 text-sm transition ${
                  customerType === t
                    ? 'border-brass bg-brass/10 text-brass'
                    : 'border-white/15 text-muted hover:text-paper'
                }`}
              >
                {t === 'privato' ? 'Privato' : 'Azienda / professionista'}
              </button>
            ))}
          </div>

          <div className="space-y-5">
            <div>
              <label className={label} htmlFor="name">
                {customerType === 'azienda' ? 'Ragione sociale' : 'Nome e cognome'}
              </label>
              <input required id="name" name="name" autoComplete={customerType === 'azienda' ? 'organization' : 'name'} className={input} />
            </div>

            {customerType === 'azienda' ? (
              <>
                <div>
                  <label className={label} htmlFor="contactName">Referente (opzionale)</label>
                  <input id="contactName" name="contactName" autoComplete="name" className={input} />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={label} htmlFor="vatNumber">Partita IVA</label>
                    <input required id="vatNumber" name="vatNumber" inputMode="numeric" maxLength={14} className={input} />
                  </div>
                  <div>
                    <label className={label} htmlFor="fiscalCode">Codice fiscale (se diverso)</label>
                    <input id="fiscalCode" name="fiscalCode" maxLength={16} className={`${input} uppercase`} />
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={label} htmlFor="sdiCode">Codice destinatario (SDI)</label>
                    <input id="sdiCode" name="sdiCode" maxLength={7} className={`${input} uppercase`} />
                  </div>
                  <div>
                    <label className={label} htmlFor="pec">oppure PEC</label>
                    <input id="pec" name="pec" type="email" className={input} />
                  </div>
                </div>
                <p className="-mt-2 text-xs text-muted">Serve almeno uno tra codice destinatario e PEC.</p>
              </>
            ) : (
              <div>
                <label className={label} htmlFor="fiscalCode">Codice fiscale</label>
                <input required id="fiscalCode" name="fiscalCode" maxLength={16} className={`${input} uppercase`} />
              </div>
            )}

            <div>
              <label className={label} htmlFor="address">Indirizzo di fatturazione (via e numero)</label>
              <input required id="address" name="address" autoComplete="street-address" className={input} />
            </div>
            <div className="grid gap-5 sm:grid-cols-[1fr_2fr_1fr]">
              <div>
                <label className={label} htmlFor="zip">CAP</label>
                <input required id="zip" name="zip" inputMode="numeric" autoComplete="postal-code" className={input} />
              </div>
              <div>
                <label className={label} htmlFor="city">Città</label>
                <input required id="city" name="city" autoComplete="address-level2" className={input} />
              </div>
              <div>
                <label className={label} htmlFor="province">Provincia</label>
                <input required id="province" name="province" maxLength={3} className={`${input} uppercase`} />
              </div>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-sm font-medium text-paper">Contatti</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="email">Email</label>
              <input required type="email" id="email" name="email" autoComplete="email" className={input} />
            </div>
            <div>
              <label className={label} htmlFor="phone">Telefono</label>
              <input required type="tel" id="phone" name="phone" autoComplete="tel" className={input} />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-sm font-medium text-paper">Spedizione</legend>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={shippingDifferent}
              onChange={(e) => setShippingDifferent(e.target.checked)}
              className="h-4 w-4 accent-brass"
            />
            Spedisci a un indirizzo diverso da quello di fatturazione
          </label>
          {shippingDifferent && (
            <div className="mt-5 space-y-5">
              <div>
                <label className={label} htmlFor="shippingAddress">Indirizzo di spedizione (via e numero)</label>
                <input required id="shippingAddress" name="shippingAddress" className={input} />
              </div>
              <div className="grid gap-5 sm:grid-cols-[1fr_2fr_1fr]">
                <div>
                  <label className={label} htmlFor="shippingZip">CAP</label>
                  <input required id="shippingZip" name="shippingZip" inputMode="numeric" className={input} />
                </div>
                <div>
                  <label className={label} htmlFor="shippingCity">Città</label>
                  <input required id="shippingCity" name="shippingCity" className={input} />
                </div>
                <div>
                  <label className={label} htmlFor="shippingProvince">Provincia</label>
                  <input required id="shippingProvince" name="shippingProvince" maxLength={3} className={`${input} uppercase`} />
                </div>
              </div>
            </div>
          )}
        </fieldset>

        <div>
          <label className={label} htmlFor="notes">Note (opzionale)</label>
          <textarea id="notes" name="notes" rows={3} className={input} placeholder="Es. preferisci il ritiro in showroom a Mondovì" />
        </div>

        {/* Campo trappola anti-spam: nascosto agli utenti, i bot lo compilano */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="website">Sito web</label>
          <input id="website" name="website" tabIndex={-1} autoComplete="off" />
        </div>

        <label className="flex items-start gap-2 text-xs text-muted">
          <input required type="checkbox" name="privacy" className="mt-0.5 h-4 w-4 accent-brass" />
          <span>
            Acconsento al trattamento dei miei dati personali per gestire questa richiesta d&apos;ordine e la
            fatturazione.
          </span>
        </label>

        {error && <p className="text-sm text-ember">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-brass py-3 text-sm font-medium text-ink transition hover:bg-brass-bright disabled:opacity-60"
        >
          {loading ? 'Invio in corso…' : 'Invia la richiesta d\'ordine'}
        </button>
      </form>
    </main>
  );
}
