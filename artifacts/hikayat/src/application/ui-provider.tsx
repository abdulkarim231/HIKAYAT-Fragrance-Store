/** Global overlay state: quick view, search, account dialogs. */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface UIContextValue {
  quickViewId: string | null;
  openQuickView: (id: string) => void;
  closeQuickView: () => void;
  searchOpen: boolean;
  setSearchOpen: (o: boolean) => void;
  accountOpen: boolean;
  setAccountOpen: (o: boolean) => void;
}

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [quickViewId, setQuickViewId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const value = useMemo(
    () => ({
      quickViewId, openQuickView: (id: string) => setQuickViewId(id), closeQuickView: () => setQuickViewId(null),
      searchOpen, setSearchOpen, accountOpen, setAccountOpen,
    }),
    [quickViewId, searchOpen, accountOpen],
  );
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used inside UIProvider');
  return ctx;
}
