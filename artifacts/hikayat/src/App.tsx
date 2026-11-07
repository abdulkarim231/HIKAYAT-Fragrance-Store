import { type ReactNode } from 'react';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { AppProviders } from '@/application/app-providers';
import { SiteShell } from '@/presentation/components/layout/site-shell';
import HomePage from '@/presentation/pages/home-page';
import ShopPage from '@/presentation/pages/shop-page';
import ProductPage from '@/presentation/pages/product-page';
import BagPage from '@/presentation/pages/bag-page';
import CheckoutPage from '@/presentation/pages/checkout-page';
import WishlistPage from '@/presentation/pages/wishlist-page';
import NotFound from '@/pages/not-found';

function Router() {
  return (
    // Shared shell stays outside the boundary so it survives a page crash.
    <SiteShell>
      <RoutedErrorBoundary>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/shop/:category?" component={ShopPage} />
          <Route path="/product/:id" component={ProductPage} />
          <Route path="/bag" component={BagPage} />
          <Route path="/checkout" component={CheckoutPage} />
          <Route path="/wishlist" component={WishlistPage} />
          <Route component={NotFound} />
        </Switch>
      </RoutedErrorBoundary>
    </SiteShell>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <AppProviders>
      <WouterRouter base={process.env.NEXT_PUBLIC_BASE_PATH ?? ''}>
        <Router />
      </WouterRouter>
      <Toaster />
    </AppProviders>
  );
}

export default App;
