import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useLocale } from '@/application/locale-provider';
import type { Product } from '@/domain/product';
import { useShopActions } from '@/presentation/hooks/use-shop-actions';
import { btnPrimary } from '@/presentation/components/common/styles';
import { PriceTag } from './price-tag';
import { NotesList } from './notes-list';
import { QuantityStepper } from './quantity-stepper';
import { WishlistButton } from './wishlist-button';

/** Shared info column for both the product page and quick view. */
export function ProductDetails({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { t, pick } = useLocale();
  const { addToBag } = useShopActions();
  const [qty, setQty] = useState(1);

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3">
        <span className="eyebrow text-gold">HIKAYAT</span>
        <span className="h-px w-8 bg-gold/50" />
        <span className="eyebrow text-muted-foreground">{t(`cat.${product.category}`)}</span>
        {product.bestSeller && <span className="eyebrow rounded-full bg-sage/40 px-2 py-0.5 text-olive">{t('product.bestSeller')}</span>}
      </div>
      <h1 className={`font-display mt-4 leading-[1.02] text-olive ${compact ? 'text-4xl' : 'text-5xl sm:text-6xl'}`} data-testid="text-product-name">
        {pick(product.name)}
      </h1>
      <p className="font-display mt-3 text-lg italic text-charcoal/70">{pick(product.tagline)}</p>
      <div className="mt-6"><PriceTag product={product} size="lg" /></div>
      <p className="mt-6 text-[15px] leading-relaxed text-charcoal/85" data-testid="text-product-description">{pick(product.description)}</p>

      <dl className="mt-6 grid grid-cols-3 gap-3 text-xs">
        {[
          [t('product.family'), pick(product.family)],
          [t('product.concentration'), pick(product.concentration)],
          [t('product.size'), t('product.ml', { ml: product.sizeMl })],
        ].map(([k, v]) => (
          <div key={k} className="rounded-sm bg-card px-3 py-2.5">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="mt-1 font-medium text-charcoal">{v}</dd>
          </div>
        ))}
      </dl>

      <h2 className="eyebrow mt-8 mb-3 text-olive">{t('product.notes')}</h2>
      <NotesList notes={product.notes} />

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <QuantityStepper value={qty} onChange={setQty} testId={`detail-${product.id}`} />
        <button type="button" className={`${btnPrimary} flex-1`} onClick={() => addToBag(product, qty)} data-testid={`button-add-detail-${product.id}`}>
          <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
          {t('product.addToBag')}
        </button>
        <WishlistButton product={product} className="border border-olive/25 bg-transparent" />
      </div>
    </div>
  );
}
