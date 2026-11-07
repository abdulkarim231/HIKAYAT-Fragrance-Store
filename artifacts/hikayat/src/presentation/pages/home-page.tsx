import { Hero } from '@/presentation/components/home/hero';
import { NotesMarquee } from '@/presentation/components/home/notes-marquee';
import { Manifesto } from '@/presentation/components/home/manifesto';
import { CollectionSection } from '@/presentation/components/home/collection-section';
import { ProductRail } from '@/presentation/components/home/product-rail';
import { NotesStory } from '@/presentation/components/home/notes-story';
import { Ritual } from '@/presentation/components/home/ritual';

export default function HomePage() {
  return (
    <>
      <Hero />
      <NotesMarquee />
      <Manifesto />
      <CollectionSection />
      <NotesStory />
      <ProductRail id="best-sellers" title="home.bestTitle" body="home.bestBody" bestSellersOnly />
      <Ritual />
      <ProductRail id="library" title="home.newTitle" exclude="bestSellers" />
    </>
  );
}
