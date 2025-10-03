# Guia de Testes - MED-1 e MED-2

Guia para testar as implementações de segurança (httpOnly cookies) e qualidade de código (RegistrationResponseSerializer) da Story 2.1.

## 🎯 O que foi implementado

- **MED-1**: Token armazenado em httpOnly cookie (proteção XSS)
- **MED-2**: Serialização type-safe via RegistrationResponseSerializer

---

## ✅ Método 1: Testes Automatizados (Recomendado)

### Backend Tests

```bash
cd apps/api

# 1. Teste específico que valida o cookie httpOnly
poetry run pytest authentication/tests/test_views.py::TestCandidateRegistrationView::test_register_candidate_success -v

# 2. Todos os testes de authentication (18 testes)
poetry run pytest authentication/tests/ -v

# 3. Com cobertura de código
poetry run pytest authentication/tests/ --cov=authentication --cov-report=term-missing

# Resultado esperado:
# ✅ 18 passed, 1 skipped (rate limiting)
# ✅ Cookie 'auth_token' validado no test_register_candidate_success
```

**O que o teste valida:**
- ✅ Cookie `auth_token` está presente no response
- ✅ Atributo `httponly=True`
- ✅ `max-age=604800` (7 dias)
- ✅ `path='/'`
- ✅ Token corresponde ao valor retornado no body

---

## 🔧 Método 2: Teste Manual via cURL

### Passo 1: Subir o ambiente

```bash
# Terminal 1: Backend (API Django)
cd apps/api
poetry shell
python manage.py runserver

# Terminal 2: Frontend (Remix)
cd packages/web
npm run dev

# Terminal 3: MailHog (opcional - para ver emails)
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog
```

### Passo 2: Testar registro via cURL

```bash
# Executar script de teste
bash /tmp/test_registration.sh
```

**Ou manualmente:**

```bash
curl -i -X POST http://localhost:8000/api/v1/auth/register/candidate \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "SecurePass123!",
    "full_name": "Teste User",
    "phone": "11999999999"
  }'
```

**Resultado esperado:**

```http
HTTP/1.1 201 Created
Set-Cookie: auth_token=<token_aqui>; expires=Wed, 10-Oct-2025 15:30:00 GMT; HttpOnly; Max-Age=604800; Path=/; SameSite=Lax
Content-Type: application/json

{
  "user": {
    "id": "uuid-aqui",
    "email": "teste@example.com",
    "role": "candidate"
  },
  "token": "token-aqui"
}
```

**Validações:**
- ✅ Status 201 Created
- ✅ `Set-Cookie` header presente
- ✅ `HttpOnly` flag presente (proteção XSS)
- ✅ `SameSite=Lax` (dev) ou `Strict` (prod)
- ✅ `Max-Age=604800` (7 dias)
- ✅ Response body estruturado corretamente (MED-2)

---

## 🌐 Método 3: Teste via Browser DevTools

### Passo 1: Acessar a página de registro

```
http://localhost:3000/auth/register/candidate
```

### Passo 2: Abrir DevTools

- Chrome/Edge: `F12` ou `Cmd+Option+I` (Mac)
- Firefox: `F12` ou `Cmd+Option+K` (Mac)

### Passo 3: Ir para Network tab

1. Abrir **Network** tab
2. Filtrar por **Fetch/XHR**
3. Limpar console (ícone 🚫)

### Passo 4: Preencher e submeter formulário

```
Nome completo: Teste Browser
Email: teste.browser@example.com
Telefone: 11999999999
Senha: SecurePass123!
Confirmar senha: SecurePass123!
```

Clicar em **"Criar Conta"**

### Passo 5: Verificar Network request

1. Clicar na requisição `register/candidate`
2. Ir para **Headers** tab
3. Rolar até **Response Headers**
4. Procurar `Set-Cookie: auth_token=...`

**✅ Validações:**
- Header `Set-Cookie` deve estar presente
- Cookie deve ter atributos: `HttpOnly`, `Path=/`, `Max-Age=604800`

### Passo 6: Verificar Application/Storage tab

1. Ir para **Application** (Chrome) ou **Storage** (Firefox) tab
2. Expandir **Cookies** no menu lateral
3. Clicar em `http://localhost:8000`

**✅ Validações:**
| Name | Value | HttpOnly | Secure | SameSite | Path | Expires |
|------|-------|----------|--------|----------|------|---------|
| auth_token | (token) | ✅ Yes | ❌ No (dev) | Lax | / | 7 days |

### Passo 7: Tentar acessar cookie via JavaScript

1. Ir para **Console** tab
2. Digitar:

