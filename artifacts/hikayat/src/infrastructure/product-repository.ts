/**
 * Product repository. The interface is what the application layer depends on;
 * swap `demoProductRepository` for an HTTP-backed one when a store API exists.
 */
import type { Product } from '@/domain/product';
import { DEMO_PRODUCTS } from './demo-products';

export interface ProductRepository {
  list(): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
}

export const demoProductRepository: ProductRepository = {
  async list() {
    return DEMO_PRODUCTS;
  },
  async getById(id) {
    return DEMO_PRODUCTS.find((p) => p.id === id) ?? null;
  },
};
