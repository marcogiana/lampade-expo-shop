# Lampade Expo Shop — Ele Luci

E-commerce per la vendita dei pezzi di design a prezzo promozionale (magazzino + showroom).
Next.js 14 (App Router) + TypeScript + Tailwind + Stripe Checkout.

157 prodotti attualmente a catalogo, letti dal foglio Google condiviso e organizzati in 4 categorie:
Sospensioni e plafoniere, Applique, Lampade da tavolo, Lampade da terra.

## 1. Avvio in locale

```bash
npm install
cp .env.example .env.local   # poi compila le chiavi vere
npm run dev
```

Apri http://localhost:3000

Senza nessuna variabile d'ambiente il sito funziona già: mostra il catalogo (con l'ultimo
snapshot salvato) e permette di navigare. Per **provare i pagamenti** serve almeno
`STRIPE_SECRET_KEY` (vedi punto 3).

## 2. Come funziona il catalogo (collegamento al Google Sheet)

Il sito legge in diretta il foglio Google che mi hai condiviso, tramite l'export CSV pubblico:

```
https://docs.google.com/spreadsheets/d/<ID_FOGLIO>/export?format=csv
```

**Perché funzioni**, il foglio deve essere condiviso come "Chiunque abbia il link → Visualizzatore"
(Condividi → Accesso generale → Chiunque abbia il link). Se il foglio torna privato, il sito
non si rompe: usa automaticamente l'ultimo snapshot salvato in `data/products.json`
(generato il giorno della creazione del sito).

- Ogni riga con un valore nella colonna **"PREZZO SCONTANTO EXPO IVA INCLUSA"** diventa un prodotto
  a catalogo. Le righe senza quel prezzo (es. pezzi "solo esposizione" senza sconto) vengono
  ignorate automaticamente.
- La pagina si aggiorna al massimo ogni 5 minuti dopo una modifica al foglio (cache di rivalidazione).
- Se cambi l'ID del foglio, aggiorna la variabile `PRICELIST_SHEET_ID`.

Per rigenerare manualmente lo snapshot di fallback dopo grosse modifiche al foglio, puoi
rilanciare `node parse.js` (script incluso solo a scopo di manutenzione, non usato a runtime)
oppure semplicemente chiedermi di aggiornarlo.

## 3. Attivare i pagamenti (Stripe)

1. Crea un account su https://dashboard.stripe.com (o usa quello esistente di Ele Luci).
2. Vai su **Sviluppatori → Chiavi API** e copia la **Chiave segreta** (in modalità test per
   provare, poi la chiave live quando sei pronto) → mettila in `STRIPE_SECRET_KEY`.
3. Per le notifiche d'ordine: **Sviluppatori → Webhook → Aggiungi endpoint**
   - URL: `https://shop.eleluci.it/api/webhook/stripe`
   - Evento da ascoltare: `checkout.session.completed`
   - Copia il "Signing secret" → mettilo in `STRIPE_WEBHOOK_SECRET`
4. Il checkout è già impostato per accettare carte, con raccolta indirizzo di spedizione
   per Italia, Francia, Svizzera, Austria, Germania (modificabile in
   `app/api/checkout/route.ts`, campo `shipping_address_collection`).
5. I prezzi che arrivano dal carrello **non vengono usati direttamente**: il server
   ricalcola sempre il prezzo dal catalogo corrente, così nessuno può manomettere l'importo.

## 4. Notifiche email (ordini e contatti) — opzionale

Se vuoi ricevere una mail quando arriva un ordine o una richiesta dal form contatti:

1. Crea un account gratuito su https://resend.com
2. Verifica un dominio (es. eleluci.it) o usa il dominio di test fornito da Resend
3. Copia la API key → `RESEND_API_KEY`
4. Imposta `ORDER_NOTIFICATION_EMAIL` e `CONTACT_NOTIFICATION_EMAIL` con la tua email

Senza questa configurazione il sito funziona comunque: gli ordini restano visibili nella
dashboard Stripe, e le richieste di contatto vengono comunque registrate nei log del server
(visibili su Vercel → progetto → tab "Logs").

## 5. Deploy su Vercel con dominio shop.eleluci.it

1. Crea un repository GitHub (es. `marcogiana/lampade-expo-shop`) e pusha questo progetto:
   ```bash
   cd lampade-expo-shop
   git init
   git add .
   git commit -m "Prima versione shop lampade EXPO"
   git branch -M main
   git remote add origin https://github.com/marcogiana/lampade-expo-shop.git
   git push -u origin main
   ```
2. Su https://vercel.com → **New Project** → importa il repo.
3. In **Settings → Environment Variables** inserisci tutte le variabili di `.env.example`
   con i valori reali.
4. Deploy.
5. In **Settings → Domains** aggiungi `shop.eleluci.it`.
6. Nel provider DNS di eleluci.it, crea un record **CNAME**:
   - Host: `shop`
   - Valore: `cname.vercel-dns.com`
   (Vercel ti mostra il valore esatto quando aggiungi il dominio.)

## 6. Foto prodotto

Il sito è pronto per le foto ma al momento mostra un placeholder elegante (bagliore ottone)
al posto dell'immagine, perché non avevamo ancora le foto pronte. Quando le hai:

- Metti i file in `public/prodotti/` con lo stesso slug del prodotto, es. `public/prodotti/flos-arco.jpg`
  (lo slug di ogni prodotto è visibile nell'URL della pagina prodotto, es. `/prodotti/flos-arco`)
- Dimmi di aggiornare `ProductCard.tsx` e la pagina prodotto per usarle: è una modifica di 10 minuti.

## 7. Struttura del progetto

```
app/                    pagine (App Router)
  page.tsx              homepage
  catalogo/[category]   pagina categoria con filtri
  prodotti/[slug]        pagina prodotto
  carrello/              carrello a pagina intera
  contatti/               form contatti
  ordine/successo/        conferma post-pagamento
  api/checkout/            crea sessione Stripe
  api/webhook/stripe/      notifica ordini pagati
  api/contact/              gestisce il form contatti
components/            componenti riusabili (header, footer, card, carrello)
lib/products.ts        tipi e funzioni sul catalogo
lib/sheets.ts           lettura live del Google Sheet + fallback
data/products.json      snapshot di sicurezza del catalogo
```
