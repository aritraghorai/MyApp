# Multi-stage Bun Dockerfile for building and previewing a Vite app
# Uses the official Bun image

FROM oven/bun:latest AS builder
WORKDIR /app

# Copy dependency manifests first to leverage layer caching
COPY package.json pnpm-lock.yaml ./

# Copy the rest of the source
COPY . .

# Install dependencies and build the app
RUN bun install
RUN bun run build

FROM oven/bun:latest AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy build output
COPY --from=builder app/.output ./dist

EXPOSE 3000

# Use Vite preview to serve the built app on port 3000, listening on all interfaces
CMD ["bun", "run","dist/server/index.mjs"]
