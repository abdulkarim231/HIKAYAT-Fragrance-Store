import { useEffect, useState } from 'react';
import { Link, useParams, useSearch } from 'wouter';
import { Search, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useLocale } from '@/application/locale-provider';
import { useCatalog } from '@/application/use-catalog';
import { isCategory, SORT_KEYS, type SortKey, isSortKey } from '@/domain/product';
import type { MessageKey } from '@/i18n/messages';
import { container, btnGhost } from '@/presentation/components/common/styles';
import { EmptyState } from '@/presentation/components/common/states';
import { ProductGrid } from '@/presentation/components/product/product-grid';
import { cn } from '@/lib/utils';

const FILTERS: { href: string; key: MessageKey; value: string | null }[] = [
  { href: '/shop', key: 'shop.all', value: null },
  { href: '/shop/men', key: 'shop.men', value: 'men' },
  { href: '/shop/women', key: 'shop.women', value: 'women' },
  { href: '/shop/unisex', key: 'shop.unisex', value: 'unisex' },
];

const TITLES: Record<string, MessageKey> = { men: 'nav.men', women: 'nav.women', unisex: 'nav.unisex' };

export default function ShopPage() {
  const params = useParams<{ category?: string }>();
  const searchString = useSearch();
  const { t, dir } = useLocale();
  const category = isCategory(params.category) ? params.category : null;

  const urlQ = new URLSearchParams(searchString).get('q') ?? '';
  const [search, setSearch] = useState(urlQ);
  const [sort, setSort] = useState<SortKey>('featured');
  const [bestOnly, setBestOnly] = useState(false);
  useEffect(() => setSearch(urlQ), [urlQ]);

  const { items, isLoading, isError, refetch } = useCatalog({ category, search, sort, bestSellersOnly: bestOnly });
  const hasFilters = !!search || bestOnly || !!category;
  const reset = () => { setSearch(''); setBestOnly(false); setSort('featured'); };

  return (
    <div className="pb-24">
      <section className="border-b border-gold/30 bg-[hsl(39_36%_90%)]">
        <div className={`${container} py-14 md:py-20`}>
          <p className="eyebrow rise text-gold">HIKAYAT</p>
          <h1 className="font-display rise mt-3 text-[clamp(2.8rem,7vw,5.6rem)] leading-none text-olive" style={{ ['--d' as string]: '100ms' }} data-testid="text-shop-title">
            {category ? t(TITLES[category]) : t('shop.title')}
          </h1>
          {urlQ && <p className="mt-4 text-sm text-muted-foreground">{t('shop.searchingFor', { q: urlQ })}</p>}
        </div>
      </section>

      <div className={`${container} sticky top-[108px] z-30 -mt-px border-b border-gold/20 bg-background/95 py-4 backdrop-blur`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <nav aria-label={t('shop.filters')} className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
            {FILTERS.map((f) => {
              const active = f.value === category;
              return (
                <Link key={f.href} href={f.href} aria-current={active ? 'page' : undefined}
                  className={cn('inline-flex min-h-11 shrink-0 items-center rounded-full border px-5 text-sm transition-colors', active ? 'border-olive bg-olive text-ivory' : 'border-olive/20 text-olive hover:border-olive')}
                  data-testid={`link-filter-${f.value ?? 'all'}`}>
                  {t(f.key)}
                </Link>
              );
            })}
          </nav>
          <div className="flex flex-wrap items-center gap-3">
            <label className="relative flex min-w-0 flex-1 items-center sm:w-72 sm:flex-none">
              <span className="sr-only">{t('shop.searchLabel')}</span>
              <Search className="pointer-events-none absolute start-4 h-4 w-4 text-gold" strokeWidth={1.5} />
              <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('shop.searchPlaceholder')}
                className="h-11 w-full rounded-full border border-olive/20 bg-card ps-10 pe-10 text-sm placeholder:text-muted-foreground/70 focus:border-olive focus:outline-none" data-testid="input-shop-search" />
              {search && (
                <button type="button" onClick={() => setSearch('')} aria-label={t('common.close')} className="absolute end-1 inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:text-olive" data-testid="button-clear-search">
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>
            <Select value={sort} onValueChange={(v) => isSortKey(v) && setSort(v)} dir={dir}>
              <SelectTrigger className="h-11 w-[190px] rounded-full border-olive/20 bg-card" aria-label={t('shop.sort')} data-testid="select-sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_KEYS.map((k) => (
                  <SelectItem key={k} value={k} data-testid={`option-sort-${k}`}>{t(`shop.sort.${k}` as MessageKey)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-2.5 text-sm text-olive">
              <Switch checked={bestOnly} onCheckedChange={setBestOnly} data-testid="switch-bestsellers" />
              {t('shop.bestOnly')}
            </label>
          </div>
        </div>
      </div>

      <div className={`${container} pt-8`}>
        {!isLoading && !isError && (
          <p className="mb-8 text-xs uppercase tracking-[0.2em] text-muted-foreground rtl:tracking-normal" aria-live="polite" data-testid="text-result-count">
            {items.length === 1 ? t('shop.resultsOne') : t('shop.results', { count: items.length })}
          </p>
        )}
        <ProductGrid
          products={items}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
          empty={
            <EmptyState testId="state-shop-empty" title={t('shop.emptyTitle')} body={t('shop.emptyBody')}
              action={hasFilters ? (
                category ? <Link href="/shop" onClick={reset} className={btnGhost} data-testid="link-clear-filters">{t('shop.clear')}</Link>
                  : <button type="button" onClick={reset} className={btnGhost} data-testid="button-clear-filters">{t('shop.clear')}</button>
              ) : undefined} />
          }
        />
      </div>
    </div>
  );
}