```javascript
document.cookie
```

**✅ Resultado esperado:**
```
""
```

Ou apenas outros cookies (NÃO deve mostrar `auth_token`)

**Por quê?** O cookie `HttpOnly` não pode ser acessado via JavaScript (proteção XSS).

---

## 🔍 Método 4: Teste de Segurança (XSS Protection)

### Validar que JavaScript não acessa o token

```javascript
// No console do browser (DevTools > Console)

// Tentar acessar o token
console.log(document.cookie);
// Resultado esperado: "" ou cookies sem 'auth_token'

// Tentar ler do localStorage (antigo método - DEVE FALHAR)
console.log(localStorage.getItem('auth_token'));
// Resultado esperado: null (token não está mais aqui!)

// User info ainda está no localStorage (não é sensível)
console.log(localStorage.getItem('user'));
// Resultado esperado: {"id":"...","email":"...","role":"candidate"}
```

**✅ Se token não aparecer:** Implementação MED-1 está funcionando corretamente!

---

## 🧪 Método 5: Teste E2E (Playwright)

```bash
cd packages/web

# Rodar teste E2E de registro
BASE_URL=http://localhost:3001 pnpm exec playwright test candidate-registration.spec.ts

# Rodar com UI
BASE_URL=http://localhost:3001 pnpm exec playwright test candidate-registration.spec.ts --ui
```

**Testes que validam MED-1 e MED-2:**
- ✅ `test5`: Full registration flow (valida que cookie é setado automaticamente)
- ✅ `test8`: Duplicate email error (valida serializer response estruturado)

---

## 📊 Checklist de Validação

### ✅ MED-1: httpOnly Cookie

- [ ] Cookie `auth_token` presente no response header `Set-Cookie`
- [ ] Atributo `HttpOnly` presente (proteção XSS)
- [ ] Atributo `Max-Age=604800` (7 dias)
- [ ] Atributo `Path=/`
- [ ] Atributo `SameSite=Lax` (dev) ou `Strict` (prod)
- [ ] Atributo `Secure` ausente em dev, presente em prod
- [ ] Cookie NÃO acessível via `document.cookie`
- [ ] Token NÃO está no localStorage
- [ ] Frontend envia `credentials: 'include'` no fetch

### ✅ MED-2: RegistrationResponseSerializer

- [ ] Response body tem estrutura consistente:
  ```json
  {
    "user": {
      "id": "uuid",
      "email": "string",
      "role": "candidate"
    },
    "token": "string"
  }
  ```
- [ ] Password NÃO aparece no response body
- [ ] Campos sensíveis NÃO vazam no response
- [ ] Status 201 Created em sucesso

---

## 🐛 Troubleshooting

### Problema: Cookie não aparece no browser

**Causa:** CORS não configurado para aceitar credentials.

**Solução:**
```python
# apps/api/talentbase/settings/development.py
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
```

### Problema: Cookie aparece mas `HttpOnly` é False

**Causa:** Bug no código do view.

**Verificar:**
```python
# apps/api/authentication/views.py:116
response.set_cookie(
    key='auth_token',
    value=result['token'],
    httponly=True,  # <-- Deve ser True
    ...
)
```

### Problema: Testes falhando com 429 (Rate Limiting)

**Causa:** Cache de rate limiting entre testes.

**Solução já implementada:**
```python
# apps/api/authentication/tests/test_views.py:36
def setup_method(self):
    ...
    from django.core.cache import cache
    cache.clear()  # <-- Limpa rate limiting
```

### Problema: Frontend não envia cookie em requisições

**Causa:** `credentials: 'include'` ausente.

**Verificar:**
```typescript
// packages/web/app/routes/auth.register.candidate.tsx:108
const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',  // <-- Deve estar presente
    ...
});
```

---

## 📚 Referências

- [OWASP - HttpOnly Cookie](https://owasp.org/www-community/HttpOnly)
- [MDN - Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)
- [Django - set_cookie()](https://docs.djangoproject.com/en/5.0/ref/request-response/#django.http.HttpResponse.set_cookie)
- [Fetch API - credentials](https://developer.mozilla.org/en-US/docs/Web/API/fetch#credentials)

---

## ✅ Conclusão

Se todos os testes passarem, você confirmou que:

1. ✅ **MED-1**: Token está protegido contra XSS via httpOnly cookie
2. ✅ **MED-2**: Response serializado de forma type-safe
3. ✅ **Segurança**: Conformidade com OWASP best practices
4. ✅ **Qualidade**: Código manutenível e testável

**Story 2.1 está pronta para produção! 🎉**
