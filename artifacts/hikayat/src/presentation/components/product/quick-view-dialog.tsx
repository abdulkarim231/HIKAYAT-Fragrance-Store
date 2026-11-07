import { Link } from 'wouter';
import { ArrowUpRight } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { useUI } from '@/application/ui-provider';
import { useProduct } from '@/application/use-catalog';
import { useLocale } from '@/application/locale-provider';
import { ProductDetails } from './product-details';

export function QuickViewDialog() {
  const { quickViewId, closeQuickView } = useUI();
  const { product } = useProduct(quickViewId ?? undefined);
  const { t, pick, dir } = useLocale();

  return (
    <Dialog open={!!quickViewId && !!product} onOpenChange={(o) => !o && closeQuickView()}>
      <DialogContent dir={dir} className="max-h-[92dvh] w-[calc(100vw-1.5rem)] max-w-4xl overflow-y-auto rounded-sm border-gold/30 bg-background p-0 sm:rounded-sm" data-testid="dialog-quickview">
        {product && (
          <div className="grid md:grid-cols-2">
            <div className="relative aspect-[4/5] bg-[hsl(38_30%_88%)] md:aspect-auto">
              <img src={product.image} alt={pick(product.name)} className="h-full w-full object-cover" />
            </div>
            <div className="p-6 sm:p-8">
              <DialogTitle className="sr-only">{pick(product.name)}</DialogTitle>
              <DialogDescription className="sr-only">{pick(product.tagline)}</DialogDescription>
              <ProductDetails key={product.id} product={product} compact />
              <Link href={`/product/${product.id}`} onClick={closeQuickView} className="mt-6 inline-flex min-h-11 items-center gap-1.5 text-sm text-olive underline decoration-gold underline-offset-4" data-testid="link-quickview-details">
                {t('product.viewDetails')}
                <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
