#!/bin/bash
# Validate GitHub Actions workflows

set -e

echo "🔍 Validating GitHub Actions workflows..."

# Check YAML syntax
echo "Checking YAML syntax..."
for workflow in .github/workflows/*.yml; do
  if ruby -ryaml -e "YAML.load_file('$workflow')" 2>/dev/null; then
    echo "  ✅ $workflow syntax valid"
  else
    echo "  ❌ $workflow syntax invalid"
    exit 1
  fi
done

# Check required secrets are documented
echo ""
echo "Checking secrets documentation..."
if grep -q "AWS_ACCESS_KEY_ID" .github/workflows/README-SECRETS.md && \
   grep -q "AWS_SECRET_ACCESS_KEY" .github/workflows/README-SECRETS.md && \
   grep -q "AWS_ACCOUNT_ID" .github/workflows/README-SECRETS.md; then
  echo "  ✅ All required secrets documented"
else
  echo "  ❌ Missing secrets documentation"
  exit 1
fi

# Check workflow triggers
echo ""
echo "Checking workflow triggers..."
if grep -q "branches:" .github/workflows/deploy.yml && \
   grep -q "master" .github/workflows/deploy.yml && \
   grep -q "develop" .github/workflows/deploy.yml; then
  echo "  ✅ Deploy workflow has correct triggers"
else
  echo "  ❌ Deploy workflow missing triggers"
  exit 1
fi

if grep -q "workflow_dispatch:" .github/workflows/rollback.yml; then
  echo "  ✅ Rollback workflow has manual trigger"
else
  echo "  ❌ Rollback workflow missing manual trigger"
  exit 1
fi

# Check Docker configurations
echo ""
echo "Checking Docker configurations..."
if grep -q "AS production" apps/api/Dockerfile && \
   grep -q "AS production" packages/web/Dockerfile; then
  echo "  ✅ Production stages exist in Dockerfiles"
else
  echo "  ❌ Production stages missing"
  exit 1
fi

# Check health check endpoints
echo ""
echo "Checking health check configuration..."
if grep -q "salesdog.click/health/" .github/workflows/deploy.yml; then
  echo "  ✅ Health check endpoints configured"
else
  echo "  ❌ Health check endpoints missing"
  exit 1
fi

echo ""
echo "✅ All validations passed!"
