import type { MessageKey } from '@/i18n/messages';

export const NAV_ITEMS: { href: string; key: MessageKey; testId: string }[] = [
  { href: '/', key: 'nav.home', testId: 'home' },
  { href: '/shop', key: 'nav.shop', testId: 'shop' },
  { href: '/shop/men', key: 'nav.men', testId: 'men' },
  { href: '/shop/women', key: 'nav.women', testId: 'women' },
  { href: '/shop/unisex', key: 'nav.unisex', testId: 'unisex' },
];
