import { useLocale } from '@/application/locale-provider';
import type { MessageKey } from '@/i18n/messages';
import { assetUrl } from '@/infrastructure/assets';
import { Reveal } from '@/presentation/components/common/reveal';
import { container } from '@/presentation/components/common/styles';

const ACTS: [MessageKey, MessageKey][] = [
  ['home.notesTop', 'home.notesTopBody'],
  ['home.notesHeart', 'home.notesHeartBody'],
  ['home.notesBase', 'home.notesBaseBody'],
];

export function NotesStory() {
  const { t } = useLocale();
  return (
    <section className="bg-sage/35">
      <div className={`${container} grid items-center gap-12 py-20 md:grid-cols-2 md:gap-20 md:py-28`}>
        <Reveal className="relative">
          <div className="aspect-[4/5] overflow-hidden rounded-sm">
            <img src={assetUrl('images/notes.jpg')} alt="" loading="lazy" className="h-full w-full object-cover" />
          </div>
          <div className="absolute -bottom-6 end-6 hidden w-40 border border-gold/50 bg-background p-4 sm:block">
            <p className="font-display text-4xl text-gold">3</p>
            <p className="mt-1 text-xs text-muted-foreground">{t('home.notesTitle')}</p>
          </div>
        </Reveal>
        <div>
          <Reveal><span className="eyebrow text-olive/70">{t('home.notesEyebrow')}</span></Reveal>
          <Reveal delay={80}><h2 className="font-display mt-4 text-[clamp(2.2rem,4.4vw,3.8rem)] leading-[1.02] text-olive">{t('home.notesTitle')}</h2></Reveal>
          <ol className="mt-10 space-y-8">
            {ACTS.map(([title, body], i) => (
              <Reveal as="li" key={title} delay={160 + i * 120} className="grid grid-cols-[56px_1fr] gap-4 border-t border-olive/15 pt-6">
                <span className="font-display text-3xl text-gold">0{i + 1}</span>
                <div>
                  <h3 className="font-display text-2xl text-olive">{t(title)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-charcoal/75">{t(body)}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
