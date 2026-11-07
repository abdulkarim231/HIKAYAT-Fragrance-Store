/** Pure catalog querying: filtering, searching, sorting. */
import type { Category, Locale, Product, SortKey } from './product';

export interface CatalogQuery {
  category?: Category | null;
  search?: string;
  sort?: SortKey;
  bestSellersOnly?: boolean;
}

function haystack(p: Product): string {
  const parts = [
    p.name.en, p.name.ar, p.family.en, p.family.ar, p.tagline.en, p.tagline.ar, p.category,
    ...[...p.notes.top, ...p.notes.heart, ...p.notes.base].flatMap((n) => [n.en, n.ar]),
  ];
  return parts.join(' ').toLowerCase();
}

export function matchesSearch(p: Product, search: string): boolean {
  const terms = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const text = haystack(p);
  return terms.every((t) => text.includes(t));
}

export function queryCatalog(products: Product[], q: CatalogQuery, locale: Locale): Product[] {
  const filtered = products.filter(
    (p) =>
      (!q.category || p.category === q.category) &&
      (!q.bestSellersOnly || p.bestSeller) &&
      matchesSearch(p, q.search ?? ''),
  );
  return sortProducts(filtered, q.sort ?? 'featured', locale);
}

export function sortProducts(products: Product[], sort: SortKey, locale: Locale): Product[] {
  const list = [...products];
  switch (sort) {
    case 'price-asc':
      return list.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return list.sort((a, b) => b.price - a.price);
    case 'name':
      return list.sort((a, b) => a.name[locale].localeCompare(b.name[locale], locale));
    default:
      return list.sort((a, b) => a.featuredRank - b.featuredRank);
  }
}
