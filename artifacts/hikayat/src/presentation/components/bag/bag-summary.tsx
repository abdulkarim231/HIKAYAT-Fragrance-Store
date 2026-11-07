import type { ReactNode } from 'react';
import { useLocale } from '@/application/locale-provider';
import { useCart } from '@/application/cart-provider';

export function BagSummary({ subtotal, savings, children }: { subtotal: number; savings: number; children?: ReactNode }) {
  const { t, formatPrice } = useLocale();
  const { count } = useCart();
  return (
    <aside className="rounded-sm bg-olive p-7 text-ivory md:sticky md:top-32" aria-label={t('bag.summary')}>
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-3xl">{t('bag.summary')}</h2>
        <span className="text-xs text-ivory/60">{t('bag.items', { count })}</span>
      </div>
      <div className="hairline my-6" />
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between gap-4"><dt className="text-ivory/70">{t('bag.subtotal')}</dt><dd className="tabular-nums" data-testid="text-subtotal">{formatPrice(subtotal)}</dd></div>
        {savings > 0 && <div className="flex justify-between gap-4 text-gold"><dt>{t('bag.savings')}</dt><dd className="tabular-nums" data-testid="text-savings">{formatPrice(savings)}</dd></div>}
        <div className="flex justify-between gap-4"><dt className="text-ivory/70">{t('bag.shipping')}</dt><dd className="text-end text-xs text-ivory/60">{t('bag.shippingNote')}</dd></div>
      </dl>
      <div className="hairline my-6" />
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-ivory/70">{t('bag.subtotal')}</span>
        <span className="font-display text-3xl tabular-nums">{formatPrice(subtotal)}</span>
      </div>
      {children && <div className="mt-7">{children}</div>}
    </aside>
  );
}
