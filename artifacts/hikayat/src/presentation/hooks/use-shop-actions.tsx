import { useCallback } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { useCart } from '@/application/cart-provider';
import { useWishlist } from '@/application/wishlist-provider';
import { useLocale } from '@/application/locale-provider';
import { MAX_QTY } from '@/domain/cart';
import type { Product } from '@/domain/product';

/** Presentation-level actions that pair state changes with user feedback. */
export function useShopActions() {
  const cart = useCart();
  const wishlist = useWishlist();
  const { t, pick } = useLocale();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const addToBag = useCallback(
    (product: Product, qty = 1) => {
      const current = cart.quantityOf(product.id);
      if (current >= MAX_QTY) {
        toast({ title: t('toast.maxQty', { max: MAX_QTY }) });
        return;
      }
      cart.add(product.id, qty);
      toast({
        title: t('toast.added'),
        description: t('toast.addedBody', { name: pick(product.name), qty: Math.min(MAX_QTY, current + qty) }),
        action: (
          <ToastAction altText={t('toast.viewBag')} onClick={() => navigate('/bag')} data-testid="button-toast-view-bag">
            {t('toast.viewBag')}
          </ToastAction>
        ),
      });
    },
    [cart, toast, t, pick, navigate],
  );

  const toggleWishlist = useCallback(
    (product: Product) => {
      const saved = wishlist.toggle(product.id);
      toast({ title: t(saved ? 'toast.saved' : 'toast.unsaved'), description: pick(product.name) });
    },
    [wishlist, toast, t, pick],
  );

  return { addToBag, toggleWishlist };
}
