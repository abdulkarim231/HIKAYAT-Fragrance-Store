-- Run in Supabase SQL Editor after migrations. Safe to rerun: existing
-- products (including merchant edits) are never overwritten.
begin;
insert into public.products (id, data, published)
select product->>'id', product, true
from jsonb_array_elements($seed$[
  {
    "id": "layali-oud",
    "name": {"en": "Layali Oud", "ar": "ليالي عود"},
    "description": {"en": "Smoked oud, saffron and a thread of rose. Deep, warm and close to the skin.", "ar": "عود مدخن وزعفران وخيط من الورد. عميق ودافئ وقريب من البشرة."},
    "price": 685,
    "image": "images/p5.jpg",
    "category": "unisex",
    "sizeMl": 100,
    "concentration": {"en": "Extrait de Parfum", "ar": "خلاصة عطر"},
    "family": {"en": "Woody Oriental", "ar": "خشبي شرقي"},
    "tagline": {"en": "A late night that refuses to end.", "ar": "ليلة متأخرة لا تريد أن تنتهي."},
    "notes": {"top": [{"en": "Saffron", "ar": "زعفران"}], "heart": [{"en": "Rose", "ar": "ورد"}], "base": [{"en": "Oud", "ar": "عود"}]},
    "bestSeller": true,
    "featuredRank": 1
  },
  {
    "id": "ward-taifi",
    "name": {"en": "Ward Taifi", "ar": "ورد طائفي"},
    "description": {"en": "Taif rose brightened with lychee and settled on a soft white musk.", "ar": "ورد طائفي تضيئه فاكهة الليتشي ويستقر على مسك أبيض ناعم."},
    "price": 545,
    "compareAtPrice": 620,
    "image": "images/p2.jpg",
    "category": "women",
    "sizeMl": 75,
    "concentration": {"en": "Eau de Parfum", "ar": "أو دو بارفان"},
    "family": {"en": "Floral", "ar": "زهري"},
    "tagline": {"en": "Morning in the rose valleys of Taif.", "ar": "صباح في وديان الورد بالطائف."},
    "notes": {"top": [{"en": "Lychee", "ar": "ليتشي"}], "heart": [{"en": "Taif rose", "ar": "ورد طائفي"}], "base": [{"en": "White musk", "ar": "مسك أبيض"}]},
    "bestSeller": true,
    "featuredRank": 2
  },
  {
    "id": "sahra-vetiver",
    "name": {"en": "Sahra Vetiver", "ar": "صحراء فيتيفر"},
    "description": {"en": "Vetiver, grapefruit and smoky guaiac wood. Composed, confident, unhurried.", "ar": "فيتيفر وجريب فروت وخشب الغاياك المدخن. متزن وواثق وغير مستعجل."},
    "price": 495,
    "image": "images/p3.jpg",
    "category": "men",
    "sizeMl": 100,
    "concentration": {"en": "Eau de Parfum", "ar": "أو دو بارفان"},
    "family": {"en": "Earthy Woody", "ar": "خشبي ترابي"},
    "tagline": {"en": "Dry wind across warm dunes.", "ar": "ريح جافة فوق كثبان دافئة."},
    "notes": {"top": [{"en": "Grapefruit", "ar": "جريب فروت"}], "heart": [{"en": "Vetiver", "ar": "فيتيفر"}], "base": [{"en": "Guaiac wood", "ar": "خشب الغاياك"}]},
    "bestSeller": true,
    "featuredRank": 4
  }
]$seed$::jsonb) as product
on conflict (id) do nothing;
commit;
