import 'server-only';
import { ProductModel } from '@/models/Product';
import type { Product } from '@/domain/product';

/** Server-only, read-only catalog adapter. No SDK or privileged key required. */
export async function readSupabaseCatalog(): Promise<Product[]> {
  return ProductModel.findPublished();
}
