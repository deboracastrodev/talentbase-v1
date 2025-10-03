# Environment Configuration Guide

## Overview

TalentBase uses environment-specific configuration for different deployment stages. This guide explains how to configure the application for development, staging, and production.

## Frontend (Remix/Vite)

### Environment Variables

Vite requires environment variables to be prefixed with `VITE_` to be exposed to the browser.

#### Available Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_URL` | Yes | Backend API base URL | `http://localhost:8000` |
| `SESSION_SECRET` | Yes | Session encryption key | Generate with `openssl rand -base64 32` |
| `NODE_ENV` | No | Node environment | `development`, `staging`, `production` |

### Setup Instructions

#### 1. Development

```bash
cd packages/web

# Copy example file
cp .env.example .env

# Edit .env
# VITE_API_URL=http://localhost:8000
# SESSION_SECRET=your-secret-here
```

#### 2. Staging

```bash
cd packages/web

# Copy staging example
cp .env.staging.example .env.staging

# Edit .env.staging with actual staging values
# VITE_API_URL=https://api-staging.salesdog.click
# SESSION_SECRET=<generate-new-secret>

# Build for staging
npm run build -- --mode staging

# Or set env vars directly (Docker/CI)
VITE_API_URL=https://api-staging.salesdog.click npm run build
```

#### 3. Production

```bash
cd packages/web

# Copy production example
cp .env.production.example .env.production

# Edit .env.production with actual production values
# VITE_API_URL=https://api.salesdog.click
# SESSION_SECRET=<generate-new-secret>

# Build for production
npm run build -- --mode production

# Or set env vars directly (Docker/CI)
VITE_API_URL=https://api.salesdog.click npm run build
```

### Docker Deployment

#### Dockerfile with build args

```dockerfile
# Build stage
FROM node:20-alpine AS builder

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
CMD ["npm", "run", "start"]
```

#### Docker Compose

```yaml
services:
  web:
    build:
      context: ./packages/web
      args:
        VITE_API_URL: ${VITE_API_URL:-http://localhost:8000}
    environment:
      - SESSION_SECRET=${SESSION_SECRET}
      - NODE_ENV=${NODE_ENV:-production}
    ports:
      - "3000:3000"
```

### GitHub Actions / CI

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main, develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Build (Staging)
        if: github.ref == 'refs/heads/develop'
        env:
          VITE_API_URL: ${{ secrets.STAGING_API_URL }}
        run: |
          cd packages/web
          npm ci
          npm run build

      - name: Build (Production)
        if: github.ref == 'refs/heads/main'
        env:
          VITE_API_URL: ${{ secrets.PRODUCTION_API_URL }}
        run: |
          cd packages/web
          npm ci
          npm run build -- --mode production
```

## Backend (Django)

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `ALLOWED_HOSTS` | Yes | Comma-separated allowed hosts | `localhost,api.talentbase.com` |
| `CORS_ALLOWED_ORIGINS` | Yes | Comma-separated CORS origins | `https://app.talentbase.com` |
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/dbname` |
| `SECRET_KEY` | Yes | Django secret key | Generate with `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` |
| `DEBUG` | No | Enable debug mode | `False` in production |

See `apps/api/.env.example` for complete list.

## How API Configuration Works

### Priority Order

The frontend resolves the API URL in this order:

1. **`window.ENV.API_URL`** - Set by root.tsx loader (runtime)
2. **`import.meta.env.VITE_API_URL`** - Vite build-time variable
3. **Fallback to `localhost:8000`** - Development only
4. **Throws error** - If none set in production

### Code Implementation

```typescript
// packages/web/app/config/api.ts
export function getApiBaseUrl(): string {
  // 1. Runtime env (from server)
  if (typeof window !== 'undefined' && window.ENV?.API_URL) {
    return window.ENV.API_URL;
  }

  // 2. Build-time env (from Vite)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // 3. Development fallback
  if (import.meta.env.DEV) {
    return 'http://localhost:8000';
  }

  // 4. Fail fast in production
  throw new Error('API_URL not configured!');
}
```

### Usage in Components

```typescript
import { buildApiUrl, API_ENDPOINTS } from '~/config/api';

// Automatically uses correct URL for environment
const response = await fetch(buildApiUrl(API_ENDPOINTS.auth.registerCandidate), {
  method: 'POST',
  // ...
});
```

## Validation

### Check Current Configuration

```bash
# Development
cd packages/web
npm run dev
# Open browser console and check: window.ENV or import.meta.env.VITE_API_URL

# Production build
npm run build
npm run start
```

### Test API Connection

```bash
# Development
curl http://localhost:8000/api/v1/auth/register/candidate -X OPTIONS

# Staging
curl https://api-staging.salesdog.click/api/v1/auth/register/candidate -X OPTIONS

# Production
curl https://api.salesdog.click/api/v1/auth/register/candidate -X OPTIONS
```

## Troubleshooting

### Error: "API_URL not configured!"

**Cause:** `VITE_API_URL` not set during build.

**Solution:**
```bash
# Set the variable before building
export VITE_API_URL=https://api.yoursite.com
npm run build
```

### Error: "CORS policy" in browser

**Cause:** Backend CORS not configured for frontend origin.

**Solution:** Update `CORS_ALLOWED_ORIGINS` in backend settings:
```python
# apps/api/talentbase/settings/production.py
CORS_ALLOWED_ORIGINS = [
    "https://app.talentbase.com",
]
```

### API calls going to wrong URL

**Cause:** Old build cached with wrong `VITE_API_URL`.

**Solution:**
```bash
# Clear build and rebuild
rm -rf packages/web/build
npm run build
```

## Security Best Practices

1. **Never commit `.env` files** - Only commit `.env.example`
2. **Use different secrets per environment** - Don't reuse staging secrets in production
3. **Rotate secrets regularly** - Especially `SESSION_SECRET` and `SECRET_KEY`
4. **Use HTTPS in production** - Always use `https://` URLs for production API
5. **Store secrets in secret managers** - Use GitHub Secrets, AWS Secrets Manager, or similar

## References

- [Vite Env Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Remix Environment Variables](https://remix.run/docs/en/main/guides/envvars)
- [Django Settings Best Practices](https://docs.djangoproject.com/en/5.0/topics/settings/)
