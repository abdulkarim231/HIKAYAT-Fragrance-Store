# HIKAYAT

A bilingual English/Arabic fragrance storefront for discovering perfumes and managing a shopping bag.

## Run & Operate

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/hikayat run dev` — storefront, through its managed workflow
- Storefront server requires `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in Replit Secrets.

## Stack

### Required stack — user instruction

- Framework: Next.js App Router with TypeScript.
- Styling: Tailwind CSS.
- Database: Supabase only. The user's latest “use only supabase” instruction supersedes the earlier MongoDB Atlas/Mongoose requirement.
- Authentication: Supabase Auth. The user's explicit request to enable Supabase Auth supersedes the earlier custom bcryptjs/JWT login requirement.
- Sessions: Supabase access and refresh tokens stored in server-set httpOnly cookies, never browser storage.
- Payments (Day 5): Stripe, test mode only.
- Deployment (Day 5): Vercel, from GitHub.
- Do not use Replit's built-in database, MongoDB, SQLite, or a second database. Supabase's managed PostgreSQL is explicitly allowed by the latest instruction.
- Do not use Replit Auth or a separate login provider; use Supabase Auth.
- Do not add a separate Express server; use Next.js API routes in `app/api/...`.
- Do not switch frameworks or add large libraries without asking first.

### Current implementation

The storefront runs on Next.js App Router. The existing visual components and client navigation are retained inside a client wrapper to preserve the design and device-local shopping preferences. Catalog and auth endpoints live in `src/app/api/`. Existing Express and database packages are unused scaffolding; do not extend them.

## Secrets and security — always

- All secrets live in Replit Secrets as environment variables. Never write a key, password, or connection string in code.
- Required: `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`. MongoDB credentials and a custom `JWT_SECRET` are not required.
- Required on Day 5: `STRIPE_SECRET_KEY`; bonus webhook integration: `STRIPE_WEBHOOK_SECRET`.
- Use secrets only on the server in API routes and server code, never in client components.
- Supabase Auth handles password hashing. Do not store application passwords or implement a second password database.
- Never return password hashes in API responses.
- Keep `.env*` excluded in `.gitignore`.
- If a required secret is missing, stop and tell the user exactly which secret to add in Replit Secrets and where to get it.

## Where things live

- `artifacts/hikayat/` — storefront and its architecture documentation.
- `artifacts/api-server/` — unused API scaffold; do not extend it for HIKAYAT.
- `lib/` — shared workspace libraries.

## Architecture decisions

- Database access must use one shared server-only helper at `lib/db.ts`, with the reusable client/connection cached globally for Vercel. Keep `User`, `Product`, and `Order` definitions in `models/`.
- Orders must reference a user and contain items with product reference, quantity, and price snapshot; include total, status (`pending` or `paid`), and creation timestamp.
- Provide a simple repeatable seed script or protected admin route for sample products; storefront products must come from the database.
- The catalog reads `public.products` from Supabase through the Next.js API. Seeded sample products are allowed; never silently fall back to a hardcoded catalog if the database fails.
- Supabase RLS permits reading published products only. Public roles cannot insert, update, or delete products.
- Bag, wishlist, and locale remain device-local; signing in does not imply that they synchronize between devices.
- Do not claim payments or order placement succeed without a connected service. Supabase Auth signup may require email confirmation; never report it as a signed-in session until verified.
- Keep the product domain, shopping operations, persistence adapters, and presentation separate so real store data can replace sample data without rewriting the interface.

## Product

Luxury perfume discovery, category filtering, search, quick view, wishlist, and a persistent shopping bag with English/LTR and Arabic/RTL support.

## User preferences

- Keep the design consistent across all screens.
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
