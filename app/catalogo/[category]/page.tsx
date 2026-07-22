import { notFound } from 'next/navigation';
import { getAllProducts, filterByCategory, CATEGORIES } from '@/lib/products';
import CatalogGrid from '@/components/CatalogGrid';

const SLUG_TO_CATEGORY: Record<string, string> = {
  'sospensioni-e-plafoniere': 'Sospensioni e plafoniere',
  applique: 'Applique',
  'lampade-da-tavolo': 'Lampade da tavolo',
  'lampade-da-terra': 'Lampade da terra',
};

export function generateStaticParams() {
  return Object.keys(SLUG_TO_CATEGORY).map((category) => ({ category }));
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const categoryName = SLUG_TO_CATEGORY[params.category];
  if (!categoryName) notFound();

  const products = await getAllProducts();
  const items = filterByCategory(products, categoryName);
  const idx = CATEGORIES.indexOf(categoryName as any);

  return (
    <main className="mx-auto max-w-6xl px-5 py-14">
      <div className="mb-10">
        <span className="font-mono text-xs text-muted">
          {String(idx + 1).padStart(2, '0')} / {String(CATEGORIES.length).padStart(2, '0')}
        </span>
        <h1 className="mt-1 font-display text-3xl italic text-paper">{categoryName}</h1>
        <p className="mt-2 text-sm text-muted">{items.length} pezzi disponibili in questa categoria.</p>
      </div>
      <CatalogGrid products={items} />
    </main>
  );
}
