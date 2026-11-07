import { Link } from 'wouter';
import { Heart, ShieldCheck, ShoppingBag } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { useUI } from '@/application/ui-provider';
import { useLocale } from '@/application/locale-provider';
import { useCart } from '@/application/cart-provider';
import { useWishlist } from '@/application/wishlist-provider';
import { btnGhost, btnPrimary } from '@/presentation/components/common/styles';

export function AccountDialog() {
  const { accountOpen, setAccountOpen } = useUI();
  const { t, dir } = useLocale();
  const { count } = useCart();
  const wishlist = useWishlist();
  const close = () => setAccountOpen(false);

  return (
    <Dialog open={accountOpen} onOpenChange={setAccountOpen}>
      <DialogContent dir={dir} className="w-[calc(100vw-1.5rem)] max-w-md rounded-sm border-gold/30 bg-background p-0 sm:rounded-sm" data-testid="dialog-account">
        <div className="bg-olive px-7 pb-7 pt-9 text-ivory">
          <p className="logo-mark text-sm text-gold">HIKAYAT</p>
          <DialogTitle className="font-display mt-3 text-3xl font-normal">{t('account.title')}</DialogTitle>
          <DialogDescription className="mt-3 text-sm leading-relaxed text-ivory/75">{t('account.body')}</DialogDescription>
        </div>
        <div className="px-7 py-6">
          <p className="eyebrow mb-3 text-olive">{t('account.stored')}</p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-3"><ShoppingBag className="h-4 w-4 text-gold" strokeWidth={1.5} />{t('account.storedBag', { count })}</li>
            <li className="flex items-center gap-3"><Heart className="h-4 w-4 text-gold" strokeWidth={1.5} />{t('account.storedWishlist', { count: wishlist.count })}</li>
            <li className="flex items-center gap-3"><span className="h-4 w-4 text-center text-xs text-gold">Aa</span>{t('account.storedLang')}</li>
          </ul>
          <p className="mt-5 flex gap-2 rounded-sm bg-sage/25 p-3 text-xs leading-relaxed text-charcoal/80">
            <ShieldCheck className="h-4 w-4 shrink-0 text-olive" strokeWidth={1.5} />
            {t('account.privacy')}
          </p>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <Link href="/wishlist" onClick={close} className={btnGhost} data-testid="link-account-wishlist">{t('account.viewWishlist')}</Link>
            <Link href="/bag" onClick={close} className={btnPrimary} data-testid="link-account-bag">{t('account.viewBag')}</Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
