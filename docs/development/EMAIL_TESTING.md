# Email Testing com MailHog

## 🎯 Objetivo

MailHog captura **todos os emails** enviados em ambiente de desenvolvimento **sem enviar emails reais**. Permite visualizar e testar emails em interface web.

---

## 🚀 Como Usar

### 1. Subir o ambiente com Docker Compose

```bash
docker-compose up -d
```

Isso vai subir:
- ✅ PostgreSQL (porta 5432)
- ✅ Redis (porta 6379)
- ✅ **MailHog** (portas 1025 SMTP + 8025 Web UI)
- ✅ Django API (porta 8000)
- ✅ Remix Web (porta 3000)

### 2. Acessar MailHog Web UI

Abra no navegador:
```
http://localhost:8025
```

**Todos os emails** enviados pela aplicação aparecerão aqui em tempo real!

---

## 📧 Como Funciona

### Fluxo de Email em DEV:

```
Django App → send_mail()
    ↓
SMTP localhost:1025 (MailHog)
    ↓
MailHog captura email
    ↓
Visualiza em http://localhost:8025
    ↓
❌ Email NÃO é enviado de verdade
```

### Configuração Automática:

O Django está configurado para usar MailHog automaticamente em **development**:

```python
# apps/api/talentbase/settings/development.py
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "mailhog"  # Nome do service no docker-compose
EMAIL_PORT = 1025       # SMTP port
EMAIL_USE_TLS = False
```

---

## 📋 Casos de Uso

### ✅ Emails Capturados em DEV:

1. **Story 2.1** - Candidato se registra
   - ✉️ Email de boas-vindas → MailHog

2. **Story 2.2** - Empresa se registra
   - ✉️ Email para empresa (confirmação) → MailHog
   - ✉️ Email para admin (notificação) → MailHog

3. **Story 2.5** - Admin aprova/rejeita empresa
   - ✉️ Email de aprovação → MailHog
   - ✉️ Email de rejeição → MailHog

**NENHUM email é enviado de verdade!**

---

## 🔧 Troubleshooting

### MailHog não está rodando?

```bash
# Verificar status
docker ps | grep mailhog

# Ver logs
docker logs talentbase_mailhog

# Reiniciar
docker-compose restart mailhog
```

### Emails não aparecem no MailHog?

1. Verificar que o Django está conectado:
```bash
# No container Django
docker exec -it talentbase_api python manage.py shell

>>> from django.core.mail import send_mail
>>> send_mail('Test', 'Test message', 'test@test.com', ['recipient@test.com'])
```

2. Verificar logs do Django:
```bash
docker logs talentbase_api
```

### Rodar fora do Docker?

Se rodar Django localmente (sem Docker), altere o `.env`:

```bash
# .env
EMAIL_HOST=localhost  # Não "mailhog"
EMAIL_PORT=1025
```

E rode MailHog standalone:
```bash
# macOS
brew install mailhog
mailhog

# Linux/Windows
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog
```

---

## ⚠️ IMPORTANTE

### ❌ Produção usa SendGrid/AWS SES

```python
# apps/api/talentbase/settings/production.py
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.sendgrid.net"  # Envia emails REAIS
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = "apikey"
EMAIL_HOST_PASSWORD = os.environ["SENDGRID_API_KEY"]
```

**Produção envia emails reais!** Teste bem em DEV com MailHog antes de fazer deploy.

---

## 📚 Recursos

- [MailHog GitHub](https://github.com/mailhog/MailHog)
- [Django Email Docs](https://docs.djangoproject.com/en/5.0/topics/email/)
- [Celery + Email Tasks](https://docs.celeryproject.org/en/stable/userguide/tasks.html)
