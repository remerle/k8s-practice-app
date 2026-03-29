# K8s Practice Application

A simple e-commerce application built for Kubernetes practice. Monorepo with separately deployable frontend and backend containers.

## Architecture

```
Browser --> SvelteKit Frontend --> Fastify Backend --> PostgreSQL
                (Container 1)       (Container 2)     (StatefulSet)
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
- `GET /api/health` - Health check

### Admin (requires Firebase auth token)

- `POST /api/products` - Create product (multipart with image)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

## Environment Variables

See `.env.example` for all required variables. Copy to `.env` for local development:

```bash
cp .env.example .env
```

## Docker Images

Images are built and pushed to ghcr.io via GitHub Actions on push to `main`:

- `ghcr.io/remerle/k8s-practice-frontend`
- `ghcr.io/remerle/k8s-practice-backend`

Builds are path-filtered: frontend changes only rebuild the frontend image, and vice versa.
