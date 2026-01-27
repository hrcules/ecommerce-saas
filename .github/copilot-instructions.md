<!-- Purpose: guidance for AI coding agents working on this repo -->
# Copilot / AI Agent Instructions

This file explains the minimal, actionable knowledge an AI coding agent needs to be productive in this repository.

- Project type: Next.js app-router (Next 15) in TypeScript. Main app code lives under `src/app`.
- DB: Drizzle ORM is used. DB schema and seed live in `src/db` and migration artifacts are under `drizzle/`.
- Auth: `lib/auth.ts` and `lib/auth-client.ts` implement auth flows; server route handlers are under `src/app/api/auth/[...all]/route.ts`.
- Data flow: UI components call client hooks in `src/hooks/queries` and `src/hooks/mutations` which use `@tanstack/react-query` (see `providers/react-query.tsx`). Server state changes are implemented as server actions in `src/actions/*` (each action often has a `schema.ts`).

Key files & patterns (examples):

- Server actions: `src/actions/add-cart-product/index.ts` paired with `src/actions/add-cart-product/schema.ts` — follow this schema/handler pairing.
- DB schema: `src/db/schema.ts` (Drizzle). Use `drizzle-kit`/`drizzle-seed` for migrations and seeding.
- React Query provider: `src/providers/react-query.tsx` — ensure mutations/queries are wrapped by this provider.
- UI: `src/components/common` and `src/components/ui` contain presentational components and primitives (Radix + Tailwind patterns).

Conventions & expectations

- Type safety: files use TypeScript + `zod` for request/validation schemas. When adding endpoints or actions, create/extend a matching `schema.ts` with `zod` and import it in the handler.
- Actions are colocated: keep `index.ts` (handler) next to `schema.ts` in the same action folder.
- Server vs client: prefer server components in `app` for page-level rendering; client components live in `components` or use the `'use client'` directive.
- Notifications: project uses `sonner` for toasts — follow existing usage in `components` and `product-variant/components/product-actions.tsx`.

Build / dev / lint

- Run locally: `npm run dev` (starts Next dev server on :3000).
- Build: `npm run build` then `npm run start`.
- Lint/format: `npm run lint`. Prettier + `prettier-plugin-tailwindcss` is configured in devDependencies.

Integrations & third-party libs

- Drizzle ORM (`drizzle-orm`, `drizzle-kit`) and Postgres (`pg`). See `drizzle.config.ts` and `src/db/seed.ts`.
- Auth: `better-auth` + local `lib/auth*` helpers; review `src/app/api/auth/[...all]/route.ts` for the auth contract.
- UI libs: Radix UI, `lucide-react`, `sonner`, `next-themes`, Tailwind CSS v4.

Agent guidance for common tasks

- Adding a server action: create `src/actions/<name>/schema.ts` (zod), then `index.ts` to implement behavior. Update any client hooks in `src/hooks/*` and invalidate React Query caches via keys in `providers/react-query.tsx`.
- Adding DB columns/tables: update `src/db/schema.ts`, add a migration using `drizzle-kit`, and update `drizzle/` snapshot/SQL. Run the seed scripts in `src/db/seed.ts` as needed.
- Authentication flows: consult `lib/auth.ts` and `lib/auth-client.ts` for token/session handling. Mirror request/response shapes used in `src/app/api/auth/[...all]/route.ts`.

What not to change without confirmation

- Global router or Next.js app structure (`src/app/*`). Significant layout or routing changes affect many pages.
- DB schema changes without corresponding migration and seed updates.

If unclear or missing

- Ask: intended DB migration workflow (local DB connection details), preferred branch/PR conventions, or whether you should run seeds/migrations locally before code changes.

---
If this initial guidance misses anything you rely on, tell me which files or workflows to capture and I'll iterate.
