import { useLocale } from '@/application/locale-provider';
import { discountPercent } from '@/domain/cart';
import type { Product } from '@/domain/product';
import { cn } from '@/lib/utils';

export function PriceTag({ product, size = 'sm' }: { product: Product; size?: 'sm' | 'lg' }) {
  const { formatPrice, t } = useLocale();
  const pct = discountPercent(product);
  return (
    <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1" data-testid={`text-price-${product.id}`}>
      <span className={cn('font-medium text-charcoal', size === 'lg' ? 'text-2xl' : 'text-[15px]')}>{formatPrice(product.price)}</span>
      {product.compareAtPrice && pct && (
        <>
          <span className={cn('text-muted-foreground line-through', size === 'lg' ? 'text-base' : 'text-xs')}>
            <span className="sr-only">{t('product.was', { price: '' })}</span>
            {formatPrice(product.compareAtPrice)}
          </span>
          <span className="text-[11px] font-medium uppercase tracking-wider text-gold">{t('product.off', { pct })}</span>
        </>
      )}
    </div>
  );
}
