import 'server-only';
import { z } from 'zod';
import { productSchema } from '@/domain/product-schema';
import type { Product } from '@/domain/product';
import { supabaseSettings } from './supabase-settings';

const rowsSchema = z.array(z.object({ id: z.string(), data: productSchema }));

/** Server-only, read-only catalog adapter. No SDK or privileged key required. */
export async function readSupabaseCatalog(): Promise<Product[]> {
  const { url, key, legacyAnon } = supabaseSettings();
  const endpoint = new URL('/rest/v1/products', url);
  endpoint.searchParams.set('select', 'id,data');
  endpoint.searchParams.set('published', 'eq.true');
  endpoint.searchParams.set('order', 'id.asc');
  endpoint.searchParams.set('limit', '500');

  const response = await fetch(endpoint, {
    headers: { apikey: key, Accept: 'application/json', ...(legacyAnon ? { Authorization: `Bearer ${key}` } : {}) },
    cache: 'no-store',
    signal: AbortSignal.timeout(10_000),
    redirect: 'error',
  });
  if (!response.ok) throw new Error(`supabase_catalog_http_${response.status}`);
  const rows = rowsSchema.parse(await response.json());
  if (rows.some((row) => row.id !== row.data.id)) throw new Error('Invalid catalog identifiers.');
  return rows.map((row) => row.data).sort((a, b) => a.featuredRank - b.featuredRank);
}
