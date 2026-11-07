import { Link } from 'wouter';
import { useLocale } from '@/application/locale-provider';
import { assetUrl } from '@/infrastructure/assets';
import { Reveal } from '@/presentation/components/common/reveal';
import { btnOnDark, container } from '@/presentation/components/common/styles';

export function Ritual() {
  const { t } = useLocale();
  return (
    <section className="relative isolate overflow-hidden bg-olive text-ivory">
      <img src={assetUrl('images/ritual.jpg')} alt="" loading="lazy" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-35" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-olive via-olive/80 to-olive/30 rtl:bg-gradient-to-l" />
      <div className={`${container} py-28 md:py-40`}>
        <div className="max-w-xl">
          <Reveal><span className="eyebrow text-gold">{t('home.ritualEyebrow')}</span></Reveal>
          <Reveal delay={100}><h2 className="font-display mt-5 text-[clamp(2.8rem,6vw,5.4rem)] leading-[0.98]">{t('home.ritualTitle')}</h2></Reveal>
          <Reveal delay={200}><p className="mt-7 text-base leading-relaxed text-ivory/80">{t('home.ritualBody')}</p></Reveal>
          <Reveal delay={300}>
            <Link href="/shop" className={`${btnOnDark} mt-10`} data-testid="link-ritual-shop">{t('home.ritualCta')}</Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
