import { Link } from 'wouter';
import { useLocale } from '@/application/locale-provider';
import { useUI } from '@/application/ui-provider';
import { container } from '@/presentation/components/common/styles';
import { NAV_ITEMS } from './nav-items';

export function Footer() {
  const { t, locale, setLocale } = useLocale();
  const { setAccountOpen, setSearchOpen } = useUI();
  const linkCls = 'inline-flex min-h-10 items-center text-sm text-ivory/70 transition-colors hover:text-gold';

  return (
    <footer className="relative mt-auto overflow-hidden bg-olive text-ivory">
      <div className={`${container} grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:py-20`}>
        <div>
          <p className="logo-mark text-3xl">HIKAYAT</p>
          <p className="font-display mt-3 text-xl text-gold">{t('brand.tagline')}</p>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-ivory/65">{t('footer.about')}</p>
        </div>
        <div>
          <h3 className="eyebrow mb-4 text-gold">{t('footer.shop')}</h3>
          <ul>
            {NAV_ITEMS.slice(1).map((n) => (
              <li key={n.href}><Link href={n.href} className={linkCls} data-testid={`link-footer-${n.testId}`}>{t(n.key)}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="eyebrow mb-4 text-gold">{t('footer.help')}</h3>
          <ul>
            <li><Link href="/wishlist" className={linkCls} data-testid="link-footer-wishlist">{t('nav.wishlist')}</Link></li>
            <li><Link href="/bag" className={linkCls} data-testid="link-footer-bag">{t('nav.bag')}</Link></li>
            <li><button type="button" onClick={() => setSearchOpen(true)} className={linkCls} data-testid="button-footer-search">{t('nav.search')}</button></li>
            <li><button type="button" onClick={() => setAccountOpen(true)} className={linkCls} data-testid="button-footer-account">{t('nav.account')}</button></li>
          </ul>
        </div>
        <div>
          <h3 className="eyebrow mb-4 text-gold">{t('footer.language')}</h3>
          <div className="inline-flex rounded-full border border-ivory/25 p-1" role="group" aria-label={t('footer.language')}>
            {(['en', 'ar'] as const).map((l) => (
              <button
                key={l}
                type="button"
                lang={l}
                aria-pressed={locale === l}
                onClick={() => setLocale(l)}
                className={`min-h-10 rounded-full px-4 text-sm transition-colors ${locale === l ? 'bg-ivory text-olive' : 'text-ivory/70 hover:text-ivory'}`}
                data-testid={`button-footer-lang-${l}`}
              >
                {l === 'en' ? 'English' : 'العربية'}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className={`${container} border-t border-ivory/10 py-6 text-xs text-ivory/50 sm:flex sm:justify-between sm:gap-6`}>
        <p>{t('footer.demo')}</p>
        <p className="mt-2 sm:mt-0">© {new Date().getFullYear()} {t('footer.rights')}</p>
      </div>
      <p aria-hidden className="logo-mark pointer-events-none select-none whitespace-nowrap text-center text-[13vw] leading-[0.8] text-ivory/[0.04]">HIKAYAT</p>
    </footer>
  );
}
