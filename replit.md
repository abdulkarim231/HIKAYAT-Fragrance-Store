# HIKAYAT

A bilingual English/Arabic fragrance storefront for discovering perfumes and managing a shopping bag.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/hikayat run dev` — storefront, through its managed workflow
- The first storefront uses a sample catalog and browser persistence; it does not require database credentials.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/hikayat/` — storefront and its architecture documentation.
- `artifacts/api-server/` — shared API scaffold, reserved for future real commerce integrations.
- `lib/` — shared workspace libraries.

## Architecture decisions

- Start with a frontend catalog because the user explicitly permits realistic placeholder products until actual store data is supplied.
- Do not claim payments, customer authentication, or order placement succeed without a connected service.
- Keep the product domain, shopping operations, persistence adapters, and presentation separate so real store data can replace sample data without rewriting the interface.

## Product

Luxury perfume discovery, category filtering, search, quick view, wishlist, and a persistent shopping bag with English/LTR and Arabic/RTL support.

## User preferences

- The user explicitly requests clean architecture.
- Brand: HIKAYAT. Tagline: “Every Scent Tells a Story.”
- Deep Olive `#263A32` is the only primary color. Supporting colors are Warm Ivory `#F4EFE6`, Champagne Gold `#B89B72`, and Soft Sage `#A9B7A8`.
- Use Kedebideri for the English logo and display headings, with readable sans-serif body text.
- The audience is young adults aged 18–35; the experience should feel premium, calm, elegant, and youthful.
- All shopping interactions must provide meaningful feedback; avoid decorative controls that do nothing.

## Gotchas

- Run artifact services using their managed workflows so routing and environment variables are supplied.
- Do not fabricate product reviews, payment success, or authentication.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
