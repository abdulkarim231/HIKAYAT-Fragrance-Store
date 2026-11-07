import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Heart, Menu, User } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useLocale } from '@/application/locale-provider';
import { useWishlist } from '@/application/wishlist-provider';
import { cn } from '@/lib/utils';
import { iconBtn } from '@/presentation/components/common/styles';
import { NAV_ITEMS } from './nav-items';

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const { t, dir, toggleLocale } = useLocale();
  const wishlist = useWishlist();
  const [location] = useLocation();
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button type="button" className={cn(iconBtn, 'lg:hidden -ms-2')} aria-label={t('nav.menu')} data-testid="button-menu">
          <Menu className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </SheetTrigger>
      <SheetContent side={dir === 'rtl' ? 'right' : 'left'} dir={dir} className="flex w-[86vw] max-w-sm flex-col border-gold/30 bg-olive p-0 text-ivory [&>button]:text-ivory">
        <div className="px-7 pt-8">
          <SheetTitle className="logo-mark text-2xl text-ivory">HIKAYAT</SheetTitle>
          <SheetDescription className="mt-1 text-xs text-ivory/60">{t('brand.tagline')}</SheetDescription>
        </div>
        <nav aria-label="Mobile" className="mt-10 flex-1 px-7">
          <ul className="flex flex-col">
            {NAV_ITEMS.map((item, i) => (
              <li key={item.href} className="rise border-b border-ivory/10" style={{ ['--d' as string]: `${i * 60}ms` }}>
                <Link
                  href={item.href}
                  onClick={close}
                  aria-current={location === item.href ? 'page' : undefined}
                  className={cn('font-display flex min-h-14 items-center text-2xl text-ivory/85 hover:text-gold', location === item.href && 'text-gold')}
                  data-testid={`link-mobile-${item.testId}`}
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="grid gap-1 border-t border-ivory/10 px-7 py-6 text-sm">
          <Link href="/wishlist" onClick={close} className="flex min-h-11 items-center gap-3 text-ivory/80 hover:text-gold" data-testid="link-mobile-wishlist">
            <Heart className="h-4 w-4" strokeWidth={1.5} /> {t('nav.wishlist')} ({wishlist.count})
          </Link>
          <Link href="/login" onClick={close} className="flex min-h-11 items-center gap-3 text-start text-ivory/80 hover:text-gold" data-testid="button-mobile-account">
            <User className="h-4 w-4" strokeWidth={1.5} /> {t('nav.account')}
          </Link>
          <button type="button" onClick={toggleLocale} aria-label={t('lang.switchLabel')} className="mt-2 inline-flex min-h-11 w-fit items-center rounded-full border border-ivory/30 px-5 text-ivory hover:border-gold" data-testid="button-mobile-language">
            {t('lang.switch')}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
