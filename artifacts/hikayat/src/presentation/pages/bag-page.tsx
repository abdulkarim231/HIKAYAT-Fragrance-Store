import { Link } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocale } from '@/application/locale-provider';
import { useBag } from '@/application/use-catalog';
import { container, btnOnDark, btnPrimary } from '@/presentation/components/common/styles';
import { EmptyState, ErrorState } from '@/presentation/components/common/states';
import { BagLine } from '@/presentation/components/bag/bag-line';
import { BagSummary } from '@/presentation/components/bag/bag-summary';

export default function BagPage() {
  const { t } = useLocale();
  const { resolved, subtotal, savings, isLoading, isError, refetch } = useBag();

  return (
    <div className={`${container} py-12 md:py-16`}>
      <h1 className="font-display rise text-[clamp(2.8rem,6vw,5rem)] leading-none text-olive">{t('bag.title')}</h1>
      <div className="mt-10">
        {isLoading ? (
          <div className="space-y-4">{[0, 1].map((i) => <Skeleton key={i} className="h-36 w-full bg-olive/8" />)}</div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : resolved.length === 0 ? (
          <EmptyState testId="state-bag-empty" title={t('bag.empty')} body={t('bag.emptyBody')}
            action={<Link href="/shop" className={btnPrimary} data-testid="link-bag-continue">{t('hero.explore')}</Link>} />
        ) : (
          <div className="grid gap-10 md:grid-cols-[1fr_380px] md:gap-14">
            <div>
              <ul className="divide-y divide-gold/25 border-y border-gold/25">
                {resolved.map((l) => <BagLine key={l.product.id} line={l} />)}
              </ul>
              <Link href="/shop" className="mt-6 inline-flex min-h-11 items-center text-sm text-olive underline decoration-gold underline-offset-4" data-testid="link-continue-shopping">
                {t('bag.continue')}
              </Link>
            </div>
            <BagSummary subtotal={subtotal} savings={savings}>
              <Link href="/checkout" className={`${btnOnDark} w-full`} data-testid="link-checkout">{t('bag.checkout')}</Link>
            </BagSummary>
          </div>
        )}
      </div>
    </div>
  );
}
