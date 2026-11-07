# HIKAYAT

A bilingual English/Arabic fragrance storefront for discovering perfumes and managing a shopping bag.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/hikayat run dev` — storefront, through its managed workflow
- The first storefront uses a sample catalog and browser persistence; it does not require database credentials.

## Stack

### Required stack — user instruction

- Framework: Next.js App Router with TypeScript.
- Styling: Tailwind CSS.
- Database: Supabase only. The user's latest “use only supabase” instruction supersedes the earlier MongoDB Atlas/Mongoose requirement.
- Passwords: bcryptjs; hash before saving.
- Login sessions: JWT stored in an httpOnly cookie.
- Payments (Day 5): Stripe, test mode only.
- Deployment (Day 5): Vercel, from GitHub.
- Do not use Replit's built-in database, MongoDB, SQLite, or a second database. Supabase's managed PostgreSQL is explicitly allowed by the latest instruction.
- Do not use Replit Auth or any third-party login service.
- Do not add a separate Express server; use Next.js API routes in `app/api/...`.
- Do not switch frameworks or add large libraries without asking first.

### Current implementation

The storefront currently uses React/Vite. Migration to the required stack has not been performed. Existing Express and database packages are unused scaffolding, not the approved stack for new work.

## Secrets and security — always

- All secrets live in Replit Secrets as environment variables. Never write a key, password, or connection string in code.
- MongoDB connection settings are no longer required. Supabase connection settings must be configured securely before connecting the storefront. `JWT_SECRET` will be needed if custom JWT login is implemented.
- Required on Day 5: `STRIPE_SECRET_KEY`; bonus webhook integration: `STRIPE_WEBHOOK_SECRET`.
- Use secrets only on the server in API routes and server code, never in client components.
- Never store plain passwords; always hash with bcryptjs.
- Never return password hashes in API responses.
- Keep `.env*` excluded in `.gitignore`.
- If a required secret is missing, stop and tell the user exactly which secret to add in Replit Secrets and where to get it.

## Where things live

- `artifacts/hikayat/` — storefront and its architecture documentation.
- `artifacts/api-server/` — unused API scaffold; do not extend it for HIKAYAT.
- `lib/` — shared workspace libraries.

## Architecture decisions

- Start with a frontend catalog because the user explicitly permits realistic placeholder products until actual store data is supplied.
- Do not claim payments, customer authentication, or order placement succeed without a connected service.
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
