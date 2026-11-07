import { Heart } from 'lucide-react';
import { useWishlist } from '@/application/wishlist-provider';
import { useLocale } from '@/application/locale-provider';
import type { Product } from '@/domain/product';
import { useShopActions } from '@/presentation/hooks/use-shop-actions';
import { cn } from '@/lib/utils';

export function WishlistButton({ product, className }: { product: Product; className?: string }) {
  const { has } = useWishlist();
  const { t } = useLocale();
  const { toggleWishlist } = useShopActions();
  const saved = has(product.id);
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product); }}
      aria-pressed={saved}
      aria-label={saved ? t('product.unsave') : t('product.save')}
      title={saved ? t('product.unsave') : t('product.save')}
      className={cn(
        'inline-flex h-11 w-11 items-center justify-center rounded-full bg-ivory/85 text-olive backdrop-blur transition-transform duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold',
        className,
      )}
      data-testid={`button-wishlist-${product.id}`}
    >
      <Heart key={String(saved)} className={cn('h-[18px] w-[18px]', saved && 'bump fill-olive')} strokeWidth={1.5} />
    </button>
  );
}
