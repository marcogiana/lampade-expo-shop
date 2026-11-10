'use client';

import type { Product } from '@/lib/products';
import { useCart } from './CartContext';
import { PAYMENTS_ENABLED } from '@/lib/config';

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <button
      onClick={() =>
        addItem({
          slug: product.slug,
          fullName: product.fullName,
          brand: product.brand,
          model: product.model,
          price: product.price,
        })
      }
      className="flex-1 rounded-full bg-brass py-3 text-sm font-medium text-ink transition hover:bg-brass-bright"
    >
      {PAYMENTS_ENABLED ? 'Aggiungi al carrello — acquista ora' : 'Aggiungi al carrello'}
    </button>
  );
}
