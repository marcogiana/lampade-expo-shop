import type { Product } from './products';
import fallbackData from '@/data/products.json';

const SHEET_ID = process.env.PRICELIST_SHEET_ID || '1YLuMvGXD5uZEpQ2Bgo1DI9dX580AP1AdKxv1DmxlwYY';

// Il listino promozionale è diviso in 4 schede (tab) separate all'interno dello
// stesso file Google Sheets. Ogni scheda corrisponde a una categoria del sito.
// Si usa il gid (identificativo numerico della scheda, visibile nell'URL come
// #gid=...) invece del nome, perché il lookup per nome di Google Sheets è
// case-sensitive e in caso di mancata corrispondenza restituisce silenziosamente
// la prima scheda invece di dare errore.
const TABS: { gid: string; category: string }[] = [
  { gid: '0', category: 'Sospensioni e plafoniere' },
  { gid: '1219695306', category: 'Applique' },
  { gid: '470800826', category: 'Lampade da tavolo' },
  { gid: '1721492760', category: 'Lampade da terra' },
];

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (c === '\r') {
      // skip
    } else {
      field += c;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Colonna J del foglio (indice 9, fissa indipendentemente dalla struttura delle
// altre colonne): contiene i pezzi disponibili a magazzino per quella riga.
const STOCK_COL_INDEX = 9;

function parseStock(raw: string | undefined): number | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  return parseInt(trimmed, 10);
}

function parseEuro(s: string | undefined): number | null {
  if (!s) return null;
  s = s.trim();
  if (!s || s.includes('---') || s.toLowerCase().includes('vendita')) return null;
  const m = s.match(/([\d.]+)/);
  if (!m) return null;
  return parseInt(m[1].replace(/\./g, ''), 10);
}

/**
 * I link di condivisione di Google Drive (es. .../file/d/ID/view?usp=sharing)
 * puntano a una pagina di anteprima, non all'immagine stessa, quindi non
 * funzionano in un tag <img>. Li convertiamo nel formato "thumbnail" di Drive,
 * che restituisce l'immagine vera e propria (il vecchio formato uc?export=view
 * è stato disabilitato da Google). Il file deve essere condiviso come
 * "Chiunque abbia il link" per funzionare.
 */
function normalizeImageUrl(url: string): string {
  if (!url.includes('drive.google.com')) return url;
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
  }
  return url;
}

/**
 * Trasforma il CSV di UNA scheda in prodotti per la categoria data.
 * Le colonne utili (prezzo scontato, prezzo di listino, % sconto) vengono
 * individuate leggendo il testo dell'intestazione, invece di assumere un
 * numero fisso di colonne: alcune schede hanno una colonna "LINK PRODOTTO"
 * in più rispetto ad altre.
 */
export function parseTabToProducts(csv: string, category: string): Product[] {
  const rows = parseCsv(csv);
  const products: Product[] = [];
  let cols: { code: number; avail: number; disc: number; listIncl: number; pct: number; img: number } | null = null;

  for (const cells of rows) {
    const trimmed = cells.map((c) => (c || '').trim());
    const nonEmpty = trimmed.filter((c) => c !== '');

    if (nonEmpty.length === 0) continue;

    if (trimmed[0] === 'NOME PRODOTTO') {
      const upper = trimmed.map((c) => c.toUpperCase());
      const discIdx = upper.findIndex((c) => c.includes('SCONT'));
      const listInclIdx = upper.findIndex((c, i) => c.includes('IVA INCLUSA') && i !== discIdx && !c.includes('SCONT'));
      const imgIdx = upper.findIndex((c) => c.includes('LINK PRODOTTO'));
      cols = {
        code: 1,
        avail: 2,
        disc: discIdx > -1 ? discIdx : 6,
        listIncl: listInclIdx > -1 ? listInclIdx : 5,
        pct: (discIdx > -1 ? discIdx : 6) + 1,
        img: imgIdx,
      };
      continue;
    }

    if (!cols) continue; // non abbiamo ancora incontrato l'intestazione della scheda
    if (nonEmpty.length === 1) continue; // riga di sottotitolo sezione (es. "ESPOSIZIONE SHOWROOM BREO ...")

    const name = trimmed[0];
    if (!name) continue;

    const code = trimmed[cols.code] || '';
    const availability = trimmed[cols.avail] || '';
    const discountStr = trimmed[cols.disc];
    const discountPctRaw = trimmed[cols.pct];
    const listInclStr = trimmed[cols.listIncl];
    const rawImg = cols.img > -1 ? trimmed[cols.img] : '';
    const stock = parseStock(trimmed[STOCK_COL_INDEX]);

    const discountPrice = parseEuro(discountStr);
    if (discountPrice === null) continue;

    let brand = name;
    let model = name;
    const dashIdx = name.indexOf(' - ');
    if (dashIdx > -1) {
      brand = name.slice(0, dashIdx).trim().replace(/\\&/g, '&');
      model = name.slice(dashIdx + 3).trim();
    }

    const slug = slugify(`${brand}-${model}`);

    const pctMatch = (discountPctRaw || '').match(/(\d+)\s*%/);
    const discountPercent = pctMatch ? parseInt(pctMatch[1], 10) : null;
    let listPrice = parseEuro(listInclStr);
    if (listPrice === null && discountPercent) {
      listPrice = Math.round(discountPrice / (1 - discountPercent / 100));
    }

    const image = rawImg && (rawImg.startsWith('http://') || rawImg.startsWith('https://') || rawImg.startsWith('data:image')) ? normalizeImageUrl(rawImg) : null;

    products.push({
      slug,
      brand,
      model,
      fullName: name.replace(/\\&/g, '&').replace(/\s+/g, ' ').trim(),
      code: code && !code.includes('---') ? code : null,
      availability: availability ? availability.replace(/\s+/g, ' ').trim() : null,
      category,
      price: discountPrice,
      listPrice,
      discountPercent,
      image,
      stock,
    });
  }

  return products;
}

async function fetchTabCsv(gid: string): Promise<string> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Lettura scheda gid=${gid} fallita: ${res.status}`);
  return res.text();
}

function dedupeSlugs(products: Product[]): Product[] {
  const seen = new Set<string>();
  return products.map((p) => {
    let slug = p.slug;
    let i = 2;
    while (seen.has(slug)) {
      slug = `${p.slug}-${i}`;
      i++;
    }
    seen.add(slug);
    return slug === p.slug ? p : { ...p, slug };
  });
}

/**
 * Recupera il catalogo prodotti leggendo in diretta le 4 schede del Google
 * Sheet pubblico (stesso foglio che aggiorna Marco: SOSP, APPLIQUE, TAVOLO,
 * TERRA). Se una o più schede non sono raggiungibili, usa lo snapshot
 * salvato in data/products.json così il sito non si rompe mai.
 */
export async function fetchLiveProducts(): Promise<Product[]> {
  try {
    const results = await Promise.all(
      TABS.map(async (tab) => {
        const csv = await fetchTabCsv(tab.gid);
        return parseTabToProducts(csv, tab.category);
      })
    );
    const all = dedupeSlugs(results.flat());
    if (all.length < 10) throw new Error('Parsing sospetto: troppi pochi prodotti trovati');
    return all;
  } catch (err) {
    console.warn('[sheets] impossibile leggere il Google Sheet live, uso lo snapshot statico:', err);
    return fallbackData as Product[];
  }
}
