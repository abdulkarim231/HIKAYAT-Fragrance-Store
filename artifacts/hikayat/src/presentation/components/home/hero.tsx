import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { useLocale } from '@/application/locale-provider';
import { assetUrl } from '@/infrastructure/assets';
import { btnGhostOnDark, btnOnDark, container } from '@/presentation/components/common/styles';

export function Hero() {
  const { t } = useLocale();
  return (
    <section className="relative overflow-hidden bg-olive text-ivory" aria-labelledby="hero-title">
      <div className={`${container} grid items-stretch gap-10 py-12 md:grid-cols-[1.05fr_1fr] md:gap-14 md:py-20 lg:min-h-[calc(100dvh-108px)] lg:py-16`}>
        <div className="flex flex-col justify-center">
          <div className="rise flex items-center gap-3" style={{ ['--d' as string]: '100ms' }}>
            <span className="h-px w-10 bg-gold" />
            <span className="eyebrow text-gold">{t('hero.eyebrow')}</span>
          </div>
          <h1 id="hero-title" className="font-display rise mt-7 text-[clamp(2.9rem,7.4vw,6.6rem)] leading-[0.95] text-ivory" style={{ ['--d' as string]: '220ms' }}>
            {t('hero.title')}
          </h1>
          <p className="rise mt-7 max-w-md text-base leading-relaxed text-ivory/75 sm:text-lg" style={{ ['--d' as string]: '380ms' }}>
            {t('hero.body')}
          </p>
          <div className="rise mt-10 flex flex-col gap-3 sm:flex-row" style={{ ['--d' as string]: '520ms' }}>
            <Link href="/shop" className={`${btnOnDark} group`} data-testid="link-hero-explore">
              {t('hero.explore')}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" strokeWidth={1.5} />
            </Link>
            <a href="#best-sellers" className={btnGhostOnDark} data-testid="link-hero-bestsellers">{t('hero.bestSellers')}</a>
          </div>
        </div>
        <figure className="relative min-h-[420px] md:min-h-0">
          <div className="absolute inset-0 overflow-hidden rounded-t-[999px] rounded-b-sm border border-gold/40">
            <img src={assetUrl('images/hero.jpg')} alt="" className="slowzoom h-full w-full object-cover" fetchPriority="high" />
            <div className="absolute inset-0 bg-gradient-to-t from-olive/50 via-transparent to-transparent" />
          </div>
          <figcaption className="absolute bottom-5 start-5 flex items-center gap-2 text-xs tracking-wide text-ivory/90">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            {t('hero.caption')}
          </figcaption>
          <span aria-hidden className="font-display absolute -top-3 end-2 text-7xl leading-none text-gold/70 sm:text-8xl">ح</span>
        </figure>
      </div>
    </section>
  );
}
