import { useRef, useState } from 'react';
import { useCreateCheckout } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { CircleAlert, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocale } from '@/application/locale-provider';
import { useAuth } from '@/application/auth-provider';
import { useCart } from '@/application/cart-provider';
import { useBag } from '@/application/use-catalog';
import { container, btnGhost, btnPrimary } from '@/presentation/components/common/styles';
import { EmptyState, ErrorState } from '@/presentation/components/common/states';
import { BagLine } from '@/presentation/components/bag/bag-line';
import { BagSummary } from '@/presentation/components/bag/bag-summary';
import { DeliveryForm, type DeliveryInfo } from '@/presentation/components/checkout/delivery-form';

export default function CheckoutPage() {
  const { t, locale } = useLocale();
  const auth = useAuth();
  const { lines } = useCart();
  const { resolved, subtotal, savings, isLoading, isError, refetch } = useBag();
  const [reviewed, setReviewed] = useState<DeliveryInfo | null>(null);
  const [draft, setDraft] = useState<DeliveryInfo | undefined>();
  const checkout = useCreateCheckout();
  const request = useRef<{ fingerprint: string; id: string } | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const cancelled = new URLSearchParams(window.location.search).get('payment') === 'cancelled';

  async function pay() {
    if (!reviewed || !auth.user || checkout.isPending) return;
    setPaymentError(null);
    const fingerprint = JSON.stringify([auth.user.id, locale, lines, reviewed]);
    if (request.current?.fingerprint !== fingerprint) request.current = { fingerprint, id: crypto.randomUUID() };
    try {
      const result = await checkout.mutateAsync({
        data: { requestId: request.current.id, locale, items: lines, delivery: reviewed },
      });
      const url = new URL(result.url, window.location.origin);
      if (url.origin !== 'https://checkout.stripe.com' && url.origin !== window.location.origin) throw new Error('invalid_redirect');
      window.location.assign(url.href);
    } catch (error) {
      const code = error && typeof error === 'object' && 'data' in error
        ? (error.data as { code?: string } | null)?.code : null;
      if (code === 'catalog_changed') {
        request.current = null;
        await refetch();
        setPaymentError(t('checkout.catalogChanged'));
      } else if (code === 'unauthorized') {
        await auth.refresh();
        setPaymentError(t('checkout.signInRequired'));
      } else {
        setPaymentError(t('checkout.paymentError'));
      }
    }
  }

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
      {cancelled && <p role="status" className="mt-5 text-sm text-olive">{t('checkout.cancelled')}</p>}
      {paymentError && <p role="alert" className="mt-5 border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{paymentError}</p>}

      <div className="mt-10 grid gap-10 md:grid-cols-[1fr_380px] md:gap-14">
        <section>
          <h2 className="font-display mb-6 text-3xl text-olive">{t('checkout.delivery')}</h2>
          {auth.loading ? <Skeleton className="h-48 bg-olive/8" /> : !auth.user ? (
            <div className="rounded-sm border border-olive/20 bg-card p-6">
              <p className="mb-5 text-sm text-charcoal/80">{t('checkout.signInRequired')}</p>
              <Link href="/login?next=checkout" className={btnPrimary} data-testid="link-checkout-login">{t('checkout.signIn')}</Link>
              {auth.checkingError && <button type="button" className={`${btnGhost} mt-3`} onClick={() => void auth.refresh()}>{t('checkout.retry')}</button>}
            </div>
          ) : reviewed ? (
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
                <button type="button" disabled={checkout.isPending} onClick={() => { setDraft(reviewed); setReviewed(null); }} className={btnGhost} data-testid="button-edit-details">{t('checkout.edit')}</button>
                <button type="button" onClick={() => void pay()} disabled={checkout.isPending} className={btnPrimary} data-testid="button-place-order">{t(checkout.isPending ? 'checkout.connecting' : 'checkout.pay')}</button>
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
