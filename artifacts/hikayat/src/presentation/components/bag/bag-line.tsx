import { Link } from 'wouter';
import { X } from 'lucide-react';
import { useCart } from '@/application/cart-provider';
import { useLocale } from '@/application/locale-provider';
import type { ResolvedLine } from '@/domain/cart';
import { useToast } from '@/hooks/use-toast';
import { QuantityStepper } from '@/presentation/components/product/quantity-stepper';

export function BagLine({ line, editable = true }: { line: ResolvedLine; editable?: boolean }) {
  const { setQty, remove } = useCart();
  const { t, pick, formatPrice } = useLocale();
  const { toast } = useToast();
  const { product, quantity, lineTotal } = line;
  const name = pick(product.name);

  return (
    <li className="grid grid-cols-[88px_1fr] gap-4 py-6 sm:grid-cols-[112px_1fr]" data-testid={`row-bag-${product.id}`}>
      <Link href={`/product/${product.id}`} className="block aspect-[4/5] overflow-hidden rounded-sm bg-[hsl(38_30%_88%)]">
        <img src={product.image} alt={name} className="h-full w-full object-cover" />
      </Link>
      <div className="flex min-w-0 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="eyebrow text-[10px] text-gold">HIKAYAT</p>
            <Link href={`/product/${product.id}`} className="font-display block truncate text-2xl text-olive hover:underline">{name}</Link>
            <p className="text-xs text-muted-foreground">{pick(product.concentration)} · {t('product.ml', { ml: product.sizeMl })}</p>
          </div>
          <p className="shrink-0 font-medium tabular-nums" data-testid={`text-line-total-${product.id}`}>{formatPrice(lineTotal)}</p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{t('bag.each', { price: formatPrice(product.price) })}</p>
        {editable ? (
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
            <QuantityStepper value={quantity} onChange={(n) => setQty(product.id, n)} testId={product.id} />
            <button type="button" onClick={() => { remove(product.id); toast({ title: t('toast.removed'), description: name }); }}
              className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive" data-testid={`button-remove-${product.id}`}>
              <X className="h-4 w-4" strokeWidth={1.5} />{t('bag.remove')}
            </button>
          </div>
        ) : (
          <p className="mt-2 text-sm">{t('product.quantity')}: {quantity}</p>
        )}
      </div>
    </li>
  );
}
