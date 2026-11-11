import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { CartLine } from '@/domain/product';
import { addToCart, countItems, isValidCartLine, removeFromCart, setQuantity } from '@/domain/cart';
import { localStore, STORAGE_KEYS } from '@/infrastructure/storage';

interface CartContextValue {
  lines: CartLine[];
  count: number;
  add: (productId: string, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  completeOrder: (orderId: string, purchased: { productId: string; quantity: number }[]) => void;
  quantityOf: (productId: string) => number;
}

const CartContext = createContext<CartContextValue | null>(null);
const isLines = (v: unknown): v is CartLine[] => Array.isArray(v) && v.every(isValidCartLine);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => localStore.read(STORAGE_KEYS.cart, [], isLines));
  const completedThisSession = useRef(new Set<string>());

  useEffect(() => localStore.write(STORAGE_KEYS.cart, lines), [lines]);

  const add = useCallback((id: string, qty = 1) => setLines((l) => addToCart(l, id, qty)), []);
  const setQty = useCallback((id: string, qty: number) => setLines((l) => setQuantity(l, id, qty)), []);
  const remove = useCallback((id: string) => setLines((l) => removeFromCart(l, id)), []);
  const clear = useCallback(() => setLines([]), []);
  const completeOrder = useCallback((orderId: string, purchased: { productId: string; quantity: number }[]) => {
    const key = 'completed-orders';
    const seen = localStore.read<string[]>(key, [], (v): v is string[] => Array.isArray(v) && v.every((id) => typeof id === 'string'));
    if (seen.includes(orderId) || completedThisSession.current.has(orderId)) return;
    completedThisSession.current.add(orderId);
    // Only remove purchased quantities, preserving items added while Stripe was open.
    setLines((current) => current.flatMap((line) => {
      const quantity = line.quantity - (purchased.find((p) => p.productId === line.productId)?.quantity ?? 0);
      return quantity > 0 ? [{ ...line, quantity }] : [];
    }));
    localStore.write(key, [...seen.slice(-99), orderId]);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines, count: countItems(lines), add, setQty, remove, clear, completeOrder,
      quantityOf: (id) => lines.find((l) => l.productId === id)?.quantity ?? 0,
    }),
    [lines, add, setQty, remove, clear, completeOrder],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
