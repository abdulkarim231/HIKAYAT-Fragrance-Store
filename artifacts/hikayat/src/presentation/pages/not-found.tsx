import { Link } from 'wouter';
import { useLocale } from '@/application/locale-provider';
import { EmptyState } from '@/presentation/components/common/states';
import { btnPrimary } from '@/presentation/components/common/styles';

export default function NotFound() {
  const { t } = useLocale();
  return (
    <div className="py-10">
      <EmptyState testId="state-not-found" title={t('notFound.title')} body={t('notFound.body')}
        action={<Link href="/" className={btnPrimary} data-testid="link-home">{t('notFound.home')}</Link>} />
    </div>
  );
}
