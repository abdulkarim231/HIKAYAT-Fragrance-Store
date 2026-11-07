import { Link } from 'wouter';
import { Eye, Plus } from 'lucide-react';
import { useLocale } from '@/application/locale-provider';
import { useUI } from '@/application/ui-provider';
import type { Product } from '@/domain/product';
import { useShopActions } from '@/presentation/hooks/use-shop-actions';
import { WishlistButton } from './wishlist-button';
import { PriceTag } from './price-tag';

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { t, pick } = useLocale();
  const { openQuickView } = useUI();
  const { addToBag } = useShopActions();
  const name = pick(product.name);

  return (
    <article className="group relative flex min-w-0 flex-col" data-testid={`card-product-${product.id}`}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-[hsl(38_30%_88%)]">
        <Link href={`/product/${product.id}`} aria-label={name} data-testid={`link-product-image-${product.id}`}>
          <img
            src={product.image}
            alt={name}
            loading={priority ? 'eager' : 'lazy'}
            className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"
          />
        </Link>
        {product.bestSeller && (
          <span className="pointer-events-none absolute start-3 top-3 rounded-full bg-olive px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-ivory">
            {t('product.bestSeller')}
          </span>
        )}
        <WishlistButton product={product} className="absolute end-2 top-2" />
        <button
          type="button"
          onClick={() => openQuickView(product.id)}
          className="absolute inset-x-3 bottom-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-ivory/90 text-xs font-medium tracking-wide text-olive backdrop-blur transition-all duration-500 hover:bg-ivory focus-visible:translate-y-0 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
          data-testid={`button-quickview-${product.id}`}
        >
          <Eye className="h-4 w-4" strokeWidth={1.5} />
          {t('product.quickView')}
        </button>
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-1">
        <span className="eyebrow text-[10px] text-gold">HIKAYAT</span>
        <Link href={`/product/${product.id}`} className="font-display text-xl leading-tight text-olive decoration-gold underline-offset-4 hover:underline sm:text-2xl" data-testid={`link-product-${product.id}`}>
          {name}
        </Link>
        <p className="line-clamp-1 text-xs text-muted-foreground">{pick(product.family)} · {t('product.ml', { ml: product.sizeMl })}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <PriceTag product={product} />
          <button
            type="button"
            onClick={() => addToBag(product)}
            aria-label={`${t('product.addToBag')}: ${name}`}
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-olive/25 px-3.5 text-xs font-medium text-olive transition-colors duration-300 hover:border-olive hover:bg-olive hover:text-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            data-testid={`button-add-${product.id}`}
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            <span className="hidden sm:inline">{t('product.add')}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
