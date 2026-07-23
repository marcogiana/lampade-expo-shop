import Link from 'next/link';
import { getAllProducts, filterByCategory, CATEGORIES } from '@/lib/products';
import ProductCard from '@/components/ProductCard';

const CATEGORY_SLUGS: Record<string, string> = {
  'Sospensioni e plafoniere': 'sospensioni-e-plafoniere',
  Applique: 'applique',
  'Lampade da tavolo': 'lampade-da-tavolo',
  'Lampade da terra': 'lampade-da-terra',
};

export default async function HomePage() {
  const products = await getAllProducts();
  const totalCount = products.length;
  const brandCount = new Set(products.map((p) => p.brand)).size;

  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[720px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(198,160,92,0.35), transparent 70%)' }}
        />
        <div className="relative mx-auto max-w-6xl px-5 py-24 text-center">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-brass">Selezione da magazzino e showroom</p>
          <h1 className="mx-auto max-w-3xl font-display text-4xl italic leading-tight text-paper sm:text-6xl">
            Pezzi di design, luce vera, un solo esemplare a testa.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-sm text-muted sm:text-base">
            {totalCount} lampade di {brandCount} marchi — FLOS, Artemide, Catellani&amp;Smith, Foscarini, Luceplan e altri —
            uscite dal magazzino e dallo showroom Studio Luce, in vendita a prezzo scontato fino a esaurimento.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/catalogo/sospensioni-e-plafoniere"
              className="rounded-full bg-brass px-6 py-3 text-sm font-medium text-ink transition hover:bg-brass-bright"
            >
              Sfoglia il catalogo
            </Link>
            <Link href="/contatti" className="text-sm text-muted transition hover:text-paper">
              Preferisci parlarne prima con noi? →
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORY SECTIONS */}
      {CATEGORIES.map((category, idx) => {
        const items = filterByCategory(products, category).slice(0, 4);
        if (items.length === 0) return null;
        return (
          <section key={category} className="mx-auto max-w-6xl px-5 py-16">
            <div className="mb-8 flex items-baseline justify-between">
              <div>
                <span className="font-mono text-xs text-muted">
                  {String(idx + 1).padStart(2, '0')} / {String(CATEGORIES.length).padStart(2, '0')}
                </span>
                <h2 className="mt-1 font-display text-2xl italic text-paper">{category}</h2>
              </div>
              <Link
                href={`/catalogo/${CATEGORY_SLUGS[category]}`}
                className="text-sm text-brass hover:text-brass-bright"
              >
                Vedi tutte →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
              {items.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </section>
        );
      })}

      <section className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-5 py-16 text-center">
          <p className="font-display text-xl italic text-paper">Un pezzo, una sola vendita.</p>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted">
            Ogni lampada in questa vendita è un esemplare singolo da magazzino o da showroom: quando esaurisce, esce dal catalogo.
          </p>
        </div>
      </section>
    </main>
  );
}
