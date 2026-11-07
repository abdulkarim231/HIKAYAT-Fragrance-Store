import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { localStore, STORAGE_KEYS } from '@/infrastructure/storage';

interface WishlistContextValue {
  ids: string[];
  count: number;
  has: (id: string) => boolean;
  /** Returns true if the item is now saved */
  toggle: (id: string) => boolean;
  clear: () => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);
const isIds = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string');

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>(() => localStore.read(STORAGE_KEYS.wishlist, [], isIds));
  useEffect(() => localStore.write(STORAGE_KEYS.wishlist, ids), [ids]);

  const toggle = useCallback(
    (id: string) => {
      const saved = !ids.includes(id);
      setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
      return saved;
    },
    [ids],
  );
  const clear = useCallback(() => setIds([]), []);

  const value = useMemo<WishlistContextValue>(
    () => ({ ids, count: ids.length, has: (id) => ids.includes(id), toggle, clear }),
    [ids, toggle, clear],
  );
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider');
  return ctx;
}
