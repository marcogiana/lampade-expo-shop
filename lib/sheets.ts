import type { Product } from './products';
import fallbackData from '@/data/products.json';

const SHEET_ID = process.env.PRICELIST_SHEET_ID || '1YLuMvGXD5uZEpQ2Bgo1DI9dX580AP1AdKxv1DmxlwYY';
const CATEGORIES = ['Sospensioni e plafoniere', 'Applique', 'Lampade da tavolo', 'Lampade da terra'];

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

function parseEuro(s: string | undefined): number | null {
  if (!s) return null;
  s = s.trim();
  if (!s || s.includes('---') || s.toLowerCase().includes('vendita')) return null;
  const m = s.match(/([\d.]+)/);
  if (!m) return null;
  return parseInt(m[1].replace(/\./g, ''), 10);
}

function isDividerRow(cells: string[]): boolean {
  return cells.every((c) => c.trim() === '' || c.trim() === ':-:');
}

export function parseSheetToProducts(csv: string): Product[] {
  const rows = parseCsv(csv);
  const products: Product[] = [];
  const seenSlugs = new Set<string>();

  // Le tabelle nel foglio sono separate da righe vuote; contiamo i blocchi
  // di intestazione ("NOME PRODOTTO") per assegnare la categoria corretta.
  let tableIndex = -1;
  let category = CATEGORIES[0];
  let lastRowWasEmpty = true;

  for (const cells of rows) {
    const trimmed = cells.map((c) => (c || '').trim());
    const nonEmpty = trimmed.filter((c) => c !== '');

    if (nonEmpty.length === 0) {
      lastRowWasEmpty = true;
      continue;
    }

    if (trimmed[0] === 'NOME PRODOTTO') {
      tableIndex++;
      category = CATEGORIES[tableIndex] || CATEGORIES[CATEGORIES.length - 1];
      lastRowWasEmpty = false;
      continue;
    }

    // riga di sottotitolo sezione (es. "ESPOSIZIONE SHOWROOM BREO ...")
    if (nonEmpty.length === 1) {
      lastRowWasEmpty = false;
      continue;
    }

    const name = trimmed[0];
    if (!name) continue;

    const code = trimmed[1] || '';
    const availability = trimmed[2] || '';

    // Le prime 9 colonne includono un LINK PRODOTTO in più rispetto alle altre tabelle
    const hasLinkCol = tableIndex === 0;
    const discountStr = hasLinkCol ? trimmed[7] : trimmed[6];
    const discountPctRaw = hasLinkCol ? trimmed[8] : trimmed[7];
    const listInclStr = hasLinkCol ? trimmed[6] : trimmed[5];

    const discountPrice = parseEuro(discountStr);
    if (discountPrice === null) {
      lastRowWasEmpty = false;
      continue;
    }

    let brand = name;
    let model = name;
    const dashIdx = name.indexOf(' - ');
    if (dashIdx > -1) {
      brand = name.slice(0, dashIdx).trim().replace(/\\&/g, '&');
      model = name.slice(dashIdx + 3).trim();
    }

    let slug = slugify(`${brand}-${model}`);
    let unique = slug;
    let i = 2;
    while (seenSlugs.has(unique)) {
      unique = `${slug}-${i}`;
      i++;
    }
    seenSlugs.add(unique);

    const pctMatch = (discountPctRaw || '').match(/(\d+)\s*%/);
    const discountPercent = pctMatch ? parseInt(pctMatch[1], 10) : null;
    let listPrice = parseEuro(listInclStr);
    if (listPrice === null && discountPercent) {
      listPrice = Math.round(discountPrice / (1 - discountPercent / 100));
    }

    products.push({
      slug: unique,
      brand,
      model,
      fullName: name.replace(/\\&/g, '&').replace(/\s+/g, ' ').trim(),
      code: code && !code.includes('---') ? code : null,
      availability: availability ? availability.replace(/\s+/g, ' ').trim() : null,
      category,
      price: discountPrice,
      listPrice,
      discountPercent,
    });
    lastRowWasEmpty = false;
  }

  return products;
}

/**
 * Recupera il catalogo prodotti. Prova a leggere in diretta il Google Sheet
 * pubblico (stesso foglio che aggiorna Marco); se il foglio non è
 * raggiungibile o non è più pubblico, usa lo snapshot salvato in
 * data/products.json così il sito non si rompe mai.
 */
export async function fetchLiveProducts(): Promise<Product[]> {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);
    const csv = await res.text();
    const parsed = parseSheetToProducts(csv);
    if (parsed.length < 10) throw new Error('Parsing sospetto: troppi pochi prodotti trovati');
    return parsed;
  } catch (err) {
    console.warn('[sheets] impossibile leggere il Google Sheet live, uso lo snapshot statico:', err);
    return fallbackData as Product[];
  }
}
