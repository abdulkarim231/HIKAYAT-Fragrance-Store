/**
 * Product repository. The interface is what the application layer depends on;
 * The browser talks only to the same-origin Next.js API. Supabase configuration
 * is confined to the server adapter, never bundled into client components.
 */
import type { Product } from '@/domain/product';
import { productListSchema } from '@/domain/product-schema';
import { assetUrl } from './assets';

export interface ProductRepository {
  list(): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
}

export const productRepository: ProductRepository = {
  async list() {
    const response = await fetch(assetUrl('api/catalog'), {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(15_000),
      cache: 'no-store',
    });
    if (!response.ok) throw new Error('The fragrance catalog is unavailable. Please try again.');
    return productListSchema.parse(await response.json()).map((product) => ({
      ...product,
      image: assetUrl(product.image),
    }));
  },
  async getById(id) {
    return (await this.list()).find((p) => p.id === id) ?? null;
  },
};
