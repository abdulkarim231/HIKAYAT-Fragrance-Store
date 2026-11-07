import { useLocale } from '@/application/locale-provider';
import type { ScentNotes } from '@/domain/product';

export function NotesList({ notes }: { notes: ScentNotes }) {
  const { t, pick } = useLocale();
  const rows = [
    { label: t('product.top'), items: notes.top },
    { label: t('product.heart'), items: notes.heart },
    { label: t('product.base'), items: notes.base },
  ];
  return (
    <dl className="divide-y divide-gold/25 border-y border-gold/25">
      {rows.map((r, i) => (
        <div key={r.label} className="grid grid-cols-[88px_1fr] items-baseline gap-4 py-3.5">
          <dt className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <span className="font-display text-base text-gold">{i + 1}</span>
            {r.label}
          </dt>
          <dd className="text-sm text-charcoal">{r.items.map(pick).join(' · ')}</dd>
        </div>
      ))}
    </dl>
  );
}
