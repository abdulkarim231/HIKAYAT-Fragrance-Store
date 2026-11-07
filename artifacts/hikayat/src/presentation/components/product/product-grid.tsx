import type { ReactNode } from 'react';
import type { Product } from '@/domain/product';
import { Skeleton } from '@/components/ui/skeleton';
import { Reveal } from '@/presentation/components/common/reveal';
import { ErrorState } from '@/presentation/components/common/states';
import { ProductCard } from './product-card';

const GRID = 'grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-14';

interface Props {
  products: Product[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  empty?: ReactNode;
  skeletonCount?: number;
}

export function ProductGrid({ products, isLoading, isError, onRetry, empty, skeletonCount = 8 }: Props) {
  if (isLoading) {
    return (
      <div className={GRID} aria-busy="true">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton className="aspect-[4/5] w-full rounded-sm bg-olive/8" />
            <Skeleton className="h-3 w-16 bg-gold/20" />
            <Skeleton className="h-6 w-3/4 bg-olive/10" />
            <Skeleton className="h-4 w-1/3 bg-olive/8" />
          </div>
        ))}
      </div>
    );
  }
  if (isError) return <ErrorState onRetry={() => onRetry?.()} />;
  if (products.length === 0) return <>{empty}</>;
  return (
    <div className={GRID}>
      {products.map((p, i) => (
        <Reveal key={p.id} delay={(i % 4) * 90} className="min-w-0">
          <ProductCard product={p} priority={i < 4} />
        </Reveal>
      ))}
    </div>
  );
}
