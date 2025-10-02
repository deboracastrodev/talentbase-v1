# Frontend Dockerfile (Remix + Design System)
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm@8.14.0

# Set working directory
WORKDIR /app

# Development stage - não faz build, usa volumes e hot reload
FROM base AS development
EXPOSE 3000
# O pnpm install e build serão feitos via volume mount
CMD ["sh", "-c", "cd /app && pnpm install && cd packages/design-system && pnpm build && cd ../web && pnpm dev"]

# Production build stage
FROM base AS builder

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json ./

# Copy all package.json files
COPY packages/design-system/package.json ./packages/design-system/
COPY packages/web/package.json ./packages/web/

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY packages/design-system ./packages/design-system
COPY packages/web ./packages/web

# Build design system
WORKDIR /app/packages/design-system
RUN pnpm build

# Build Remix app
WORKDIR /app/packages/web
RUN pnpm build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8.14.0

# Copy built artifacts and dependencies
COPY --from=builder /app/packages/web/build ./build
COPY --from=builder /app/packages/web/package.json ./
COPY --from=builder /app/packages/web/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/web/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]
