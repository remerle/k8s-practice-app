# K8s Practice Application

A simple e-commerce application. Monorepo with separately deployable frontend and backend services.

## Architecture

```
Browser --> SvelteKit Frontend --> Fastify Backend --> PostgreSQL
```

- **Frontend**: SvelteKit with adapter-node. Storefront (product browsing, cart) is public. Admin (`/admin`) requires Google sign-in via Firebase.
- **Backend**: Fastify REST API. Serves product data and uploaded images. Admin routes protected by Firebase Admin SDK token verification.
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

| Command | Description |
|---------|-------------|
| `just install` | Install all dependencies |
| `just setup` | First-time setup (install + DB + migrations) |
| `just dev` | Run both frontend and backend |
| `just dev-frontend` | Run frontend only |
| `just dev-backend` | Run backend only |
| `just db-up` | Start local Postgres |
| `just db-down` | Stop local Postgres |
| `just migrate` | Run database migrations |
| `just format` | Format all code with Prettier |
| `just lint` | Lint all code with ESLint |
| `just test` | Run all tests |
| `just build` | Build both packages |
| `just validate` | Full validation (format + lint + typecheck + tests) |
| `just docker-build` | Build Docker images locally |

## Configuration

All configuration is via environment variables. See `.env.example` for the full list with defaults.

```bash
cp .env.example .env
```

### Backend

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string (e.g. `postgres://user:pass@host:5432/dbname`) |
| `FIREBASE_PROJECT_ID` | Yes | - | Firebase project ID for admin token verification |
| `PORT` | No | `3000` | Port the backend listens on |
| `IMAGE_STORAGE_PATH` | No | `./images` | Directory for uploaded product images |

The backend binds to `0.0.0.0` on the configured port.

### Frontend

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `API_URL` | No | `http://localhost:3000` | Backend API base URL (used for both SSR and client-side requests) |
| `FIREBASE_API_KEY` | Yes | - | Firebase client API key |
| `FIREBASE_AUTH_DOMAIN` | Yes | - | Firebase auth domain |
| `FIREBASE_PROJECT_ID` | Yes | - | Firebase project ID |
| `FIREBASE_STORAGE_BUCKET` | Yes | - | Firebase storage bucket |
| `FIREBASE_MESSAGING_SENDER_ID` | Yes | - | Firebase messaging sender ID |
| `FIREBASE_APP_ID` | Yes | - | Firebase app ID |
| `PORT` | No | `3000` | Port the frontend listens on (adapter-node) |

The frontend reads all environment variables at **runtime** (not build time) via SvelteKit's `$env/dynamic/private` in the root layout server load function, then passes them to the client as page data.

### Health Check

The backend exposes `GET /api/health` which returns `{"status": "ok"}` (200) when the database is reachable, or `{"status": "error", "message": "..."}` (503) when it is not.

## Project Structure

```
application/
├── frontend/          # SvelteKit app (adapter-node)
│   ├── src/
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
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

## Docker Images

Images are built and pushed to ghcr.io via GitHub Actions on push to `main`:

- `ghcr.io/remerle/k8s-practice-frontend`
- `ghcr.io/remerle/k8s-practice-backend`

Builds are path-filtered: frontend changes only rebuild the frontend image, and vice versa.

Both images expose port 3000 by default. The backend image expects `IMAGE_STORAGE_PATH` to point to a persistent directory (defaults to `/data/images` in the container).
