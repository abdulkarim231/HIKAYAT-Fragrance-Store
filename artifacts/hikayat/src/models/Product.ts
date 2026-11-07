import 'server-only';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { productSchema } from '@/domain/product-schema';
import type { Product as Fragrance } from '@/domain/product';

/** Full fragrance model, including the database-owned creation timestamp. */
export type Product = Fragrance & { createdAt: string };

const rowSchema = z.object({
  id: z.string(),
  data: productSchema,
  created_at: z.string().datetime({ offset: true }),
}).refine((row) => row.id === row.data.id, 'Invalid product identifier.');

async function readProducts(query: URLSearchParams): Promise<Product[]> {
  query.set('select', 'id,data,created_at');
  query.set('published', 'eq.true');
  const response = await getDb().request(`/rest/v1/products?${query}`);
  if (!response.ok) throw new Error(`supabase_catalog_http_${response.status}`);
  return z.array(rowSchema).parse(await response.json())
    .map((row) => ({ ...row.data, createdAt: row.created_at }))
    .sort((a, b) => a.featuredRank - b.featuredRank);
}

export const ProductModel = {
  async findPublished(): Promise<Product[]> {
    return readProducts(new URLSearchParams({ order: 'id.asc', limit: '500' }));
  },
  async findById(id: string): Promise<Product | null> {
    const validId = z.string().regex(/^[a-z0-9-]+$/).parse(id);
    const rows = await readProducts(new URLSearchParams({ id: `eq.${validId}`, limit: '1' }));
    return rows[0] ?? null;
  },
};
