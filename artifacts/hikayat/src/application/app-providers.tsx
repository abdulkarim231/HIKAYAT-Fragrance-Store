import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LocaleProvider } from './locale-provider';
import { CartProvider } from './cart-provider';
import { WishlistProvider } from './wishlist-provider';
import { UIProvider } from './ui-provider';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } });

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <CartProvider>
          <WishlistProvider>
            <UIProvider>
              <TooltipProvider>{children}</TooltipProvider>
            </UIProvider>
          </WishlistProvider>
        </CartProvider>
      </LocaleProvider>
    </QueryClientProvider>
  );
}
