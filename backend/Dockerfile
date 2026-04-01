FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json ./
# npm install (not ci): the workspace root lockfile doesn't include linux native
# binaries when generated on macOS. Migrate to pnpm to fix this properly.
RUN npm install

COPY tsconfig.json ./
COPY src/ ./src/

RUN npx tsc

FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/migrations ./src/migrations

RUN mkdir -p /data/images

ENV IMAGE_STORAGE_PATH=/data/images
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/index.js"]
