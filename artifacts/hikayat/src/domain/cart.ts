/** Pure shopping calculations. Every function returns new data; nothing mutates. */
import type { CartLine, Product } from './product';

export const MAX_QTY = 10;

export interface ResolvedLine {
  product: Product;
  quantity: number;
  lineTotal: number;
}

const clampQty = (n: number) => Math.max(0, Math.min(MAX_QTY, Math.floor(n)));

export function addToCart(lines: CartLine[], productId: string, quantity = 1): CartLine[] {
  const existing = lines.find((l) => l.productId === productId);
  if (!existing) return [...lines, { productId, quantity: clampQty(quantity) }];
  return lines.map((l) =>
    l.productId === productId ? { ...l, quantity: clampQty(l.quantity + quantity) } : l,
  );
}

export function setQuantity(lines: CartLine[], productId: string, quantity: number): CartLine[] {
  const q = clampQty(quantity);
  if (q === 0) return removeFromCart(lines, productId);
  return lines.map((l) => (l.productId === productId ? { ...l, quantity: q } : l));
}

export function removeFromCart(lines: CartLine[], productId: string): CartLine[] {
  return lines.filter((l) => l.productId !== productId);
}

export function countItems(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.quantity, 0);
}

export function resolveLines(lines: CartLine[], products: Product[]): ResolvedLine[] {
  const byId = new Map(products.map((p) => [p.id, p]));
  return lines.flatMap((l) => {
    const product = byId.get(l.productId);
    return product ? [{ product, quantity: l.quantity, lineTotal: product.price * l.quantity }] : [];
  });
}

export function subtotal(resolved: ResolvedLine[]): number {
  return round2(resolved.reduce((s, l) => s + l.lineTotal, 0));
}

export function savings(resolved: ResolvedLine[]): number {
  return round2(
    resolved.reduce(
      (s, l) => s + (l.product.compareAtPrice ? (l.product.compareAtPrice - l.product.price) * l.quantity : 0),
      0,
    ),
  );
}

export function discountPercent(product: Product): number | null {
  if (!product.compareAtPrice || product.compareAtPrice <= product.price) return null;
  return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
}

export function isValidCartLine(value: unknown): value is CartLine {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.productId === 'string' && typeof v.quantity === 'number' && v.quantity > 0;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
