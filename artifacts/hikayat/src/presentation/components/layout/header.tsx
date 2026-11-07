import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Heart, Search, ShoppingBag, User } from 'lucide-react';
import { useLocale } from '@/application/locale-provider';
import { useCart } from '@/application/cart-provider';
import { useWishlist } from '@/application/wishlist-provider';
import { useUI } from '@/application/ui-provider';
import { cn } from '@/lib/utils';
import { container, iconBtn } from '@/presentation/components/common/styles';
import { NAV_ITEMS } from './nav-items';
import { MobileMenu } from './mobile-menu';

export function Header() {
  const { t, toggleLocale } = useLocale();
  const { count } = useCart();
  const wishlist = useWishlist();
  const { setSearchOpen } = useUI();
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={cn('sticky top-0 z-40 transition-[background-color,box-shadow] duration-500', scrolled ? 'bg-background/92 shadow-[0_1px_0_hsl(var(--gold)/0.35)] backdrop-blur-md' : 'bg-background')}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-olive focus:px-4 focus:py-2 focus:text-ivory">
        {t('nav.skip')}
      </a>
      <div className="bg-olive text-ivory">
        <p className={`${container} py-2 text-center text-[11px] tracking-[0.22em] uppercase text-ivory/80 rtl:tracking-normal rtl:text-xs`}>{t('brand.tagline')}</p>
      </div>
      <div className={`${container} flex h-[72px] items-center gap-2`}>
        <MobileMenu />
        <Link href="/" className="logo-mark me-auto text-xl text-olive sm:text-2xl lg:me-0" data-testid="link-logo">HIKAYAT</Link>

        <nav aria-label="Primary" className="mx-auto hidden lg:block">
          <ul className="flex items-center gap-7">
            {NAV_ITEMS.map((item) => {
              const active = item.href === '/' ? location === '/' : location === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn('relative py-2 text-[13px] tracking-wide text-charcoal/80 transition-colors hover:text-olive', active && 'text-olive')}
                    data-testid={`link-nav-${item.testId}`}
                  >
                    {t(item.key)}
                    <span className={cn('absolute inset-x-0 -bottom-0.5 h-px origin-center bg-gold transition-transform duration-500', active ? 'scale-x-100' : 'scale-x-0')} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center">
          <button type="button" onClick={toggleLocale} aria-label={t('lang.switchLabel')} className="hidden h-11 items-center rounded-full px-3 text-[13px] text-olive hover:bg-olive/8 sm:inline-flex" data-testid="button-language">
            {t('lang.switch')}
          </button>
          <button type="button" className={iconBtn} onClick={() => setSearchOpen(true)} aria-label={t('nav.search')} data-testid="button-search">
            <Search className="h-[19px] w-[19px]" strokeWidth={1.5} />
          </button>
          <Link href="/login" className={cn(iconBtn, 'hidden sm:inline-flex')} aria-label={t('nav.account')} data-testid="button-account">
            <User className="h-[19px] w-[19px]" strokeWidth={1.5} />
          </Link>
          <Link href="/wishlist" className={cn(iconBtn, 'hidden sm:inline-flex')} aria-label={t('nav.wishlistCount', { count: wishlist.count })} data-testid="link-wishlist">
            <Heart className="h-[19px] w-[19px]" strokeWidth={1.5} />
            {wishlist.count > 0 && <span className="absolute end-2 top-2 h-1.5 w-1.5 rounded-full bg-gold" />}
          </Link>
          <Link href="/bag" className={iconBtn} aria-label={t('nav.bagCount', { count })} data-testid="link-bag">
            <ShoppingBag className="h-[19px] w-[19px]" strokeWidth={1.5} />
            <span
              key={count}
              className={cn('absolute -end-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-medium tabular-nums', count > 0 ? 'bump bg-olive text-ivory' : 'bg-sage/50 text-olive')}
              data-testid="text-bag-count"
              aria-hidden
            >
              {count}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
