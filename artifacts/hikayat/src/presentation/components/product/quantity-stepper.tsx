import { Minus, Plus } from 'lucide-react';
import { useLocale } from '@/application/locale-provider';
import { MAX_QTY } from '@/domain/cart';

interface Props {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  testId: string;
}

export function QuantityStepper({ value, onChange, min = 1, testId }: Props) {
  const { t } = useLocale();
  const btn = 'inline-flex h-11 w-11 items-center justify-center text-olive transition-colors hover:bg-olive/8 disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-full';
  return (
    <div className="inline-flex items-center rounded-full border border-olive/25" role="group" aria-label={t('product.quantity')}>
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={t('product.decrease')} data-testid={`button-decrease-${testId}`}>
        <Minus className="h-4 w-4" strokeWidth={1.5} />
      </button>
      <span className="min-w-8 text-center text-sm tabular-nums" aria-live="polite" data-testid={`text-qty-${testId}`}>{value}</span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= MAX_QTY} aria-label={t('product.increase')} data-testid={`button-increase-${testId}`}>
        <Plus className="h-4 w-4" strokeWidth={1.5} />
      </button>
    </div>
  );
}
