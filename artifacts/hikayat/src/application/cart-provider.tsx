import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
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
  quantityOf: (productId: string) => number;
}

const CartContext = createContext<CartContextValue | null>(null);
const isLines = (v: unknown): v is CartLine[] => Array.isArray(v) && v.every(isValidCartLine);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => localStore.read(STORAGE_KEYS.cart, [], isLines));

  useEffect(() => localStore.write(STORAGE_KEYS.cart, lines), [lines]);

  const add = useCallback((id: string, qty = 1) => setLines((l) => addToCart(l, id, qty)), []);
  const setQty = useCallback((id: string, qty: number) => setLines((l) => setQuantity(l, id, qty)), []);
  const remove = useCallback((id: string) => setLines((l) => removeFromCart(l, id)), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines, count: countItems(lines), add, setQty, remove, clear,
      quantityOf: (id) => lines.find((l) => l.productId === id)?.quantity ?? 0,
    }),
    [lines, add, setQty, remove, clear],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
