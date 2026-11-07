import { useLocale } from '@/application/locale-provider';

export function NotesMarquee() {
  const { t } = useLocale();
  const words = t('home.marquee').split('|');
  const row = [...words, ...words];
  return (
    <div className="overflow-hidden border-y border-gold/30 bg-background py-5" aria-hidden>
      <div className="marquee-track flex w-max">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center">
            {row.map((w, i) => (
              <span key={`${k}-${i}`} className="font-display flex items-center whitespace-nowrap px-6 text-2xl text-olive/80 sm:text-3xl">
                {w}
                <span className="ms-12 inline-block h-1.5 w-1.5 rotate-45 bg-gold" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
