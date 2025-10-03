# Story 1.6: Configure DNS & SSL (Route 53 + ACM)

Status: Approved

## Story

Como um **infrastructure admin**,
Eu quero **o domínio salesdog.click apontando para a aplicação com HTTPS**,
Para que **usuários possam acessar a plataforma de forma segura**.

## Contexto

Esta story configura DNS no Route 53 e certificados SSL via AWS Certificate Manager. Configura subdomínios para dev e produção, enforce HTTPS, e corrige gap identificado no review (redirect do domínio raiz).

## Acceptance Criteria

1. ✅ Hosted zone Route 53 configurada para salesdog.click
2. ✅ Registros A apontam para:
   - `www.salesdog.click` → ALB Production (Frontend)
   - `api.salesdog.click` → ALB Production (Backend)
   - `dev.salesdog.click` → ALB Development (Frontend)
   - `api-dev.salesdog.click` → ALB Development (Backend)
   - `salesdog.click` → Redirect para `www.salesdog.click` (Gap Fix)
3. ✅ Certificados SSL emitidos via AWS ACM
4. ✅ HTTPS enforced (HTTP redirect para HTTPS)
5. ✅ Certificado auto-renewal configurado
6. ✅ DNS propagation confirmada (acessível globalmente)
7. ✅ Django `ALLOWED_HOSTS` e `CORS_ALLOWED_ORIGINS` configurados corretamente
8. ✅ Testes de SSL e conectividade executados com sucesso

## Tasks / Subtasks

### Task 1: Solicitar certificados SSL (AC: 3)
**valide antes se já existe**
- [ ] Solicitar certificado para produção:
  ```bash
  aws acm request-certificate \
    --domain-name salesdog.click \
    --subject-alternative-names www.salesdog.click api.salesdog.click \
    --validation-method DNS \
    --region us-east-1
  ```

- [ ] Solicitar certificado para desenvolvimento:
  ```bash
  aws acm request-certificate \
    --domain-name dev.salesdog.click \
    --subject-alternative-names api-dev.salesdog.click \
    --validation-method DNS \
    --region us-east-1
  ```

- [ ] Anotar ARNs dos certificados emitidos

### Task 2: Validar certificados (AC: 3, 6)
- [ ] AWS fornece CNAME records para validação
- [ ] Adicionar CNAME records ao Route 53:
  ```bash
  aws route53 change-resource-record-sets \
    --hosted-zone-id <ZONE_ID> \
    --change-batch file://cert-validation.json
  ```
- [ ] Aguardar validação (~5-10 minutos)
- [ ] Confirmar status: `aws acm describe-certificate --certificate-arn <ARN>`

### Task 3: Criar registros DNS (AC: 1, 2)
**valide antes se já existe**
- [ ] Criar registro para `www.salesdog.click`:
  ```bash
  aws route53 change-resource-record-sets \
    --hosted-zone-id <ZONE_ID> \
    --change-batch '{
      "Changes": [{
        "Action": "CREATE",
        "ResourceRecordSet": {
          "Name": "www.salesdog.click",
          "Type": "A",
          "AliasTarget": {
            "HostedZoneId": "<ALB_HOSTED_ZONE_ID>",
            "DNSName": "<ALB_PROD_WEB_DNS>",
            "EvaluateTargetHealth": true
          }
        }
      }]
    }'
  ```

- [ ] Criar registros para api.salesdog.click, dev.salesdog.click, api-dev.salesdog.click
- [ ] **[GAP FIX]** Criar registro para domínio raiz (salesdog.click):
  ```bash
  aws route53 change-resource-record-sets \
    --hosted-zone-id <ZONE_ID> \
    --change-batch '{
      "Changes": [{
        "Action": "CREATE",
        "ResourceRecordSet": {
          "Name": "salesdog.click",
          "Type": "A",
          "AliasTarget": {
            "HostedZoneId": "<ALB_HOSTED_ZONE_ID>",
            "DNSName": "<ALB_PROD_WEB_DNS>",
            "EvaluateTargetHealth": true
          }
        }
      }]
    }'
  ```

### Task 4: Configurar ALB HTTPS listeners (AC: 4, 5)
- [ ] Criar HTTPS listener para produção:
  ```bash
  aws elbv2 create-listener \
    --load-balancer-arn <ALB_PROD_ARN> \
    --protocol HTTPS \
    --port 443 \
    --certificates CertificateArn=<ACM_PROD_CERT_ARN> \
    --default-actions Type=forward,TargetGroupArn=<TARGET_GROUP_WEB_ARN>
  ```

- [ ] Criar HTTP → HTTPS redirect:
  ```bash
  aws elbv2 create-listener \
    --load-balancer-arn <ALB_PROD_ARN> \
    --protocol HTTP \
    --port 80 \
    --default-actions Type=redirect,RedirectConfig='{Protocol=HTTPS,Port=443,StatusCode=HTTP_301}'
  ```

