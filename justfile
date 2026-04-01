# K8s Practice Application

# Install all dependencies
install:
    npm install

# Start local Postgres
db-up:
    docker compose up -d

# Stop local Postgres
db-down:
    docker compose down

# Run database migrations
migrate:
    npm run migrate --workspace=backend

# Run the backend (requires Postgres)
dev-backend:
    npm run dev --workspace=backend

# Run the frontend
dev-frontend:
    npm run dev --workspace=frontend

# Run both frontend and backend
dev:
    #!/usr/bin/env bash
    trap 'kill 0' EXIT
    npm run dev --workspace=backend &
    npm run dev --workspace=frontend &
    wait

# Format all code
format:
    npm run format

# Check formatting without writing
format-check:
    npm run format:check

# Lint all code
lint:
    npm run lint

# Lint and fix auto-fixable issues
lint-fix:
    npm run lint:fix

# Run backend tests (requires Postgres)
test-backend:
    npm test --workspace=backend

# Run frontend tests
test-frontend:
    npm test --workspace=frontend

# Run all tests
test: test-backend test-frontend

# Type-check the backend
check-backend:
    npm run check --workspace=backend

# Type-check the frontend
check-frontend:
    npm run check --workspace=frontend

# Build the backend
build-backend:
    npm run build --workspace=backend

# Build the frontend
build-frontend:
    npm run build --workspace=frontend

# Build everything
build: build-backend build-frontend

# Full validation: format check, lint, type check, tests
validate: format-check lint check-backend check-frontend test

# Build Docker images locally
docker-build:
    docker build -t k8s-practice-backend ./backend
    docker build -t k8s-practice-frontend ./frontend

# First-time setup: install deps, start DB, run migrations
setup: install db-up
    @echo "Waiting for Postgres to be ready..."
    @sleep 2
    just migrate
    @echo "Done! Run 'just dev' to start the app."
