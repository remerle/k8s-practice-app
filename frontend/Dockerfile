FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY svelte.config.js ./
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY src/ ./src/
COPY static/ ./static/

RUN npm run build

FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/build ./build

ENV PORT=3000

EXPOSE 3000

CMD ["node", "build/index.js"]
