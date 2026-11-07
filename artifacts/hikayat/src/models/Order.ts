import 'server-only';
import { z } from 'zod';
import { getDb } from '@/lib/db';

export interface Order {
  id: string;
  user: string;
  items: { product: string; quantity: number; price: number }[];
  total: number;
  status: 'pending' | 'paid';
  createdAt: string;
}

const rowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  items: z.array(z.object({
    product_id: z.string(),
    quantity: z.number().int().positive(),
    price: z.number().finite().nonnegative(),
  })),
  total: z.number().finite().nonnegative(),
  status: z.enum(['pending', 'paid']),
  created_at: z.string().datetime({ offset: true }),
});

export const OrderModel = {
  /** RLS limits orders and embedded line items to the token owner. */
  async findForCurrentUser(accessToken: string): Promise<Order[]> {
    if (!accessToken) throw new Error('Authentication required.');
    const query = new URLSearchParams({
      select: 'id,user_id,total,status,created_at,items:order_items(product_id,quantity,price)',
      order: 'created_at.desc',
      limit: '100',
    });
    const response = await getDb().request(`/rest/v1/orders?${query}`, { accessToken });
    if (!response.ok) throw new Error('Order lookup failed.');
    return z.array(rowSchema).parse(await response.json()).map((row) => ({
      id: row.id,
      user: row.user_id,
      items: row.items.map((item) => ({ product: item.product_id, quantity: item.quantity, price: item.price })),
      total: row.total,
      status: row.status,
      createdAt: row.created_at,
    }));
  },
};
