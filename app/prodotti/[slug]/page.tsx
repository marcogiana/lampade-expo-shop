import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllProducts, getProductBySlug } from '@/lib/products';
import { formatEuro } from '@/lib/format';
import AddToCartButton from '@/components/AddToCartButton';
import ProductCard from '@/components/ProductCard';
import ProductImage from '@/components/ProductImage';

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ slug: p.slug }));
}

const CATEGORY_SLUGS: Record<string, string> = {
  'Sospensioni e plafoniere': 'sospensioni-e-plafoniere',
  Applique: 'applique',
  'Lampade da tavolo': 'lampade-da-tavolo',
  'Lampade da terra': 'lampade-da-terra',
};

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const allProducts = await getAllProducts();
  const related = allProducts.filter((p) => p.category === product.category && p.slug !== product.slug).slice(0, 4);

  return (
    <main className="mx-auto max-w-6xl px-5 py-14">
      <nav className="mb-8 flex items-center gap-2 text-xs text-muted">
        <Link href="/" className="hover:text-paper">Home</Link>
        <span>/</span>
        <Link href={`/catalogo/${CATEGORY_SLUGS[product.category]}`} className="hover:text-paper">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-paper">{product.model}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <ProductImage src={product.image} alt={product.fullName} />

        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-brass">{product.brand}</p>
          <h1 className="mt-2 font-display text-3xl italic text-paper">{product.model}</h1>

          <div className="mt-5 flex items-center gap-3">
            {product.listPrice && product.listPrice > product.price && (
              <span className="font-mono text-base text-muted line-through">{formatEuro(product.listPrice)}</span>
            )}
            <span className="font-mono text-2xl text-paper">{formatEuro(product.price)}</span>
            {product.discountPercent && (
              <span className="rounded-full bg-ember/15 px-2.5 py-1 font-mono text-xs text-ember">
                −{product.discountPercent}%
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted">Prezzo IVA inclusa.</p>

          <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-white/10 pt-6 text-sm">
            <div>
              <dt className="text-muted">Codice</dt>
              <dd className="font-mono text-paper">{product.code || '—'}</dd>
            </div>
            <div>
              <dt className="text-muted">Disponibilità</dt>
              <dd className="text-paper">
                {typeof product.stock === 'number'
                  ? product.stock > 0
                    ? product.stock === 1
                      ? 'Ultimo pezzo disponibile'
                      : `${product.stock} disponibili`
                    : 'Esaurito'
                  : product.availability || 'Su richiesta'}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Categoria</dt>
              <dd className="text-paper">{product.category}</dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <AddToCartButton product={product} />
            <Link
              href="/contatti"
              className="flex-1 rounded-full border border-white/15 py-3 text-center text-sm text-paper transition hover:border-brass hover:text-brass"
            >
              Chiedi informazioni
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted">
            Pezzo singolo proveniente da magazzino o showroom: potrebbe presentare minimi segni d'uso da esposizione.
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20 border-t border-white/10 pt-12">
          <h2 className="mb-6 font-display text-xl italic text-paper">Altri pezzi in {product.category.toLowerCase()}</h2>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
