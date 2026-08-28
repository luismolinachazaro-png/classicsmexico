# Classics Mexico

Classics Mexico presenta autos clásicos importados y legalizados para clientes en México, con traslado nacional y apoyo para importar desde Estados Unidos o Europa.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/classic-car-imports/src/App.tsx` — public website routes and shared UI
- `artifacts/classic-car-imports/src/index.css` — Classics Mexico visual tokens and global styling
- `lib/api-spec/openapi.yaml` — source of truth for inventory, sold cars, services, summary, and inquiries
- `artifacts/api-server/src/routes/classic-cars.ts` — API handlers for the public site
- `lib/db/src/schema/index.ts` — PostgreSQL tables for vehicles, sold vehicles, and inquiries

## Architecture decisions

- Inventory and sold vehicles are separate tables so the public archive can preserve completed placements.
- Service offerings are stable editorial content served by the API, while vehicle and inquiry data are persisted in PostgreSQL.
- The public experience is intentionally inquiry-led: price and vehicle details are transparent, with import costs handled through a personal conversation.

## Product

The site presents available classic vehicles and a sold-car archive. Transport within Mexico and international sourcing/import services have separate pages and distinct customer journeys.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Run API codegen after any OpenAPI change so both client hooks and server schemas stay aligned.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