- [ ] Configurar listeners para desenvolvimento (mesma estrutura)

### Task 5: Configurar Remix redirect (AC: 2 - Gap Fix)
- [ ] Criar `packages/web/app/routes/$.tsx`:
  ```typescript
  import { redirect } from '@remix-run/node';
  import type { LoaderFunctionArgs } from '@remix-run/node';

  export function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);

    // Redirect apex domain to www
    if (url.hostname === 'salesdog.click') {
      return redirect(`https://www.salesdog.click${url.pathname}`, 301);
    }

    // 404 for other unmatched routes
    throw new Response('Not Found', { status: 404 });
  }
  ```

### Task 6: Atualizar Django settings (AC: 7)
- [ ] Editar `apps/api/talentbase/settings/production.py`:
  ```python
  ALLOWED_HOSTS = [
      'api.salesdog.click',
      'www.salesdog.click',
      'salesdog.click',  # For redirect
  ]

  CORS_ALLOWED_ORIGINS = [
      'https://www.salesdog.click',
      'https://salesdog.click',  # For redirect
  ]

  CSRF_TRUSTED_ORIGINS = [
      'https://www.salesdog.click',
  ]

  # Force HTTPS
  SECURE_SSL_REDIRECT = True
  SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
  SESSION_COOKIE_SECURE = True
  CSRF_COOKIE_SECURE = True
  ```

- [ ] Editar `apps/api/talentbase/settings/development.py`:
  ```python
  ALLOWED_HOSTS = [
      'api-dev.salesdog.click',
      'dev.salesdog.click',
      'localhost',
  ]

  CORS_ALLOWED_ORIGINS = [
      'https://dev.salesdog.click',
      'http://localhost:3000',
  ]

  CSRF_TRUSTED_ORIGINS = [
      'https://dev.salesdog.click',
      'http://localhost:3000',
  ]
  ```

### Task 7: Testes de validação (AC: 6, 8)
- [ ] Teste manual:
  - Acessar https://www.salesdog.click (deve carregar landing page)
  - Acessar https://api.salesdog.click/api/v1/ (deve retornar DRF browsable API)
  - Acessar https://dev.salesdog.click (deve carregar landing page dev)
  - Acessar https://api-dev.salesdog.click/api/v1/ (deve retornar DRF dev)
  - Acessar http://www.salesdog.click (deve redirect para HTTPS)
  - Acessar https://salesdog.click (deve redirect para www.salesdog.click)

- [ ] Teste SSL:
  ```bash
  curl -I https://www.salesdog.click
  curl -I https://api.salesdog.click

  # Verificar redirect
  curl -I http://www.salesdog.click  # Deve retornar 301
  curl -I https://salesdog.click      # Deve retornar 301
  ```

- [ ] Testar SSL Labs: https://www.ssllabs.com/ssltest/
- [ ] Verificar certificado no browser (sem warnings)

## Dev Notes

### Gap Fix from Review

Esta story implementa o **Gap Menor 5** identificado no review:
- Registro DNS para domínio raiz (salesdog.click)
- Redirect 301 para www.salesdog.click
- Catch-all route no Remix para redirect
- Django permite ambos os domínios em ALLOWED_HOSTS

### DNS Configuration

**Route 53 Records:**
```
salesdog.click          A     Alias → ALB Production Web
www.salesdog.click      A     Alias → ALB Production Web
api.salesdog.click      A     Alias → ALB Production API
dev.salesdog.click      A     Alias → ALB Development Web
api-dev.salesdog.click  A     Alias → ALB Development API
```

**SSL Certificates:**
- Production: salesdog.click, *.salesdog.click (wildcard opcional)
- Development: dev.salesdog.click, api-dev.salesdog.click

### Security Headers

Adicionar em Django settings (production):
```python
# apps/api/talentbase/settings/production.py

SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'
```

### MCP Context (Infrastructure)

**Model Context Protocol - Story 1.6**
```xml
<context type="infrastructure-dns-ssl">
  <dns-provider>AWS Route 53</dns-provider>
  <ssl-provider>AWS Certificate Manager (ACM)</ssl-provider>

  <domain-structure>
    <apex-domain>salesdog.click</apex-domain>
    <redirect-target>www.salesdog.click</redirect-target>

    <subdomains>
      <production>
        <subdomain name="www" service="frontend" alb="prod-web"/>
        <subdomain name="api" service="backend" alb="prod-api"/>
      </production>

      <development>
        <subdomain name="dev" service="frontend" alb="dev-web"/>
        <subdomain name="api-dev" service="backend" alb="dev-api"/>
      </development>
    </subdomains>
  </domain-structure>

  <ssl-certificates>
    <certificate environment="production">
      <primary-domain>salesdog.click</primary-domain>
      <sans>
        <san>www.salesdog.click</san>
        <san>api.salesdog.click</san>
      </sans>
      <validation-method>DNS</validation-method>
      <auto-renewal enabled="true"/>
    </certificate>

    <certificate environment="development">
      <primary-domain>dev.salesdog.click</primary-domain>
      <sans>
        <san>api-dev.salesdog.click</san>
      </sans>
      <validation-method>DNS</validation-method>
      <auto-renewal enabled="true"/>
    </certificate>
  </ssl-certificates>

  <https-enforcement>
    <approach>ALB-level redirect</approach>
    <http-listener port="80" action="redirect-to-https"/>
    <https-listener port="443" action="forward-to-target-group"/>
    <status-code>301</status-code>
  </https-enforcement>

  <apex-domain-redirect>
    <source>salesdog.click</source>
    <destination>www.salesdog.click</destination>
    <implementation>Remix catch-all route</implementation>
    <status-code>301</status-code>
  </apex-domain-redirect>

  <django-configuration>
    <allowed-hosts>
      <production>
        <host>api.salesdog.click</host>
        <host>www.salesdog.click</host>
        <host>salesdog.click</host>
      </production>
      <development>
        <host>api-dev.salesdog.click</host>
        <host>dev.salesdog.click</host>
        <host>localhost</host>
      </development>
    </allowed-hosts>

    <cors-origins>
      <production>
        <origin>https://www.salesdog.click</origin>
        <origin>https://salesdog.click</origin>
      </production>
      <development>
        <origin>https://dev.salesdog.click</origin>
        <origin>http://localhost:3000</origin>
      </development>
    </cors-origins>

    <security-headers>
      <hsts enabled="true" max-age="31536000" include-subdomains="true"/>
      <ssl-redirect enabled="true"/>
      <secure-cookies enabled="true"/>
    </security-headers>
  </django-configuration>
</context>
```

### Testing Strategy

**Manual Validation:**
- [ ] https://www.salesdog.click carrega landing page
- [ ] https://api.salesdog.click/api/v1/ retorna DRF browsable API
- [ ] https://dev.salesdog.click carrega landing page (dev)
- [ ] https://api-dev.salesdog.click/api/v1/ retorna DRF dev
- [ ] HTTP URLs redirectam para HTTPS
- [ ] salesdog.click redirecta para www.salesdog.click
- [ ] Certificado SSL válido (sem browser warnings)

**SSL Test:**
```bash
# Check SSL certificate
curl -I https://www.salesdog.click
curl -I https://api.salesdog.click

# Check redirects
curl -I http://www.salesdog.click   # 301 → https://www.salesdog.click
curl -I https://salesdog.click      # 301 → https://www.salesdog.click

# SSL Labs test
# Visit: https://www.ssllabs.com/ssltest/analyze.html?d=www.salesdog.click
```

### Troubleshooting

**Problema: Certificado SSL não valida**
```bash
# Verificar registros CNAME no Route 53
aws route53 list-resource-record-sets --hosted-zone-id <ZONE_ID>

# Verificar status do certificado
aws acm describe-certificate --certificate-arn <ARN>
```

**Problema: DNS não resolve**
```bash
# Testar resolução DNS
nslookup www.salesdog.click
dig www.salesdog.click

# Verificar propagação global
# https://dnschecker.org/#A/www.salesdog.click
```

**Problema: CORS errors**
```bash
# Verificar CORS_ALLOWED_ORIGINS em Django
# Garantir que frontend URL está na lista
# Verificar que CORS_ALLOW_CREDENTIALS = True se usando cookies
```

### References

- [Source: docs/epics/tech-spec-epic-1.md#Story-1.6]
- [Source: docs/epics/tech-spec-epic-1-review.md#Gap-Menor-5]
- [Source: docs/epics/solution-architecture.md#Deployment-Architecture]

## Change Log

| Date       | Version | Description | Author |
| ---------- | ------- | ----------- | ------ |
| 2025-10-02 | 0.1     | Initial draft - DNS & SSL with apex domain redirect | Debora |

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Completion Notes

- Tempo estimado: 2-3 horas
- Inclui correção do Gap Menor 5 (apex domain redirect)
- Inclui MCP context (infrastructure story)
- Última story do Epic 1

### Dependencies

**Depends On:**
- Story 1.5: ECS services and ALBs must be deployed
- Story 1.0: Route 53 hosted zone verified

**Blocks:**
- None (final story of Epic 1)
- Epic completion: All Epic 1 success criteria met

### File List

**To be created:**
- `packages/web/app/routes/$.tsx` - Catch-all for apex domain redirect

**To be modified:**
- `apps/api/talentbase/settings/production.py` - ALLOWED_HOSTS, CORS, SSL settings
- `apps/api/talentbase/settings/development.py` - ALLOWED_HOSTS, CORS settings

**AWS Resources (created via CLI/Console):**
- ACM certificates (production and development)
- Route 53 A records (www, api, dev, api-dev, apex)
- ALB HTTPS listeners
- ALB HTTP→HTTPS redirect listeners
