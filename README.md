# HIKAYAT

**Every Scent Tells a Story.**

A responsive English/Arabic perfume storefront built with React and TypeScript. HIKAYAT combines a calm, modern luxury identity with fragrance discovery, product details, and a persistent shopping bag.

## Features

- Responsive layouts for desktop, tablet, and mobile.
- English and Arabic interfaces with automatic LTR/RTL layout.
- Search, category filtering, best-seller filtering, and sorting.
- Product detail pages and quick-view dialogs with fragrance notes.
- Wishlist with individual and bulk shopping actions.
- Shopping bag with quantity controls, removal, subtotal, and savings.
- Immediate notifications for shopping actions.
- Browser persistence for the bag, wishlist, and language preference.
- Delivery form validation, checkout review, and Stripe-hosted test payments.
- Supabase Auth account creation, sign-in, and sign-out through server-side API routes.
- Supabase-backed catalog with published-product read access and no public write permissions.
- Loading, error, empty, and not-found states.
- Reduced-motion support.

## Current status

This storefront uses **Next.js and Supabase**, with sample product data and **Stripe test mode only**. No real payments or product deliveries are supported.

- Products and prices are sample data stored in the Supabase `public.products` table.
- Shopping preferences are stored in the current browser, not synchronized to an account.
- Customer authentication uses Supabase Auth. Email confirmation follows the project's Supabase settings.
- Checkout does not transmit delivery details, accept payments, or place orders.
- Order placement remains disabled until a real store and payment service are integrated.
- The shared Express API and Replit database packages are unused scaffolding, not part of the storefront's backend.

## Technology

- Next.js App Router, React, and TypeScript
- Tailwind CSS
- Wouter routing
- TanStack React Query
- React Hook Form and Zod
- Framer Motion
- pnpm workspaces

## Getting started

### Prerequisites

- Node.js 24
- pnpm

Install dependencies from the repository root:

```bash
pnpm install
```

### Run in the project

Start the managed **`artifacts/hikayat: web`** workflow. It supplies the port and base-path configuration used by the preview.

### Run locally outside the managed workflow

The application accepts `PORT` and `BASE_PATH`. On a POSIX shell:

```bash
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/hikayat run dev
```

Open the address reported by Next.js. Configure `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in Replit Secrets, or in a private ignored `.env.local` for development outside Replit. Never commit credentials. Both settings are read only on the server; neither is included in client bundles.

### Supabase setup

- `public.products` holds catalog rows with `id`, localized product `data` (JSONB), and a `published` flag.
- Row-level security permits public reads of published products only. There are no public write policies.
- Schema migration files live in `artifacts/hikayat/supabase/migrations/`.
- The existing 10 sample fragrances have been seeded without overwriting existing rows.
- Rerun `artifacts/hikayat/supabase/seed.sql` in Supabase SQL Editor to insert three sample products when missing. It does not overwrite existing products.
- Use the Supabase dashboard to edit product data or add products. Product data must match `src/domain/product-schema.ts`.
- Edit the `data` payload: the top-level `name`, `description`, `price`, `image`, and `category` columns are generated from it automatically.
- Enable Email authentication in Supabase Auth. If email confirmation is enabled, configure allowed redirect URLs to include your application origin followed by `/api/auth/callback`.
- Confirmation completes in the same browser that requested signup using a server-held PKCE verifier. A user who confirms on another device can return to the store and sign in after verification.
- Session tokens live in httpOnly cookies with SameSite protections. Credentials and tokens are never returned to client JavaScript or stored in localStorage.

## Development commands

Run these commands from the repository root:

```bash
# Check the storefront's TypeScript
pnpm --filter @workspace/hikayat run typecheck

# Check all workspace packages
pnpm run typecheck

# Verify shared database client safety and seed data
pnpm --filter @workspace/hikayat run test:db

# Build the storefront outside the managed workflow
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/hikayat run build

