import { z } from 'zod';
import type { Product } from './product';

const localized = z.object({ en: z.string().min(1), ar: z.string().min(1) });

export const productSchema: z.ZodType<Product> = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: localized,
  category: z.enum(['men', 'women', 'unisex']),
  price: z.number().finite().nonnegative(),
  compareAtPrice: z.number().finite().nonnegative().optional(),
  sizeMl: z.number().positive(),
  concentration: localized,
  family: localized,
  // Only local catalog images are allowed, not arbitrary remote URLs or scripts.
  image: z.string().regex(/^images\/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp)$/),
  tagline: localized,
  description: localized,
  notes: z.object({ top: z.array(localized), heart: z.array(localized), base: z.array(localized) }),
  bestSeller: z.boolean(),
  featuredRank: z.number().int().nonnegative(),
});

export const productListSchema = z.array(productSchema);
