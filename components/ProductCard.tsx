'use client';

import Link from 'next/link';
import type { Product } from '@/lib/products';
import { formatEuro } from '@/lib/format';
import { useCart } from './CartContext';

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, open } = useCart();

  return (
    <div className="card-glow group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-surface transition hover:border-brass/40 hover:shadow-glow">
      <Link href={`/prodotti/${product.slug}`} className="block">
        <div className="flex aspect-[4/3] items-center justify-center bg-surface2 text-muted">
          <span className="glow-dot h-2 w-2 rounded-full bg-brass/50" />
          <span className="sr-only">{product.fullName}</span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="font-mono text-[11px] uppercase tracking-widest text-brass">{product.brand}</p>
        <Link href={`/prodotti/${product.slug}`}>
          <h3 className="font-display text-base leading-snug text-paper hover:underline">{product.model}</h3>
        </Link>

        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            {product.listPrice && product.listPrice > product.price && (
              <span className="mr-2 font-mono text-xs text-muted line-through">{formatEuro(product.listPrice)}</span>
            )}
            <span className="font-mono text-base text-paper">{formatEuro(product.price)}</span>
          </div>
          {product.discountPercent && (
            <span className="rounded-full bg-ember/15 px-2 py-0.5 font-mono text-[11px] text-ember">
              −{product.discountPercent}%
            </span>
          )}
        </div>

        <button
          onClick={() =>
            addItem({ slug: product.slug, fullName: product.fullName, brand: product.brand, model: product.model, price: product.price })
          }
          className="mt-3 w-full rounded-full border border-white/15 py-2 text-xs font-medium text-paper transition hover:border-brass hover:text-brass"
        >
          Aggiungi al carrello
        </button>
      </div>
    </div>
  );
}
