# HIKAYAT storefront architecture

Next.js App Router storefront with Supabase catalog data and Supabase Auth. Cart, wishlist and language remain device-local. Payments and order placement are not connected.

## Layers (dependencies point inward)

```
presentation  ->  application  ->  domain
                       |
                infrastructure  ->  domain
```

| Layer | Path | Responsibility |
|---|---|---|
| Domain | `src/domain/` | Types (`product.ts`) and pure functions: cart math (`cart.ts`: add, set quantity, remove, subtotal, savings, discount %), catalog search/filter/sort (`catalog.ts`). No React, no browser APIs. |
| Infrastructure | `src/infrastructure/` | Safe localStorage adapter, HTTP product repository, and asset helper. `server/` contains server-only Supabase catalog, configuration, and Auth adapters. Secrets never enter browser modules. |
| i18n | `src/i18n/messages.ts` | Every interface string in English and Arabic, type-checked with `MessageKey`. Product copy is stored as `Localized` fields on product data. |
| Application | `src/application/` | React providers and hooks: `LocaleProvider` (locale, `dir`, `t`, `pick`, `formatPrice`, sets `<html lang dir>`), `CartProvider`, `WishlistProvider` (both persisted), `UIProvider` (quick view, search and account overlays), and `use-catalog.ts` (`useProducts`, `useCatalog`, `useProduct`, `useBag` through React Query). `AppProviders` puts them together. |
| Presentation | `src/presentation/` | `hooks/use-shop-actions.tsx` pairs state changes with toasts. `components/` holds focused pieces grouped by `layout`, `product`, `home`, `bag`, `checkout`, `dialogs` and `common`. `pages/` contains one file per route. |

`App.tsx` only sets up providers, client navigation, the shell and the error boundary. Next.js owns the document and server routes under `src/app/`. The client wrapper preserves existing design and device-local preferences without hydration mismatch.

## Routes
`/`, `/shop`, `/shop/:category` (men, women, unisex; supports `?q=`), `/product/:id`, `/bag`, `/checkout`, `/wishlist`, and a 404 page.

## Catalog
The application repository calls same-origin `/api/catalog`. Its Next.js handler reads published `public.products` rows through Supabase REST using server-only configuration and validates them against a shared product schema. RLS allows public SELECT for published rows, never writes. Ten original sample products are seeded in Supabase. The original demo module is seed reference, not a runtime fallback. Queries refresh on mount/focus and every minute so dashboard edits become visible.

## Authentication
The account dialog uses generated auth hooks and a shared provider. Next.js routes handle signup, password sign-in, validated current-user lookup, refresh, logout, and PKCE email confirmation through Supabase Auth. Only user ID and email reach the client; access/refresh tokens are in httpOnly cookies. State-changing requests enforce same-origin checks. Supabase manages password hashing and confirmation policy. No custom password database or Supabase service-role key is used.

In Supabase Auth URL Configuration, allow the application origin with `/api/auth/callback`. Confirmation on a different browser cannot use the original PKCE cookie; after verifying email, the user can sign in normally. Authentication does not synchronize the device-local bag or wishlist.

## Checkout
Checkout validates delivery details with zod and shows a review on screen. It never sends data anywhere. The "Place order" control stays disabled with a visible notice until payment and the store connection exist.

## Design tokens
Deep Olive `#263A32` (the only primary colour), Warm Ivory `#F4EFE6`, Charcoal, Champagne Gold `#B89B72`, Soft Sage `#A9B7A8`. Fonts: Kedebideri (logo and display), DM Sans (body), IBM Plex Sans Arabic and Amiri (RTL). Motion respects `prefers-reduced-motion`.
