# HIKAYAT storefront architecture

Frontend-first catalog. Demo products, cart, wishlist and language live on the device. There is no backend, payment or authentication.

## Layers (dependencies point inward)

```
presentation  ->  application  ->  domain
                       |
                infrastructure  ->  domain
```

| Layer | Path | Responsibility |
|---|---|---|
| Domain | `src/domain/` | Types (`product.ts`) and pure functions: cart math (`cart.ts`: add, set quantity, remove, subtotal, savings, discount %), catalog search/filter/sort (`catalog.ts`). No React, no browser APIs. |
| Infrastructure | `src/infrastructure/` | `storage.ts`: a localStorage adapter that never throws and validates what it reads. `product-repository.ts`: the `ProductRepository` interface plus a demo implementation backed by `demo-products.ts`. `assets.ts`: resolves images against `import.meta.env.BASE_URL`. |
| i18n | `src/i18n/messages.ts` | Every interface string in English and Arabic, type-checked with `MessageKey`. Product copy is stored as `Localized` fields on product data. |
| Application | `src/application/` | React providers and hooks: `LocaleProvider` (locale, `dir`, `t`, `pick`, `formatPrice`, sets `<html lang dir>`), `CartProvider`, `WishlistProvider` (both persisted), `UIProvider` (quick view, search and account overlays), and `use-catalog.ts` (`useProducts`, `useCatalog`, `useProduct`, `useBag` through React Query). `AppProviders` puts them together. |
| Presentation | `src/presentation/` | `hooks/use-shop-actions.tsx` pairs state changes with toasts. `components/` holds focused pieces grouped by `layout`, `product`, `home`, `bag`, `checkout`, `dialogs` and `common`. `pages/` contains one file per route. |

`App.tsx` only sets up providers, the router, the shell and the error boundary.

## Routes
`/`, `/shop`, `/shop/:category` (men, women, unisex; supports `?q=`), `/product/:id`, `/bag`, `/checkout`, `/wishlist`, and a 404 page.

## Replacing demo data
Write a `ProductRepository` that calls the real store API and swap it in at `application/use-catalog.ts`. No other code changes.

## Checkout
Checkout validates delivery details with zod and shows a review on screen. It never sends data anywhere. The "Place order" control stays disabled with a visible notice until payment and the store connection exist.

## Design tokens
Deep Olive `#263A32` (the only primary colour), Warm Ivory `#F4EFE6`, Charcoal, Champagne Gold `#B89B72`, Soft Sage `#A9B7A8`. Fonts: Kedebideri (logo and display), DM Sans (body), IBM Plex Sans Arabic and Amiri (RTL). Motion respects `prefers-reduced-motion`.
