# Multi-stage Bun Dockerfile for building and previewing a Vite app
# Uses the official Bun image

FROM oven/bun:latest AS builder

# Install build dependencies for native modules
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency manifests first to leverage layer caching
COPY package.json bun.lock ./

# Install dependencies
RUN bun install

# Copy the rest of the source
COPY . .

# Build the app
RUN bun run build

FROM oven/bun:latest AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy build output
COPY --from=builder /app/.output ./dist
# Copy prisma files for migrations
COPY --from=builder /app/prisma ./prisma
# Copy manifests
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Use the built server
CMD ["bun", "run","dist/server/index.mjs"]