# Preview the built storefront outside the managed workflow
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/hikayat run serve
```

This is a server-backed Next.js application, not a static export. Production requires `next build` followed by `next start`, or a Next.js-compatible host such as Vercel. The same Supabase settings must be configured on the production host.

### Vercel

- Import only `artifacts/hikayat`, with the **Next.js** framework preset.
- Include source files outside the root directory so shared workspace packages in `lib/` are available.
- Install command: `pnpm install --frozen-lockfile`.
- Build command: `pnpm run build`. The storefront script first builds its referenced API client's TypeScript declarations, then runs Next.js, so a fresh checkout does not depend on ignored local build outputs.
- Leave the output directory at its Next.js default.
- Add `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` privately in Vercel's environment variables.
- After publishing, allow the site's `/api/auth/callback` URL in Supabase Authentication's redirect URL settings.

## Clean architecture

The storefront separates business rules, application state, external dependencies, and UI:

```text
artifacts/hikayat/
├── public/images/       # Fragrance and editorial imagery
├── src/
│   ├── domain/          # Product types and pure cart/catalog operations
│   ├── app/             # Next.js document, client entry point and API routes
│   ├── infrastructure/  # Catalog, auth, persistence and server-only adapters
│   ├── lib/db.ts        # Globally cached, server-only Supabase connection helper
│   ├── models/          # User, Product and Order data models
│   ├── application/     # Providers and hooks coordinating shopping state
│   ├── i18n/            # English and Arabic interface messages
│   ├── presentation/    # Focused components, pages and interaction hooks
│   └── App.tsx          # Providers, application shell and routes
└── ARCHITECTURE.md      # Detailed architecture and integration notes
```

Domain code does not depend on React or browser APIs. Infrastructure handles catalog access and persistence; application hooks coordinate state; presentation renders the shopping experience.

The shared connection helper is lazy so production builds do not need to contact Supabase. It reuses a stateless client across warm server invocations without sharing user tokens. `User` profiles have a name, unique email and creation date; password hashing stays with Supabase Auth. Orders contain a user reference, product/quantity/price snapshots, total, status (`pending` or `paid`) and creation date. Database ownership policies prevent customers from reading another customer's profile or orders.

See [the architecture guide](artifacts/hikayat/ARCHITECTURE.md) for more detail.

### Workspace structure

| Directory | Purpose |
| --- | --- |
| `artifacts/hikayat/` | HIKAYAT storefront |
| `artifacts/api-server/` | Unused Express scaffold; storefront uses Next.js routes |
| `artifacts/mockup-sandbox/` | Component preview sandbox |
| `lib/` | Shared API contracts, generated clients, validation, and database libraries |
| `scripts/` | Workspace utility scripts |

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Brand homepage and fragrance discovery |
| `/shop` | Searchable, filterable catalog |
| `/shop/men` | Men's fragrances |
| `/shop/women` | Women's fragrances |
| `/shop/unisex` | Unisex fragrances |
| `/product/:id` | Product details |
| `/wishlist` | Saved fragrances |
| `/login` | Bilingual sign-in, account creation, and account session controls |
| `/bag` | Shopping bag |
| `/checkout` | Authenticated delivery details, review, and Stripe test checkout |
| `/checkout/success` | Server-verified test order confirmation |

## Customization

### Catalog

Edit products in Supabase's `public.products` table. The original `demo-products.ts` is retained as seed reference only and is not imported by the runtime catalog repository.

The `ProductRepository` fetches `/api/catalog`; its server adapter reads and validates Supabase product data. Database errors produce a retryable UI state, not a hardcoded fallback. Checkout validates prices server-side and uses real test-mode Stripe price IDs. Inventory, fulfillment, and cross-device cart synchronization are not implemented.

### Languages

Interface translations live in `artifacts/hikayat/src/i18n/messages.ts`. Product names, descriptions, and notes use localized fields in Supabase product data.

Keep English and Arabic messages aligned when adding new features.

### Brand

The visual theme lives in `artifacts/hikayat/src/index.css`.

| Role | Color |
| --- | --- |
| Primary — Deep Olive | `#263A32` |
| Background — Warm Ivory | `#F4EFE6` |
| Accent — Champagne Gold | `#B89B72` |
| Secondary — Soft Sage | `#A9B7A8` |

English display typography uses Kedebideri, with DM Sans for body text. Arabic uses Amiri and IBM Plex Sans Arabic.

## Before accepting real orders

Before any real launch, implement inventory and fulfillment, configure shipping and store policies, resolve signup email delivery, and verify the complete purchase flow. Live Stripe keys are deliberately rejected by this implementation.

## Stripe test checkout setup

All credentials are server-only. Save these in **Replit Secrets**, and separately in
**Vercel → Project → Settings → Environment Variables**:

| Name | Value source |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key |
| `SUPABASE_DATABASE_URL` | Supabase **Connect → Session pooler** PostgreSQL URI, with the database password filled in privately |
| `STRIPE_SECRET_KEY` | Stripe test secret key beginning `sk_test_` |
| `APP_URL` | The public HTTPS origin of the intended deployment, with no path |

`STRIPE_PUBLISHABLE_KEY` may remain stored securely but is not needed for hosted
Checkout; the browser redirects to Stripe instead of embedding a card form.
Do not use live keys or put any secret in a `NEXT_PUBLIC_*` variable.

For Vercel, set the variables for the Production environment and redeploy.
Replit Secrets do not automatically become Vercel environment variables.

Run this once for initial setup, and again after changing catalog prices:

```bash
pnpm --filter @workspace/hikayat run setup:stripe
```

The script uses the existing Supabase database, creates the Stripe sync schema
through `stripe-replit-sync`, adds non-destructive checkout order columns, and
creates or reuses Stripe test products/prices for published Supabase products.
It registers a managed webhook at `${APP_URL}/api/stripe/webhook` and backfills
Stripe data. The sync schema is not exposed to public Supabase roles. The public
Supabase catalog remains the editorial source; its IDs are linked through Stripe
product metadata. Payment prices are queried from the synced Stripe tables.

The public deployment must serve the webhook route without login or deployment
protection; the route itself requires a valid Stripe signature. Managed signing
secrets remain server-side in the protected sync schema. An optional manually
configured `STRIPE_WEBHOOK_SECRET` must match that endpoint if supplied.

Checkout requires a confirmed Supabase session. Order creation uses database
price snapshots, server-owned identity, transactions, and idempotency keys.
Only verified Stripe payment status can mark an order paid. A success-page URL
alone never confirms payment. Cancelled or failed payments retain the shopping
bag; verified purchases remove only purchased quantities, once per order.

Test with Stripe card **4242 4242 4242 4242**, a future expiry and any test CVC.
Never enter real card information. No shipping fee is charged in test mode.

```bash
pnpm --filter @workspace/hikayat run test:db
pnpm --filter @workspace/hikayat run test:payments
pnpm --filter @workspace/hikayat run build
```
