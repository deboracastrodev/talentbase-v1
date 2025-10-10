# Frontend Dockerfile (Remix + Design System)
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm@10.17.1

# Set working directory
WORKDIR /app

# Development stage - não faz build, usa volumes e hot reload
FROM base AS development
EXPOSE 3000
# O pnpm install e build serão feitos via volume mount
CMD ["sh", "-c", "cd /app && pnpm install && cd packages/design-system && pnpm build && cd ../web && pnpm dev"]

# Production build stage
FROM base AS builder

# Build arguments for environment variables
ARG VITE_API_URL=http://localhost:8000
ARG NODE_ENV=production

# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV NODE_ENV=$NODE_ENV

# Copy workspace configuration
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Copy all package.json files
COPY packages/design-system/package.json ./packages/design-system/
COPY packages/web/package.json ./packages/web/

# Install dependencies
RUN pnpm install --frozen-lockfile

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

# Copy the ENTIRE node_modules including .pnpm directory (needed for symlinks)
COPY --from=builder /app/node_modules ./node_modules

# Create packages/web structure
RUN mkdir -p /app/packages/web

# Copy built artifacts to the correct location
COPY --from=builder /app/packages/web/build ./packages/web/build
COPY --from=builder /app/packages/web/public ./packages/web/public
COPY --from=builder /app/packages/web/package.json ./packages/web/package.json
COPY --from=builder /app/packages/web/node_modules ./packages/web/node_modules

WORKDIR /app/packages/web

EXPOSE 3000
# Use node directly with the correct path
CMD ["node", "../../node_modules/.pnpm/@remix-run+serve@2.17.1_typescript@5.9.3/node_modules/@remix-run/serve/dist/cli.js", "build/server/index.js"]
