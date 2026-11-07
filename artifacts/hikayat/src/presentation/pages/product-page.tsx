import { Link, useParams } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocale } from '@/application/locale-provider';
import { useCatalog, useProduct } from '@/application/use-catalog';
import { container, btnPrimary } from '@/presentation/components/common/styles';
import { EmptyState, ErrorState } from '@/presentation/components/common/states';
import { ProductDetails } from '@/presentation/components/product/product-details';
import { ProductGrid } from '@/presentation/components/product/product-grid';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { t, pick } = useLocale();
  const { product, isLoading, isError, refetch } = useProduct(id);
  const related = useCatalog({ category: product?.category ?? null });
  const relatedItems = related.items.filter((p) => p.id !== id).slice(0, 4);

  if (isLoading) {
    return (
      <div className={`${container} grid gap-10 py-12 md:grid-cols-2`}>
        <Skeleton className="aspect-[4/5] w-full bg-olive/8" />
        <div className="space-y-4"><Skeleton className="h-4 w-32 bg-gold/20" /><Skeleton className="h-16 w-3/4 bg-olive/10" /><Skeleton className="h-24 w-full bg-olive/8" /></div>
      </div>
    );
  }
  if (isError) return <div className={`${container} py-16`}><ErrorState onRetry={() => refetch()} /></div>;
  if (!product) {
    return (
      <EmptyState testId="state-product-missing" title={t('product.notFound')} body={t('product.notFoundBody')}
        action={<Link href="/shop" className={btnPrimary} data-testid="link-back-shop">{t('product.back')}</Link>} />
    );
  }

  return (
    <div className="pb-20">
      <div className={`${container} py-6`}>
        <Link href={`/shop/${product.category}`} className="inline-flex min-h-11 items-center gap-2 text-sm text-olive hover:underline" data-testid="link-back">
          <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" strokeWidth={1.5} />
          {t('product.back')}
        </Link>
      </div>
      <div className={`${container} grid gap-10 md:grid-cols-2 md:gap-16`}>
        <div className="md:sticky md:top-32 md:self-start">
          <div className="rise relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-sm border border-gold/30 bg-[hsl(38_30%_88%)]">
            <img src={product.image} alt={pick(product.name)} className="slowzoom h-full w-full object-cover" data-testid="img-product" />
          </div>
        </div>
        <div className="rise" style={{ ['--d' as string]: '150ms' }}>
          <ProductDetails key={product.id} product={product} />
        </div>
      </div>
      {relatedItems.length > 0 && (
        <section className={`${container} mt-24`}>
          <h2 className="font-display mb-10 border-b border-gold/30 pb-5 text-4xl text-olive">{t('product.related')}</h2>
          <ProductGrid products={relatedItems} />
        </section>
      )}
    </div>
  );
}
