import { useMemo } from 'react';
import { Link } from 'wouter';
import { useLocale } from '@/application/locale-provider';
import { useProducts } from '@/application/use-catalog';
import { useWishlist } from '@/application/wishlist-provider';
import { useCart } from '@/application/cart-provider';
import { useToast } from '@/hooks/use-toast';
import { container, btnGhost, btnPrimary } from '@/presentation/components/common/styles';
import { EmptyState } from '@/presentation/components/common/states';
import { ProductGrid } from '@/presentation/components/product/product-grid';

export default function WishlistPage() {
  const { t } = useLocale();
  const { ids, clear } = useWishlist();
  const cart = useCart();
  const { toast } = useToast();
  const { data, isLoading, isError, refetch } = useProducts();
  const saved = useMemo(() => (data ? ids.flatMap((id) => data.filter((p) => p.id === id)) : []), [data, ids]);

  const addAll = () => {
    saved.forEach((p) => cart.add(p.id, 1));
    toast({ title: t('toast.added'), description: t('bag.items', { count: saved.length }) });
  };

  return (
    <div className={`${container} py-12 md:py-16`}>
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="font-display rise text-[clamp(2.8rem,6vw,5rem)] leading-none text-olive">{t('wishlist.title')}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{t('wishlist.body')}</p>
        </div>
        {saved.length > 0 && (
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={clear} className={btnGhost} data-testid="button-wishlist-clear">{t('wishlist.clear')}</button>
            <button type="button" onClick={addAll} className={btnPrimary} data-testid="button-wishlist-addall">{t('wishlist.moveAll')}</button>
          </div>
        )}
      </div>
      <div className="mt-12">
        <ProductGrid products={saved} isLoading={isLoading} isError={isError} onRetry={() => refetch()} skeletonCount={4}
          empty={<EmptyState testId="state-wishlist-empty" title={t('wishlist.empty')} body={t('wishlist.emptyBody')}
            action={<Link href="/shop" className={btnPrimary} data-testid="link-wishlist-shop">{t('hero.explore')}</Link>} />} />
      </div>
    </div>
  );
}
