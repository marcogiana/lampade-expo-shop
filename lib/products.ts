export type Product = {
  slug: string;
  brand: string;
  model: string;
  fullName: string;
  code: string | null;
  availability: string | null;
  category: string;
  price: number;
  listPrice: number | null;
  discountPercent: number | null;
  image?: string | null;
};

export const CATEGORIES = [
  'Sospensioni e plafoniere',
  'Applique',
  'Lampade da tavolo',
  'Lampade da terra',
] as const;

export { fetchLiveProducts as getAllProducts } from './sheets';

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const { fetchLiveProducts } = await import('./sheets');
  const all = await fetchLiveProducts();
  return all.find((p) => p.slug === slug);
}

export function filterByCategory(products: Product[], category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getBrands(products: Product[]): string[] {
  const brands = new Set(products.map((p) => p.brand));
  return Array.from(brands).sort();
}

export function formatEuro(value: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}
