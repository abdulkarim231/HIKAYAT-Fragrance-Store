import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { useLocale } from '@/application/locale-provider';
import { useCatalog } from '@/application/use-catalog';
import type { MessageKey } from '@/i18n/messages';
import { Reveal } from '@/presentation/components/common/reveal';
import { container } from '@/presentation/components/common/styles';
import { ProductGrid } from '@/presentation/components/product/product-grid';

interface Props {
  id?: string;
  title: MessageKey;
  body?: MessageKey;
  bestSellersOnly?: boolean;
  exclude?: 'bestSellers';
  limit?: number;
}

export function ProductRail({ id, title, body, bestSellersOnly, exclude, limit = 4 }: Props) {
  const { t } = useLocale();
  const { items, isLoading, isError, refetch } = useCatalog({ bestSellersOnly, sort: 'featured' });
  const list = (exclude === 'bestSellers' ? items.filter((p) => !p.bestSeller) : items).slice(0, limit);

  return (
    <section id={id} className={`${container} scroll-mt-28 py-20 md:py-28`} aria-labelledby={`${title}-h`}>
      <Reveal className="mb-12 flex items-end justify-between gap-6 border-b border-gold/30 pb-6">
        <div>
          <h2 id={`${title}-h`} className="font-display text-[clamp(2.2rem,4.4vw,3.8rem)] leading-none text-olive">{t(title)}</h2>
          {body && <p className="mt-3 text-sm text-muted-foreground">{t(body)}</p>}
        </div>
        <Link href="/shop" className="group inline-flex min-h-11 shrink-0 items-center gap-2 text-sm text-olive" data-testid={`link-viewall-${id ?? title}`}>
          {t('home.viewAll')}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" strokeWidth={1.5} />
        </Link>
      </Reveal>
      <ProductGrid products={list} isLoading={isLoading} isError={isError} onRetry={() => refetch()} skeletonCount={4} />
    </section>
  );
}
