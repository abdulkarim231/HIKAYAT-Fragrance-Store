import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productRepository, type ProductRepository } from '@/infrastructure/product-repository';
import { queryCatalog, type CatalogQuery } from '@/domain/catalog';
import { resolveLines, savings, subtotal } from '@/domain/cart';
import { useLocale } from './locale-provider';
import { useCart } from './cart-provider';

const repo: ProductRepository = productRepository;
export const productsQueryKey = ['products'] as const;

export function useProducts() {
  return useQuery({
    queryKey: productsQueryKey,
    queryFn: () => repo.list(),
    staleTime: 60_000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
  });
}

export function useCatalog(query: CatalogQuery) {
  const { locale } = useLocale();
  const q = useProducts();
  const { category, search, sort, bestSellersOnly } = query;
  const items = useMemo(
    () => (q.data ? queryCatalog(q.data, { category, search, sort, bestSellersOnly }, locale) : []),
    [q.data, category, search, sort, bestSellersOnly, locale],
  );
  return { ...q, items };
}

export function useProduct(id: string | undefined) {
  const q = useProducts();
  const product = useMemo(() => q.data?.find((p) => p.id === id) ?? null, [q.data, id]);
  return { ...q, product };
}

/** Cart lines joined with product data plus totals. */
export function useBag() {
  const { lines } = useCart();
  const q = useProducts();
  return useMemo(() => {
    const resolved = q.data ? resolveLines(lines, q.data) : [];
    return { resolved, subtotal: subtotal(resolved), savings: savings(resolved), isLoading: q.isLoading, isError: q.isError, refetch: q.refetch };
  }, [lines, q.data, q.isLoading, q.isError, q.refetch]);
}
