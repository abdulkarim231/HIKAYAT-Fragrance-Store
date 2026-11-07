/** Core domain types. No React, no browser APIs. */
export type Locale = 'en' | 'ar';
export type Localized = Record<Locale, string>;
export type Category = 'men' | 'women' | 'unisex';
export const CATEGORIES: Category[] = ['men', 'women', 'unisex'];

export type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'name';
export const SORT_KEYS: SortKey[] = ['featured', 'price-asc', 'price-desc', 'name'];

export interface ScentNotes {
  top: Localized[];
  heart: Localized[];
  base: Localized[];
}

export interface Product {
  id: string;
  name: Localized;
  category: Category;
  /** Price in SAR */
  price: number;
  /** Original price when discounted */
  compareAtPrice?: number;
  sizeMl: number;
  concentration: Localized;
  family: Localized;
  image: string;
  tagline: Localized;
  description: Localized;
  notes: ScentNotes;
  bestSeller: boolean;
  featuredRank: number;
}

export interface CartLine {
  productId: string;
  quantity: number;
}

export function isCategory(value: unknown): value is Category {
  return value === 'men' || value === 'women' || value === 'unisex';
}

export function isSortKey(value: unknown): value is SortKey {
  return typeof value === 'string' && (SORT_KEYS as string[]).includes(value);
}
