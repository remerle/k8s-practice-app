# Agent Instructions

Instructions for AI coding agents working in this repository.

## Project Overview

Monorepo with two deployable packages:

- `frontend/` - SvelteKit 2 (Svelte 5) with adapter-node
- `backend/` - Fastify 5 with TypeScript, Knex, PostgreSQL

Both packages use ES modules (`"type": "module"`). The root uses npm workspaces.

## Key Commands

```bash
just install       # Install all dependencies
just dev           # Run frontend + backend concurrently
just format        # Prettier (includes Svelte files)
just lint          # ESLint
just test          # Run all tests
just validate      # Full check: format check, lint, typecheck both, tests
just migrate       # Run Knex migrations (requires Postgres)
```

Always run `just validate` before committing.

## Configuration

All config is via environment variables. See the README Configuration section for the full table.

Key points for agents:

- **Backend** uses `DATABASE_URL` (default `postgres://shop:shop@localhost:5432/shop`) and `FIREBASE_PROJECT_ID` (default `k8s-practice-app`). These must be set explicitly in production. Listens on `PORT` (default 3000), binds `0.0.0.0`. CORS configured via `CORS_ORIGIN` env var (default `http://localhost:5173`).
- **Frontend** uses `API_URL` (default `http://localhost:3000`) and `FIREBASE_*` vars (defaults match the `k8s-practice-app` project). These must be set explicitly in production. Listens on `PORT` (default 3000 via adapter-node).
- **Runtime env**: The frontend reads env at runtime via `$env/dynamic/private`, not at build time. No `PUBLIC_` prefixed vars. `API_URL` is server-only and never exposed to the client.
- **API proxy**: The frontend's `hooks.server.ts` proxies `/api/*` and `/images/*` requests to the backend. Only the frontend should be exposed via ingress; the backend is an internal service.
- **Image storage**: Backend stores uploaded images to `IMAGE_STORAGE_PATH` (default `./images`) and serves them at `/images/` (accessed by clients through the frontend proxy).
- **Health check**: `GET /api/health` returns 200 with DB up, 503 with DB down.

## Architecture Decisions

- **Runtime env config**: Supports swapping config per deployment without rebuilding.
- **Single-ingress frontend**: The SvelteKit server proxies `/api/*` and `/images/*` to the backend via `hooks.server.ts`. The backend is not exposed externally. Client-side code uses relative paths; SSR load functions use `API_URL` directly.
- **No ORM**: Knex query builder only. Keep queries in route handlers; no separate repository layer.
- **Auth is admin-only**: Firebase Google auth protects `/admin` routes. The storefront is fully public. Cart lives in localStorage.
- **Image storage on disk**: Backend writes to and serves from a configurable directory. The path is set via `IMAGE_STORAGE_PATH`.
- **Auto-migration**: The Knex db plugin runs `migrate.latest()` on startup. Migrations must be additive (no column drops or renames).
- **Connection pool**: Knex is configured with pool `min: 2`, `max: 10`, acquire timeout 10s, idle timeout 30s (hardcoded in `plugins/db.ts`).
- **Docker builds use `npm install`, not `npm ci`**: npm's lockfile (v3) only records platform-specific optional deps for the OS/arch where it was generated. Since the lockfile is generated on macOS but Docker builds run on linux, `npm ci` fails on native binaries (rollup, lightningcss, etc.). Each Dockerfile copies only its `package.json` and runs `npm install`. The root lockfile pins versions for local dev. Ideally, migrate to pnpm which handles cross-platform lockfiles correctly.

## Database Schema

Single table, auto-migrated on startup via `001_create_products.ts`:

| Column           | Type          | Constraints       |
| ---------------- | ------------- | ----------------- |
| `id`             | integer       | auto-increment PK |
| `name`           | varchar(255)  | not null          |
| `description`    | text          | nullable          |
| `sku`            | varchar(100)  | unique, not null  |
| `price`          | decimal(10,2) | not null          |
| `image_location` | varchar(500)  | nullable          |
| `created_at`     | timestamptz   | default now()     |
| `updated_at`     | timestamptz   | default now()     |

Key constraints: `sku` must be unique (duplicate inserts will fail at the DB level), `price` stores two decimal places.

## Conventions

### Backend

- Routes are Fastify plugins in `src/routes/`. Register them in `src/index.ts`.
- Shared plugins (db, firebase) use `fastify-plugin` and decorate the app instance.
- Config is centralized in `src/config.ts`; use `requireEnv()` for mandatory vars.
- Admin routes use `app.verifyFirebaseToken` as a preHandler hook.
- Multipart uploads use `request.parts()` iterator from `@fastify/multipart`.

### Frontend

- Page data comes from `+page.server.ts` load functions (SSR). SSR loads read `API_URL` from `$env/dynamic/private`.
- Admin pages use client-side fetches with auth tokens (no server load). Client-side calls use relative paths (proxied via `hooks.server.ts`).
- The API client in `$lib/api.ts` is the single interface to the backend. `apiUrl` parameter is optional; omit it for relative paths (client-side), pass `API_URL` for absolute paths (SSR).
- Svelte stores in `$lib/stores/` for shared state (auth, cart).
- Components in `$lib/components/`.

### Style

- Prettier with svelte plugin. Config in `.prettierrc`.
- ESLint with typescript-eslint and svelte plugin. Config in `eslint.config.js`.
- Single quotes, trailing commas, 100 char line width.
- No `any` unless unavoidable (warned, not errored).

### Git

- Commit messages: short imperative title, blank line, bulleted details.
- Do not commit `.env`, `images/`, `node_modules/`, or build output.
- Do not commit planning artifacts from `docs/superpowers/` or `.superpowers/`.

### Testing

- Backend: integration tests using `fastify.inject()` against real Postgres. Test helper in `tests/helper.ts`.
- Frontend: unit tests for store logic. Uses vitest with SvelteKit vite plugin.
- Test meaningful behavior, not implementation details.

## File Layout Reference

```
backend/src/
├── config.ts              # Env var loading
├── index.ts               # Server entry point (binds 0.0.0.0:PORT)
├── plugins/
│   ├── db.ts              # Knex connection + auto-migrate
│   └── firebase.ts        # Firebase Admin + token verification
├── routes/
│   ├── admin.ts           # POST/PUT/DELETE products (authed)
│   ├── health.ts          # GET /api/health
│   └── products.ts        # GET products (public)
└── migrations/
    └── 001_create_products.ts

frontend/src/
├── hooks.server.ts          # API proxy: forwards /api/* and /images/* to backend
├── lib/
│   ├── api.ts               # Backend API client
│   ├── firebase.ts          # Firebase client init
│   ├── stores/
│   │   ├── auth.ts          # Firebase auth state
│   │   └── cart.ts          # Cart with localStorage
│   └── components/
│       ├── ProductCard.svelte
│       └── CartItem.svelte
└── routes/
    ├── +layout.server.ts    # Runtime env config (Firebase vars only)
    ├── +layout.svelte       # Nav with cart count
    ├── +page.svelte         # Product listing
    ├── products/[id]/       # Product detail
    ├── cart/                # Cart page
    └── admin/               # Auth guard, CRUD, login
```
