import { z } from 'zod';

export const deliverySchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^\+?[0-9\s-]{8,16}$/),
  email: z.string().trim().email().max(254),
  city: z.string().trim().min(2).max(100),
  address: z.string().trim().min(5).max(500),
  notes: z.string().trim().max(300).optional(),
}).strict();

export const checkoutSchema = z.object({
  requestId: z.string().uuid(),
  locale: z.enum(['en', 'ar']),
  items: z.array(z.object({
    productId: z.string().regex(/^[a-z0-9-]+$/).max(100),
    quantity: z.number().int().min(1).max(10),
  }).strict()).min(1).max(30),
  delivery: deliverySchema,
}).strict().refine((data) => new Set(data.items.map((i) => i.productId)).size === data.items.length, 'Duplicate items');

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type PaymentCode = 'invalid_input' | 'unauthorized' | 'forbidden' | 'catalog_changed' | 'payment_unavailable' | 'not_found';
export class PaymentFailure extends Error {
  constructor(public code: PaymentCode, public status = 400) { super(code); }
}

export function toMinorUnits(price: number): number {
  const minor = Math.round(price * 100);
  if (!Number.isFinite(price) || price <= 0 || !Number.isSafeInteger(minor)) throw new PaymentFailure('catalog_changed', 409);
  return minor;
}
