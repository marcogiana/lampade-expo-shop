/**
 * Interruttore pagamenti online (Stripe).
 *
 * false (default): il carrello porta al modulo "Richiedi l'ordine", dove il cliente
 *   lascia i dati per la fattura; l'ordine arriva via email e il pagamento si
 *   concorda direttamente.
 * true: il carrello porta al pagamento con carta su Stripe (come prima).
 *
 * Per riattivare Stripe basta impostare su Vercel la variabile
 *   NEXT_PUBLIC_PAYMENTS_ENABLED=true
 * e rifare il deploy. Il codice Stripe è rimasto invariato.
 */
export const PAYMENTS_ENABLED = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === 'true';
