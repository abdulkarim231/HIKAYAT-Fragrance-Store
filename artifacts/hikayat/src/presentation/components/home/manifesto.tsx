import { useLocale } from '@/application/locale-provider';
import { Reveal } from '@/presentation/components/common/reveal';
import { container } from '@/presentation/components/common/styles';

export function Manifesto() {
  const { t } = useLocale();
  return (
    <section className={`${container} grid gap-6 py-24 md:grid-cols-[200px_1fr] md:py-36`}>
      <Reveal>
        <span className="eyebrow text-gold">{t('home.manifestoEyebrow')}</span>
        <div className="mt-4 h-px w-16 bg-gold/60" />
      </Reveal>
      <Reveal delay={120}>
        <p className="font-display max-w-4xl text-[clamp(1.8rem,3.8vw,3.4rem)] leading-[1.15] text-olive">
          {t('home.manifesto')}
        </p>
      </Reveal>
    </section>
  );
}
