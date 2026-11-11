import { useEffect } from 'react';
import { Link } from 'wouter';
import { CheckCircle2, CircleAlert } from 'lucide-react';
import { useGetPaymentOrder } from '@workspace/api-client-react';
import { useLocale } from '@/application/locale-provider';
import { useAuth } from '@/application/auth-provider';
import { useCart } from '@/application/cart-provider';
import { container, btnPrimary, btnGhost } from '@/presentation/components/common/styles';
import { Skeleton } from '@/components/ui/skeleton';

export default function PaymentResultPage() {
  const { t, formatPrice } = useLocale();
  const { user, loading } = useAuth();
  const { completeOrder } = useCart();
  const session = new URLSearchParams(window.location.search).get('session_id') ?? '';
  const validSession = /^cs_test_[A-Za-z0-9_]{1,250}$/.test(session);
  const order = useGetPaymentOrder({ session_id: session }, {
    query: {
      queryKey: ['payment-order', user?.id, session],
      enabled: !!user && validSession,
      retry: false,
      staleTime: 0,
      refetchOnMount: 'always',
      refetchOnWindowFocus: true,
      refetchInterval: (query) => query.state.data?.status === 'pending' ? 5000 : false,
    },
  });
  const paid = !!user && order.data?.status === 'paid';

  useEffect(() => {
    document.title = `${t('checkout.confirmTitle')} — HIKAYAT`;
  }, [t]);
  useEffect(() => {
    if (user && order.data?.status === 'paid') completeOrder(order.data.id, order.data.items);
  }, [user, order.data, completeOrder]);

  return (
    <section className={`${container} py-16 md:py-24`} aria-live="polite">
      <div className="mx-auto max-w-xl border border-gold/40 bg-card p-7 text-center sm:p-12">
        {paid ? <CheckCircle2 className="mx-auto h-10 w-10 text-olive" strokeWidth={1.25} /> : <CircleAlert className="mx-auto h-10 w-10 text-gold" strokeWidth={1.25} />}
        <p className="mt-5 text-xs uppercase tracking-[0.2em] text-gold">{t('checkout.noticeTitle')}</p>
        <h1 className="font-display mt-4 text-4xl text-olive">{t(paid ? 'checkout.paidTitle' : 'checkout.confirmTitle')}</h1>
        {loading || (user && order.isLoading) ? <Skeleton className="mt-6 h-20 bg-olive/8" /> : (
          <p className="mt-5 text-sm leading-7 text-muted-foreground">{t(!user ? 'checkout.signInRequired' : !validSession || order.isError ? 'checkout.verifyError' : paid ? 'checkout.paidBody' : 'checkout.pendingBody')}</p>
        )}
        {user && order.data && (
          <dl className="mt-6 border-y border-gold/25 py-5 text-sm">
            <dt className="text-muted-foreground">{t('checkout.orderNumber')}</dt>
            <dd className="mt-1 break-all font-mono text-xs text-olive">{order.data.id}</dd>
            <dt className="mt-4 text-muted-foreground">{t('bag.subtotal')}</dt>
            <dd className="mt-1 text-lg text-olive">{formatPrice(order.data.total)}</dd>
          </dl>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {!loading && !user ? <Link href={`/login?next=payment&session_id=${encodeURIComponent(session)}`} className={btnPrimary}>{t('checkout.signIn')}</Link>
            : order.isError && <button className={btnGhost} onClick={() => void order.refetch()}>{t('checkout.retry')}</button>}
          <Link href="/shop" className={btnPrimary}>{t('login.continue')}</Link>
        </div>
      </div>
    </section>
  );
}
