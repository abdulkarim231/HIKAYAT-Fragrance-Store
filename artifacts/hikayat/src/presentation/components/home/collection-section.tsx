import { Link } from 'wouter';
import { ArrowUpRight } from 'lucide-react';
import { useLocale } from '@/application/locale-provider';
import { useProducts } from '@/application/use-catalog';
import type { Category } from '@/domain/product';
import type { MessageKey } from '@/i18n/messages';
import { assetUrl } from '@/infrastructure/assets';
import { Reveal } from '@/presentation/components/common/reveal';
import { container } from '@/presentation/components/common/styles';
import { cn } from '@/lib/utils';

const TILES: { cat: Category; title: MessageKey; body: MessageKey; img: string; cls: string }[] = [
  { cat: 'unisex', title: 'nav.unisex', body: 'home.catUnisexBody', img: 'images/collection.jpg', cls: 'md:row-span-2 aspect-[4/5] md:aspect-auto' },
  { cat: 'women', title: 'nav.women', body: 'home.catWomenBody', img: 'images/ritual.jpg', cls: 'aspect-[16/11]' },
  { cat: 'men', title: 'nav.men', body: 'home.catMenBody', img: 'images/notes.jpg', cls: 'aspect-[16/11]' },
];

export function CollectionSection() {
  const { t } = useLocale();
  const { data } = useProducts();
  const countFor = (c: Category) => data?.filter((p) => p.category === c).length ?? 0;

  return (
    <section className={`${container} pb-24 md:pb-32`} aria-labelledby="collection-title">
      <Reveal className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <h2 id="collection-title" className="font-display text-[clamp(2.4rem,5vw,4.4rem)] leading-none text-olive">{t('home.collectionTitle')}</h2>
        <p className="max-w-xs text-sm text-muted-foreground">{t('home.collectionBody')}</p>
      </Reveal>
      <div className="grid gap-4 md:grid-cols-[1.15fr_1fr] md:grid-rows-2 md:gap-6">
        {TILES.map((tile, i) => (
          <Reveal key={tile.cat} delay={i * 120} className={cn('min-w-0', i === 0 && 'md:row-span-2')}>
            <Link href={`/shop/${tile.cat}`} className={cn('group relative block h-full overflow-hidden rounded-sm bg-olive', tile.cls)} data-testid={`link-collection-${tile.cat}`}>
              <img src={assetUrl(tile.img)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-[1400ms] ease-out group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-olive/90 via-olive/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 text-ivory sm:p-8">
                <div>
                  <span className="eyebrow text-gold">{t('home.catCount', { count: countFor(tile.cat) })}</span>
                  <h3 className="font-display mt-2 text-3xl sm:text-4xl">{t(tile.title)}</h3>
                  <p className="mt-1 text-sm text-ivory/75">{t(tile.body)}</p>
                </div>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-ivory/40 transition-colors duration-500 group-hover:border-gold group-hover:bg-gold group-hover:text-olive">
                  <ArrowUpRight className="h-5 w-5 rtl:-scale-x-100" strokeWidth={1.5} />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
