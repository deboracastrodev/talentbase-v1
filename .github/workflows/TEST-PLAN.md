# CI/CD Pipeline Test Plan

## Automated Tests

### 1. GitHub Actions Syntax Validation

```bash
# Install actionlint (GitHub Actions linter)
brew install actionlint

# Validate workflow files
actionlint .github/workflows/deploy.yml
actionlint .github/workflows/rollback.yml
```

### 2. Docker Build Tests

#### Test API Production Build
```bash
cd apps/api
docker build --target production -t talentbase-api:test .
docker run --rm -p 8000:8000 talentbase-api:test
# Verify Gunicorn starts successfully
```

#### Test Web Production Build
```bash
docker build -f packages/web/Dockerfile --target production -t talentbase-web:test .
docker run --rm -p 3000:3000 talentbase-web:test
# Verify Remix serves successfully
```

### 3. Multi-stage Build Optimization Test
```bash
# Check image sizes
docker images | grep talentbase

# Verify production images are smaller than dev
docker build --target development -t talentbase-api:dev apps/api
docker build --target production -t talentbase-api:prod apps/api
docker images | grep talentbase-api
```

## Manual Tests (Post-Deployment)

### AC-1: GitHub Actions Workflow Created ✅
- [ ] File exists: `.github/workflows/deploy.yml`
- [ ] Workflow appears in GitHub Actions tab

### AC-2: Workflow Executes on Push ✅
- [ ] Push to `develop` → Workflow triggers
- [ ] Push to `master` → Workflow triggers
- [ ] Other branches → No trigger

### AC-3: Backend Tests Execute ✅
- [ ] Django pytest runs in CI
- [ ] Coverage report generated
- [ ] Test failures block deployment

### AC-4: Frontend Tests Execute ✅
- [ ] Vitest runs in CI
- [ ] Test results displayed
- [ ] Test failures block deployment

### AC-5: Remix Production Build Works ✅
- [ ] Build completes without errors
- [ ] Static assets generated
- [ ] Bundle size acceptable

### AC-6: Docker Images Built ✅
- [ ] API image builds successfully
- [ ] Web image builds successfully
- [ ] Multi-stage optimization applied

### AC-7: Images Sent to ECR ✅
- [ ] API image pushed to ECR
- [ ] Web image pushed to ECR
- [ ] Images tagged with git SHA
- [ ] `:latest` tag updated

### AC-8: ECS Services Updated ✅
- [ ] API service updated
- [ ] Web service updated
- [ ] No downtime during deployment

### AC-9: Deployment < 15 Minutes ⏱️
- [ ] Total pipeline time measured
- [ ] Test stage: ~5-7 minutes
- [ ] Build & deploy: ~6-8 minutes
- [ ] Total: <15 minutes target

### AC-10: Health Checks Validate Deployment ✅
- [ ] API health endpoint responds (5 retries)
- [ ] Web health endpoint responds (5 retries)
- [ ] Deployment fails if health checks fail

### AC-11: Rollback Workflow Available ✅
- [ ] File exists: `.github/workflows/rollback.yml`
- [ ] Workflow dispatch available in UI
- [ ] Can select dev/prod environment
- [ ] Rollback triggers force deployment

### AC-12: Deployment Notifications ✅
- [ ] Success notification on completion
- [ ] Failure notification on error
- [ ] Contains commit SHA, branch, author
- [ ] Links to workflow run

## Environment-Specific Tests

### Development (develop branch → dev environment)
- [ ] `DJANGO_SETTINGS_MODULE=talentbase.settings.development`
- [ ] Deploys to `talentbase-dev` cluster
- [ ] Uses `talentbase-api-dev` service
- [ ] Uses `talentbase-web-dev` service
- [ ] URLs: dev.salesdog.click, api-dev.salesdog.click

### Production (master branch → prod environment)
- [ ] `DJANGO_SETTINGS_MODULE=talentbase.settings.production`
- [ ] Deploys to `talentbase-prod` cluster
- [ ] Uses `talentbase-api-prod` service
- [ ] Uses `talentbase-web-prod` service
- [ ] URLs: www.salesdog.click, api.salesdog.click

## Security & Best Practices Tests

### Secrets Management
- [ ] AWS credentials stored in GitHub Secrets
- [ ] No credentials in code or logs
- [ ] IAM permissions follow least privilege

### Docker Security
- [ ] Production images have no dev dependencies
- [ ] Images run as non-root user (if configured)
- [ ] No sensitive data in image layers

### Workflow Best Practices
- [ ] Dependencies cached (Docker layer caching)
- [ ] Parallel job execution where possible
- [ ] Proper error handling and notifications
- [ ] Timeout configured (15min max)

## Performance Benchmarks

### First Run (No Cache)
- Install backend deps: ~2-3 min
- Install frontend deps: ~1-2 min
- Run backend tests: ~1 min
- Run frontend tests: ~30s
- Run E2E tests: ~1-2 min
- Build API Docker: ~2-3 min
- Build Web Docker: ~3-4 min
- Push to ECR: ~1-2 min
- ECS deployment: ~2-3 min
- **Total: ~12-15 min** ✅

### Subsequent Runs (With Cache)
- Cached dependencies: ~30s
- Cached Docker layers: ~1-2 min
- **Total: ~8-10 min** ✅

## Failure Scenarios

### Test Failures
- [ ] Backend test fails → Pipeline stops, no deployment
- [ ] Frontend test fails → Pipeline stops, no deployment
- [ ] E2E test fails → Pipeline stops, no deployment

### Build Failures
- [ ] Docker build fails → Pipeline stops, notification sent
- [ ] ECR push fails → Pipeline stops, notification sent

### Deployment Failures
- [ ] ECS update fails → Rollback triggered automatically
- [ ] Health check fails → Deployment marked as failed
- [ ] Timeout reached → Deployment aborted

## Testing Checklist Summary

**Pre-deployment (Local):**
- [x] Workflow syntax validated (actionlint)
- [x] Docker builds tested locally
- [x] Multi-stage optimization verified

**Post-deployment (CI/CD):**
- [ ] All 12 ACs validated in live environment
- [ ] Both dev and prod environments tested
- [ ] Rollback workflow tested
- [ ] Performance benchmarks met

**Documentation:**
- [x] Secrets configuration guide created
- [x] Test plan documented
- [x] Health check endpoints specified
