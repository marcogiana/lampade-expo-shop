export function formatEuro(value: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}

// Sotto questa percentuale di sconto il sito mostra solo il prezzo netto
// (senza prezzo di listino barrato e senza badge "−X%").
export const MIN_DISCOUNT_TO_SHOW = 25;

/** Sconto reale (in %) calcolato da prezzo di listino e prezzo EXPO; 0 se non c'è sconto. */
export function realDiscountPercent(p: { price: number; listPrice: number | null }): number {
  if (!p.listPrice || p.listPrice <= p.price) return 0;
  return Math.round((1 - p.price / p.listPrice) * 100);
}

export function showDiscount(p: { price: number; listPrice: number | null }): boolean {
  return realDiscountPercent(p) >= MIN_DISCOUNT_TO_SHOW;
}
