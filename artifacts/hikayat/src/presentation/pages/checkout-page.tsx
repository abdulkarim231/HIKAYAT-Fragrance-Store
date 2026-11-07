import { useState } from 'react';
import { Link } from 'wouter';
import { CircleAlert, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocale } from '@/application/locale-provider';
import { useBag } from '@/application/use-catalog';
import { container, btnGhost, btnPrimary } from '@/presentation/components/common/styles';
import { EmptyState, ErrorState } from '@/presentation/components/common/states';
import { BagLine } from '@/presentation/components/bag/bag-line';
import { BagSummary } from '@/presentation/components/bag/bag-summary';
import { DeliveryForm, type DeliveryInfo } from '@/presentation/components/checkout/delivery-form';

export default function CheckoutPage() {
  const { t } = useLocale();
  const { resolved, subtotal, savings, isLoading, isError, refetch } = useBag();
  const [reviewed, setReviewed] = useState<DeliveryInfo | null>(null);
  const [draft, setDraft] = useState<DeliveryInfo | undefined>();

  if (isLoading) return <div className={`${container} py-16`}><Skeleton className="h-96 w-full bg-olive/8" /></div>;
  if (isError) return <div className={`${container} py-16`}><ErrorState onRetry={() => refetch()} /></div>;
  if (resolved.length === 0) {
    return <EmptyState testId="state-checkout-empty" title={t('checkout.emptyTitle')} body={t('bag.emptyBody')}
      action={<Link href="/shop" className={btnPrimary} data-testid="link-checkout-shop">{t('hero.explore')}</Link>} />;
  }

  return (
    <div className={`${container} py-12 md:py-16`}>
      <Link href="/bag" className="inline-flex min-h-11 items-center text-sm text-olive underline decoration-gold underline-offset-4" data-testid="link-back-bag">{t('checkout.backToBag')}</Link>
      <h1 className="font-display rise mt-2 text-[clamp(2.8rem,6vw,5rem)] leading-none text-olive">{t('checkout.title')}</h1>

      <div role="note" className="mt-8 flex gap-4 rounded-sm border border-gold/50 bg-[hsl(38_45%_88%)] p-5" data-testid="status-checkout-notice">
        <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-olive" strokeWidth={1.5} />
        <div>
          <p className="font-medium text-olive">{t('checkout.noticeTitle')}</p>
          <p className="mt-1 text-sm leading-relaxed text-charcoal/80">{t('checkout.notice')}</p>
        </div>
      </div>

      <div className="mt-10 grid gap-10 md:grid-cols-[1fr_380px] md:gap-14">
        <section>
          <h2 className="font-display mb-6 text-3xl text-olive">{t('checkout.delivery')}</h2>
          {reviewed ? (
            <div className="rise rounded-sm border border-olive/20 bg-card p-6" aria-live="polite" data-testid="status-review">
              <div className="flex items-center gap-3 text-olive">
                <CheckCircle2 className="h-5 w-5" strokeWidth={1.5} />
                <h3 className="font-display text-2xl">{t('checkout.reviewTitle')}</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-charcoal/80">{t('checkout.reviewBody', { name: reviewed.fullName })}</p>
              <dl className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
                <div><dt className="text-xs text-muted-foreground">{t('checkout.phone')}</dt><dd dir="ltr" className="text-start">{reviewed.phone}</dd></div>
                <div><dt className="text-xs text-muted-foreground">{t('checkout.email')}</dt><dd className="break-all">{reviewed.email}</dd></div>
                <div className="sm:col-span-2"><dt className="text-xs text-muted-foreground">{t('checkout.address')}</dt><dd>{reviewed.address}, {reviewed.city}</dd></div>
              </dl>
              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" onClick={() => { setDraft(reviewed); setReviewed(null); }} className={btnGhost} data-testid="button-edit-details">{t('checkout.edit')}</button>
                <button type="button" disabled aria-disabled className={btnPrimary} data-testid="button-place-order">{t('checkout.placeOrderDisabled')}</button>
              </div>
            </div>
          ) : (
            <DeliveryForm defaultValues={draft} onReview={setReviewed} />
          )}
        </section>
        <div className="space-y-6">
          <BagSummary subtotal={subtotal} savings={savings} />
          <ul className="divide-y divide-gold/25 border-y border-gold/25">
            {resolved.map((l) => <BagLine key={l.product.id} line={l} editable={false} />)}
          </ul>
        </div>
      </div>
    </div>
  );
}
