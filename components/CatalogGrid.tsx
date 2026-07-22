'use client';

import { useMemo, useState } from 'react';
import type { Product } from '@/lib/products';
import ProductCard from './ProductCard';

type SortKey = 'sconto' | 'prezzo-asc' | 'prezzo-desc' | 'marca';

export default function CatalogGrid({ products }: { products: Product[] }) {
  const [brand, setBrand] = useState('Tutte');
  const [sort, setSort] = useState<SortKey>('sconto');

  const brands = useMemo(() => ['Tutte', ...Array.from(new Set(products.map((p) => p.brand))).sort()], [products]);

  const filtered = useMemo(() => {
    let list = brand === 'Tutte' ? products : products.filter((p) => p.brand === brand);
    list = [...list];
    switch (sort) {
      case 'prezzo-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'prezzo-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'marca':
        list.sort((a, b) => a.brand.localeCompare(b.brand));
        break;
      default:
        list.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
    }
    return list;
  }, [products, brand, sort]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex flex-wrap items-center gap-2">
          {brands.map((b) => (
            <button
              key={b}
              onClick={() => setBrand(b)}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                brand === b ? 'border-brass text-brass' : 'border-white/15 text-muted hover:text-paper'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-muted">
          Ordina per
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-md border border-white/15 bg-surface px-2 py-1.5 text-paper"
          >
            <option value="sconto">Sconto maggiore</option>
            <option value="prezzo-asc">Prezzo crescente</option>
            <option value="prezzo-desc">Prezzo decrescente</option>
            <option value="marca">Marca (A–Z)</option>
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted">Nessun prodotto per questo filtro.</p>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
