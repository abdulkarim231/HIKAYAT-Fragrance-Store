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
- Delivery form validation and an on-screen checkout review.
- Loading, error, empty, and not-found states.
- Reduced-motion support.

## Current status

This is a **frontend-first demo storefront**, not a live commerce service.

- Products and prices are sample data.
- Shopping preferences are stored in the current browser, not synchronized to an account.
- The account dialog describes guest mode; customer authentication is not connected.
- Checkout does not transmit delivery details, accept payments, or place orders.
- Order placement remains disabled until a real store and payment service are integrated.
- The shared API and database packages are scaffolding and are not required by the current storefront.

## Technology

- React and TypeScript
- Vite
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

The Vite configuration requires `PORT` and `BASE_PATH`. On a POSIX shell:

```bash
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/hikayat run dev
```

Open the address reported by Vite. No API keys or database credentials are needed for the demo storefront.

## Development commands

Run these commands from the repository root:

```bash
# Check the storefront's TypeScript
pnpm --filter @workspace/hikayat run typecheck

# Check all workspace packages
pnpm run typecheck

# Build the storefront outside the managed workflow
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/hikayat run build

# Preview the built storefront outside the managed workflow
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/hikayat run serve
```

The storefront build output is `artifacts/hikayat/dist/public/`. A static host must send application routes to `index.html` so direct visits to product and shop pages work.

## Clean architecture

The storefront separates business rules, application state, external dependencies, and UI:

```text
artifacts/hikayat/
├── public/images/       # Fragrance and editorial imagery
├── src/
│   ├── domain/          # Product types and pure cart/catalog operations
│   ├── infrastructure/  # Demo catalog, repository, storage and asset adapters
│   ├── application/     # Providers and hooks coordinating shopping state
│   ├── i18n/            # English and Arabic interface messages
│   ├── presentation/    # Focused components, pages and interaction hooks
│   └── App.tsx          # Providers, application shell and routes
└── ARCHITECTURE.md      # Detailed architecture and integration notes
```

Domain code does not depend on React or browser APIs. Infrastructure handles catalog access and persistence; application hooks coordinate state; presentation renders the shopping experience.

See [the architecture guide](artifacts/hikayat/ARCHITECTURE.md) for more detail.

### Workspace structure

| Directory | Purpose |
| --- | --- |
| `artifacts/hikayat/` | HIKAYAT storefront |
| `artifacts/api-server/` | Shared Express API scaffold |
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
| `/bag` | Shopping bag |
| `/checkout` | Demo delivery details and review |

## Customization

### Catalog

Edit the sample products in `artifacts/hikayat/src/infrastructure/demo-products.ts`.

To connect real store data, implement the `ProductRepository` interface and replace the demo repository used by `artifacts/hikayat/src/application/use-catalog.ts`. Real checkout, inventory, account synchronization, and server-side price validation require additional integration work.

### Languages

Interface translations live in `artifacts/hikayat/src/i18n/messages.ts`. Product names, descriptions, and notes use localized fields in the catalog.

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

Connect an actual product and inventory source, customer authentication if needed, and a secure server-backed checkout/payment service. Validate prices and availability on the server, configure shipping and store policies, and verify the complete purchase flow before enabling order placement.
