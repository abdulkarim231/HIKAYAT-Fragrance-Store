import type { ReactNode } from 'react';
import { useLocale } from '@/application/locale-provider';
import { btnGhost } from './styles';

/** Composed empty state: an etched bottle outline instead of an emoji or bare text. */
export function EmptyState({ title, body, action, testId }: { title: string; body: string; action?: ReactNode; testId?: string }) {
  return (
    <div className="flex flex-col items-center px-6 py-20 text-center" data-testid={testId}>
      <svg width="74" height="110" viewBox="0 0 74 110" fill="none" aria-hidden className="mb-8 text-gold">
        <rect x="27" y="4" width="20" height="14" rx="2" stroke="currentColor" />
        <rect x="31" y="18" width="12" height="8" stroke="currentColor" />
        <rect x="6" y="26" width="62" height="80" rx="10" stroke="currentColor" />
        <path d="M6 66 C 24 58, 50 74, 68 64" stroke="hsl(var(--sage))" />
        <circle cx="37" cy="86" r="1.6" fill="currentColor" />
      </svg>
      <h2 className="font-display max-w-md text-3xl text-olive sm:text-4xl">{title}</h2>
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">{body}</p>
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useLocale();
  return (
    <div role="alert" className="flex flex-col items-center rounded-sm border border-gold/40 bg-card px-6 py-16 text-center">
      <span className="eyebrow text-gold">HIKAYAT</span>
      <h2 className="font-display mt-4 text-3xl text-olive">{t('error.loadTitle')}</h2>
      <p className="mt-3 text-sm text-muted-foreground">{t('error.loadBody')}</p>
      <button type="button" onClick={onRetry} className={`${btnGhost} mt-8`} data-testid="button-retry">
        {t('error.retry')}
      </button>
    </div>
  );
}
