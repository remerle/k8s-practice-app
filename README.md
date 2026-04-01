# K8s Practice Application

A simple e-commerce application. Monorepo with separately deployable frontend and backend services.

## Architecture

```
Browser --> SvelteKit Frontend (proxy) --> Fastify Backend --> PostgreSQL
```

- **Frontend**: SvelteKit with adapter-node. The sole ingress point; proxies `/api/*` and `/images/*` requests to the backend via `hooks.server.ts`. Storefront (product browsing, cart) is public. Admin (`/admin`) requires Google sign-in via Firebase.
- **Backend**: Fastify REST API. Internal service (not exposed externally). Serves product data and uploaded images. Admin routes protected by Firebase Admin SDK token verification.
- **Database**: PostgreSQL with Knex for queries and migrations.
- **Auth**: Firebase Authentication (Google provider). Admin-only; no user accounts for shoppers.
- **Cart**: Client-side only (localStorage). No checkout flow.

## Prerequisites

- Node.js 22+
- Docker (for local Postgres)
- [just](https://github.com/casey/just) (task runner)

## Getting Started

```bash
# First-time setup: install deps, start Postgres, run migrations
just setup

# Start both frontend and backend
just dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:3000`.

## Available Commands

| Command               | Description                                                    |
| --------------------- | -------------------------------------------------------------- |
| `just install`        | Install all dependencies                                       |
| `just setup`          | First-time setup (install + DB + migrations)                   |
| `just dev`            | Run both frontend and backend                                  |
| `just dev-frontend`   | Run frontend only                                              |
| `just dev-backend`    | Run backend only                                               |
| `just db-up`          | Start local Postgres                                           |
| `just db-down`        | Stop local Postgres                                            |
| `just migrate`        | Run database migrations                                        |
| `just format`         | Format all code with Prettier                                  |
| `just format-check`   | Check formatting without writing                               |
| `just lint`           | Lint all code with ESLint                                      |
| `just lint-fix`       | Lint and auto-fix fixable issues                               |
| `just test`           | Run all tests (requires a `test` script in both workspaces)    |
| `just test-backend`   | Run backend tests only (requires Postgres)                     |
| `just test-frontend`  | Run frontend tests only                                        |
| `just check-backend`  | Type-check the backend                                         |
| `just check-frontend` | Type-check the frontend                                        |
| `just build`          | Build both packages                                            |
| `just validate`       | Full validation (format check + lint + typecheck both + tests) |
| `just docker-build`   | Build Docker images locally                                    |

## Configuration

All configuration is via environment variables. See `.env.example` for the full list with defaults.

```bash
cp .env.example .env
```

### Backend

| Variable              | Required | Default    | Description                                                                            |
| --------------------- | -------- | ---------- | -------------------------------------------------------------------------------------- |
| `DATABASE_URL`        | Yes      | -          | PostgreSQL connection string (e.g. `postgres://user:pass@host:5432/dbname`)            |
| `FIREBASE_PROJECT_ID` | Yes      | -          | Firebase project ID for admin token verification                                       |
| `PORT`                | No       | `3000`     | Port the backend listens on                                                            |
| `IMAGE_STORAGE_PATH`  | No       | `./images` | Directory for uploaded product images (defaults to `/data/images` in the Docker image) |

The backend binds to `0.0.0.0` on the configured port.

### Frontend

| Variable                       | Required | Default                 | Description                                                                                       |
| ------------------------------ | -------- | ----------------------- | ------------------------------------------------------------------------------------------------- |
| `API_URL`                      | No       | `http://localhost:3000` | Backend API base URL (server-only; used by SSR loads and the proxy, never exposed to the browser) |
| `FIREBASE_API_KEY`             | No\*     | `''`                    | Firebase client API key                                                                           |
| `FIREBASE_AUTH_DOMAIN`         | No\*     | `''`                    | Firebase auth domain                                                                              |
| `FIREBASE_PROJECT_ID`          | No\*     | `''`                    | Firebase project ID                                                                               |
| `FIREBASE_STORAGE_BUCKET`      | No\*     | `''`                    | Firebase storage bucket                                                                           |
| `FIREBASE_MESSAGING_SENDER_ID` | No\*     | `''`                    | Firebase messaging sender ID                                                                      |
| `FIREBASE_APP_ID`              | No\*     | `''`                    | Firebase app ID                                                                                   |
| `PORT`                         | No       | `3000`                  | Port the frontend listens on (adapter-node)                                                       |

\* Required for admin authentication to work. The app starts without them, but Firebase auth (Google sign-in for admin) will not function.

The frontend reads environment variables at **runtime** (not build time) via SvelteKit's `$env/dynamic/private`. Firebase config is passed to the client via the layout server load function. `API_URL` is server-only; the frontend proxies `/api/*` and `/images/*` requests to the backend through `hooks.server.ts`, so client-side code uses relative paths.

### Health Check

The backend exposes `GET /api/health` which returns `{"status": "ok"}` (200) when the database is reachable, or `{"status": "error", "message": "..."}` (503) when it is not.

## Project Structure

```
application/
├── frontend/          # SvelteKit app (adapter-node, sole ingress)
│   ├── src/
│   │   ├── hooks.server.ts  # API proxy to backend
│   │   ├── lib/       # Shared code: API client, stores, components
│   │   └── routes/    # Pages: storefront, cart, admin
│   └── Dockerfile
├── backend/           # Fastify REST API
│   ├── src/
│   │   ├── plugins/   # Knex DB, Firebase Admin
│   │   ├── routes/    # Health, products, admin CRUD
│   │   └── migrations/
│   └── Dockerfile
├── docker-compose.yml # Local Postgres
├── justfile           # Task runner
└── .github/workflows/ # CI: build + push images to ghcr.io
```

## API Endpoints

### Public

- `GET /api/products` - List all products
- `GET /api/products/:id` - Get single product
- `GET /images/:filename` - Serve uploaded image
- `GET /api/health` - Health/readiness check

### Admin (requires Firebase auth token)

- `POST /api/products` - Create product (multipart with image)
- `PUT /api/products/:id` - Update product (multipart with image)
- `DELETE /api/products/:id` - Delete product

### Product Schema

Products have the following fields:

| Field            | Type    | Required on Create | Constraints                                                 |
| ---------------- | ------- | ------------------ | ----------------------------------------------------------- |
| `id`             | integer | (auto)             | Auto-increment primary key                                  |
| `name`           | string  | Yes                | Max 255 characters                                          |
| `description`    | string  | No                 | Free text, nullable                                         |
| `sku`            | string  | Yes                | Max 100 characters, must be unique                          |
| `price`          | string  | Yes                | Decimal format, e.g. `"29.99"` (pattern: `^\d+\.?\d{0,2}$`) |
| `image_location` | string  | No                 | Filename of uploaded image, nullable                        |
| `created_at`     | string  | (auto)             | ISO timestamp                                               |
| `updated_at`     | string  | (auto)             | ISO timestamp                                               |

### Multipart Upload Format

`POST /api/products` and `PUT /api/products/:id` accept `multipart/form-data` with the following fields:

| Field         | Type | Required     | Description                 |
| ------------- | ---- | ------------ | --------------------------- |
| `name`        | text | Yes (create) | Product name                |
| `description` | text | No           | Product description         |
| `sku`         | text | Yes (create) | Stock keeping unit (unique) |
| `price`       | text | Yes (create) | Price as a decimal string   |
| image         | file | No           | Product image (max 5 MB)    |

On update (`PUT`), all fields are optional; only provided fields are changed.

## Docker Images

Images are built and pushed to ghcr.io via GitHub Actions on push to `main`:

- `ghcr.io/remerle/k8s-practice-frontend`
- `ghcr.io/remerle/k8s-practice-backend`

Builds are path-filtered: frontend changes only rebuild the frontend image, and vice versa.

Both images expose port 3000 by default. The backend image expects `IMAGE_STORAGE_PATH` to point to a persistent directory (defaults to `/data/images` in the container).
