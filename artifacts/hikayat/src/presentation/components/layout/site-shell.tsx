import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'wouter';
import { Header } from './header';
import { Footer } from './footer';
import { QuickViewDialog } from '@/presentation/components/product/quick-view-dialog';
import { SearchDialog } from '@/presentation/components/dialogs/search-dialog';
import { AccountDialog } from '@/presentation/components/dialogs/account-dialog';

/** Persistent chrome around routed pages. Survives page-level crashes. */
export function SiteShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  useEffect(() => { window.scrollTo({ top: 0 }); }, [location]);

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <Header />
      <main id="main" className="flex-1">{children}</main>
      <Footer />
      <QuickViewDialog />
      <SearchDialog />
      <AccountDialog />
    </div>
  );
}
