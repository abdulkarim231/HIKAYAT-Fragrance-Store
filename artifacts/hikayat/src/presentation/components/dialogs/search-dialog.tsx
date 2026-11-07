import { useMemo, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Search } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { useUI } from '@/application/ui-provider';
import { useLocale } from '@/application/locale-provider';
import { useProducts } from '@/application/use-catalog';
import { queryCatalog } from '@/domain/catalog';
import type { Localized } from '@/domain/product';

const SUGGESTIONS: Localized[] = [
  { en: 'Oud', ar: 'عود' }, { en: 'Rose', ar: 'ورد' }, { en: 'Musk', ar: 'مسك' },
  { en: 'Vetiver', ar: 'فيتيفر' }, { en: 'Amber', ar: 'عنبر' }, { en: 'Jasmine', ar: 'ياسمين' },
];

export function SearchDialog() {
  const { searchOpen, setSearchOpen } = useUI();
  const { t, pick, locale, dir, formatPrice } = useLocale();
  const { data } = useProducts();
  const [q, setQ] = useState('');
  const [, navigate] = useLocation();
  const results = useMemo(() => (data && q.trim() ? queryCatalog(data, { search: q }, locale).slice(0, 6) : []), [data, q, locale]);

  const close = () => { setSearchOpen(false); setQ(''); };
  const submit = () => { if (!q.trim()) return; navigate(`/shop?q=${encodeURIComponent(q.trim())}`); close(); };

  return (
    <Dialog open={searchOpen} onOpenChange={(o) => (o ? setSearchOpen(true) : close())}>
      <DialogContent dir={dir} className="top-[12%] w-[calc(100vw-1.5rem)] max-w-2xl translate-y-0 rounded-sm border-gold/30 bg-background p-0 sm:rounded-sm" data-testid="dialog-search">
        <DialogTitle className="sr-only">{t('search.title')}</DialogTitle>
        <DialogDescription className="sr-only">{t('search.hint')}</DialogDescription>
        <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex items-center gap-3 border-b border-gold/30 px-5">
          <Search className="h-5 w-5 shrink-0 text-gold" strokeWidth={1.5} />
          <input
            autoFocus
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('shop.searchPlaceholder')}
            aria-label={t('shop.searchLabel')}
            className="font-display h-16 w-full bg-transparent text-xl text-olive placeholder:text-muted-foreground/60 focus:outline-none sm:text-2xl"
            data-testid="input-search"
          />
        </form>
        <div className="max-h-[60dvh] overflow-y-auto p-5">
          {!q.trim() ? (
            <>
              <p className="eyebrow mb-3 text-muted-foreground">{t('search.suggestions')}</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s.en} type="button" onClick={() => setQ(pick(s))} className="min-h-10 rounded-full border border-olive/20 px-4 text-sm text-olive hover:border-olive hover:bg-olive/5" data-testid={`button-suggestion-${s.en.toLowerCase()}`}>
                    {pick(s)}
                  </button>
                ))}
              </div>
            </>
          ) : results.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground" data-testid="text-search-empty">{t('search.none', { q })}</p>
          ) : (
            <>
              <ul className="divide-y divide-gold/20">
                {results.map((p) => (
                  <li key={p.id}>
                    <Link href={`/product/${p.id}`} onClick={close} className="flex items-center gap-4 py-3 transition-colors hover:bg-olive/[0.03]" data-testid={`link-search-result-${p.id}`}>
                      <img src={p.image} alt="" className="h-16 w-14 rounded-sm object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="font-display truncate text-xl text-olive">{pick(p.name)}</p>
                        <p className="truncate text-xs text-muted-foreground">{pick(p.family)} · {t(`cat.${p.category}`)}</p>
                      </div>
                      <span className="text-sm">{formatPrice(p.price)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={submit} className="mt-4 min-h-11 text-sm text-olive underline decoration-gold underline-offset-4" data-testid="button-search-all">
                {t('search.seeAll')}
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
