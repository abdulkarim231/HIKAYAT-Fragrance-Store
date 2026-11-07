/** Demo catalog for the frontend-first phase. Prices in SAR. No reviews or ratings by design. */
import type { Localized, Product } from '@/domain/product';
import { assetUrl } from './assets';

const n = (en: string, ar: string): Localized => ({ en, ar });
const EDP = n('Eau de Parfum', 'أو دو بارفان');
const EXTRAIT = n('Extrait de Parfum', 'خلاصة عطر');
const EDT = n('Eau de Toilette', 'أو دو تواليت');

export const DEMO_PRODUCTS: Product[] = [
  {
    id: 'layali-oud', name: n('Layali Oud', 'ليالي عود'), category: 'unisex', price: 685, sizeMl: 100,
    concentration: EXTRAIT, family: n('Woody Oriental', 'خشبي شرقي'), image: assetUrl('images/p5.jpg'),
    tagline: n('A late night that refuses to end.', 'ليلة متأخرة لا تريد أن تنتهي.'),
    description: n(
      'Smoked Cambodian oud softened with saffron and a thread of rose. Deep, warm and close to the skin, it lingers on a scarf long after the evening is over.',
      'عود كمبودي مدخّن يليّنه الزعفران وخيط من الورد. عميق ودافئ وقريب من البشرة، يبقى على الوشاح طويلاً بعد انتهاء السهرة.',
    ),
    notes: { top: [n('Saffron', 'زعفران'), n('Pink pepper', 'فلفل وردي')], heart: [n('Damask rose', 'ورد دمشقي'), n('Incense', 'بخور')], base: [n('Cambodian oud', 'عود كمبودي'), n('Amber', 'عنبر'), n('Leather', 'جلد')] },
    bestSeller: true, featuredRank: 1,
  },
  {
    id: 'ward-taifi', name: n('Ward Taifi', 'ورد طائفي'), category: 'women', price: 545, compareAtPrice: 620, sizeMl: 75,
    concentration: EDP, family: n('Floral', 'زهري'), image: assetUrl('images/p2.jpg'),
    tagline: n('Morning in the rose valleys of Taif.', 'صباح في وديان الورد بالطائف.'),
    description: n(
      'Dew-wet Taif rose picked at dawn, brightened with lychee and settled on a clean, powdery musk. Romantic without being sweet.',
      'ورد طائفي مبلل بالندى يُقطف عند الفجر، تضيئه فاكهة الليتشي ويستقر على مسك ناعم نظيف. رومانسي دون أن يكون حلواً.',
    ),
    notes: { top: [n('Lychee', 'ليتشي'), n('Bergamot', 'برغموت')], heart: [n('Taif rose', 'ورد طائفي'), n('Peony', 'فاوانيا')], base: [n('White musk', 'مسك أبيض'), n('Cashmere wood', 'خشب الكشمير')] },
    bestSeller: true, featuredRank: 2,
  },
  {
    id: 'amber-qasida', name: n('Amber Qasida', 'قصيدة العنبر'), category: 'unisex', price: 590, sizeMl: 100,
    concentration: EDP, family: n('Amber', 'عنبري'), image: assetUrl('images/p1.jpg'),
    tagline: n('A poem written in warm resin.', 'قصيدة مكتوبة بالراتنج الدافئ.'),
    description: n(
      'Golden labdanum and vanilla absolute wrapped around a spine of tonka and cedar. Comforting, slow, and quietly addictive.',
      'لادن ذهبي وخلاصة الفانيليا يلتفان حول قلب من التونكا والأرز. مريح وهادئ ويأسرك بصمت.',
    ),
    notes: { top: [n('Mandarin', 'يوسفي'), n('Cardamom', 'هيل')], heart: [n('Labdanum', 'لادن'), n('Benzoin', 'جاوي')], base: [n('Vanilla', 'فانيليا'), n('Tonka bean', 'حبوب التونكا'), n('Cedar', 'أرز')] },
    bestSeller: true, featuredRank: 3,
  },
  {
    id: 'sahra-vetiver', name: n('Sahra Vetiver', 'صحراء فيتيفر'), category: 'men', price: 495, sizeMl: 100,
    concentration: EDP, family: n('Earthy Woody', 'خشبي ترابي'), image: assetUrl('images/p3.jpg'),
    tagline: n('Dry wind across warm dunes.', 'ريح جافة فوق كثبان دافئة.'),
    description: n(
      'Haitian vetiver dried by desert air, sharpened with grapefruit and grounded in smoky guaiac wood. Composed, confident, unhurried.',
      'فيتيفر هايتي جففه هواء الصحراء، يحدّه الجريب فروت ويرسخه خشب الغاياك المدخّن. متزن وواثق وغير مستعجل.',
    ),
    notes: { top: [n('Grapefruit', 'جريب فروت'), n('Ginger', 'زنجبيل')], heart: [n('Vetiver', 'فيتيفر'), n('Clary sage', 'مريمية')], base: [n('Guaiac wood', 'خشب الغاياك'), n('Ambroxan', 'أمبروكسان')] },
    bestSeller: true, featuredRank: 4,
  },
  {
    id: 'nada-sage', name: n('Nada Sage', 'ندى المريمية'), category: 'unisex', price: 420, compareAtPrice: 485, sizeMl: 75,
    concentration: EDT, family: n('Aromatic Green', 'عطري أخضر'), image: assetUrl('images/p6.jpg'),
    tagline: n('The garden, just after rain.', 'الحديقة بعد المطر مباشرة.'),
    description: n(
      'Crushed sage leaves, fig milk and sea salt. A clean, green skin scent for the days you want to feel unhurried.',
      'أوراق مريمية مطحونة وحليب التين وملح البحر. عطر بشرة أخضر نظيف للأيام التي تريد أن تشعر فيها بالسكينة.',
    ),
    notes: { top: [n('Sea salt', 'ملح البحر'), n('Petitgrain', 'بيتيتغرين')], heart: [n('Sage', 'مريمية'), n('Fig leaf', 'ورق التين')], base: [n('Moss', 'طحلب'), n('Driftwood', 'خشب البحر')] },
    bestSeller: false, featuredRank: 5,
  },
  {
    id: 'zahr-neroli', name: n('Zahr Neroli', 'زهر النيرولي'), category: 'women', price: 455, sizeMl: 50,
    concentration: EDP, family: n('Citrus Floral', 'حمضي زهري'), image: assetUrl('images/p4.jpg'),
    tagline: n('Sunlight on orange blossom.', 'ضوء الشمس على زهر البرتقال.'),
    description: n(
      'Bitter orange blossom and neroli, luminous and honeyed, with a soft veil of orris. Wearable joy for every hour of the day.',
      'زهر البرتقال المر والنيرولي، مضيء ومعسول، مع غلالة ناعمة من السوسن. فرح يُرتدى في كل ساعات اليوم.',
    ),
    notes: { top: [n('Neroli', 'نيرولي'), n('Lemon zest', 'قشر الليمون')], heart: [n('Orange blossom', 'زهر البرتقال'), n('Jasmine', 'ياسمين')], base: [n('Orris', 'سوسن'), n('Honey', 'عسل'), n('Musk', 'مسك')] },
    bestSeller: false, featuredRank: 6,
  },
  {
    id: 'kohl-leather', name: n('Kohl Leather', 'جلد الكحل'), category: 'men', price: 615, sizeMl: 100,
    concentration: EXTRAIT, family: n('Leather', 'جلدي'), image: assetUrl('images/p7.jpg'),
    tagline: n('Ink, suede and a sharp silhouette.', 'حبر وجلد مخملي وظل حاد.'),
    description: n(
      'Black suede and birch tar lit by cardamom and violet leaf. Dark and polished, with a dry smoky trail.',
      'جلد مخملي أسود وقطران البتولا يضيئهما الهيل وورق البنفسج. داكن ومصقول بأثر مدخّن جاف.',
    ),
    notes: { top: [n('Cardamom', 'هيل'), n('Violet leaf', 'ورق البنفسج')], heart: [n('Suede', 'جلد مخملي'), n('Iris', 'سوسن')], base: [n('Birch tar', 'قطران البتولا'), n('Patchouli', 'باتشولي')] },
    bestSeller: false, featuredRank: 7,
  },
  {
    id: 'musk-hareer', name: n('Musk Hareer', 'مسك حرير'), category: 'women', price: 380, sizeMl: 50,
    concentration: EDP, family: n('Soft Musk', 'مسكي ناعم'), image: assetUrl('images/p8.jpg'),
    tagline: n('Silk against freshly washed skin.', 'حرير على بشرة مغسولة للتو.'),
    description: n(
      'A tender cloud of white musks, pear and ambrette seed. The scent of your own skin, only softer.',
      'سحابة رقيقة من المسك الأبيض والكمثرى وبذور العنبريت. رائحة بشرتك أنت، لكن أنعم.',
    ),
    notes: { top: [n('Pear', 'كمثرى'), n('Aldehydes', 'ألدهيدات')], heart: [n('Ambrette seed', 'بذور العنبريت'), n('Lily of the valley', 'زنبق الوادي')], base: [n('White musk', 'مسك أبيض'), n('Sandalwood', 'صندل')] },
    bestSeller: true, featuredRank: 8,
  },
  {
    id: 'bahr-bergamot', name: n('Bahr Bergamot', 'بحر البرغموت'), category: 'men', price: 365, compareAtPrice: 410, sizeMl: 100,
    concentration: EDT, family: n('Fresh Aquatic', 'منعش مائي'), image: assetUrl('images/p9.jpg'),
    tagline: n('A coastline at seven in the morning.', 'ساحل في السابعة صباحاً.'),
    description: n(
      'Calabrian bergamot, mint and mineral accord drift over white cedar. Effortless, bright and easy to reach for.',
      'برغموت كالابري ونعناع ونفحة معدنية تنساب فوق الأرز الأبيض. سهل ومشرق ورفيق كل يوم.',
    ),
    notes: { top: [n('Bergamot', 'برغموت'), n('Mint', 'نعناع')], heart: [n('Mineral accord', 'نفحة معدنية'), n('Lavender', 'خزامى')], base: [n('White cedar', 'أرز أبيض'), n('Vetiver', 'فيتيفر')] },
    bestSeller: false, featuredRank: 9,
  },
  {
    id: 'yasmin-layl', name: n('Yasmin Layl', 'ياسمين الليل'), category: 'women', price: 520, sizeMl: 75,
    concentration: EDP, family: n('White Floral', 'زهري أبيض'), image: assetUrl('images/p10.jpg'),
    tagline: n('Jasmine that opens after dark.', 'ياسمين يتفتح بعد الغروب.'),
    description: n(
      'Night-blooming jasmine sambac and tuberose over creamy sandalwood. Luminous, sensual and quietly bold.',
      'ياسمين سمبك ليلي ومسك الروم فوق صندل كريمي. مضيء وحسّي وجريء بهدوء.',
    ),
    notes: { top: [n('Green tea', 'شاي أخضر'), n('Bergamot', 'برغموت')], heart: [n('Jasmine sambac', 'ياسمين سمبك'), n('Tuberose', 'مسك الروم')], base: [n('Sandalwood', 'صندل'), n('Benzoin', 'جاوي')] },
    bestSeller: false, featuredRank: 10,
  },
];
