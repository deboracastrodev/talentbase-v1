# Story 2.7: Email Notification System (Basic)

Status: Completed

**⚠️ IMPORTANTE: Antes de iniciar esta story, leia:**
- [Code Quality Standards](../bestpraticies/CODE_QUALITY.md)
- [Backend Best Practices](../bestpraticies/BACKEND_BEST_PRACTICES.md)
- [Pre-Implementation Checklist](../bestpraticies/PRE_IMPLEMENTATION_CHECKLIST.md)
- [Frontend Best Practices](../bestpraticies/FRONTEND_BEST_PRACTICES.md)

## Story

Como um **usuário**,
Eu quero **receber notificações por email para eventos importantes**,
Para que **eu fique informado sobre minha conta e atividade**.

## Acceptance Criteria

1. Serviço de email configurado com templates com marca TalentBase
2. Emails enviados para:
   - Confirmação de registro de candidato
   - Registro de empresa enviado
   - Aprovação de empresa concedida
   - Registro de empresa rejeitado
3. Todos os emails incluem:
   - Logo TalentBase
   - Linha de assunto clara
   - Saudação personalizada (nome do usuário)
   - Link de ação (ex: "Faça login no seu dashboard")
   - Rodapé com informações de contato
4. Emails enviados de forma assíncrona (Celery + Redis queue)
5. Falhas no envio de email logadas para revisão do admin
6. Link de unsubscribe (placeholder para futuro)

## Tasks / Subtasks

- [x] Task 1: Configurar serviço de email (AC: 1)
  - [x] Configurar SendGrid ou AWS SES
  - [x] Configurar credenciais e settings Django
  - [x] Testar envio básico de email
- [x] Task 2: Criar templates de email (AC: 2, 3)
  - [x] Template confirmação candidato (HTML + texto)
  - [x] Template registro empresa enviado
  - [x] Template empresa aprovada
  - [x] Template empresa rejeitada
- [x] Task 3: Configurar Celery para envio assíncrono (AC: 4)
  - [x] Configurar Celery com Redis (já existia)
  - [x] Criar task send_email_task (enhanced)
  - [x] Integrar com views de registro/aprovação
- [x] Task 4: Implementar logging e monitoramento (AC: 5)
  - [x] Configurar logging para falhas de email
  - [x] Criar EmailLog model para logs de email
  - [x] Implementar retry logic para falhas
- [x] Task 5: Criar sistema de templates personalizáveis (AC: 3)
  - [x] Criar base template com branding
  - [x] Implementar variáveis dinâmicas
  - [x] Templates responsivos e acessíveis

## Dev Notes

### Email Service Configuration

**Django Email Settings:**
```python
# settings/base.py
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = config('EMAIL_HOST', default='smtp.sendgrid.net')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = True
EMAIL_HOST_USER = config('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = 'noreply@salesdog.click'
```

**Environment Variables:**
```
# Production
EMAIL_HOST=smtp.sendgrid.net
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=SG.xxx

# Development (MailTrap)
EMAIL_HOST=smtp.mailtrap.io
EMAIL_HOST_USER=xxx
EMAIL_HOST_PASSWORD=xxx
```

### Celery Task Implementation

**Email Sending Task:**
```python
# core/tasks.py
from celery import shared_task
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

@shared_task(bind=True, max_retries=3)
def send_email_task(self, template_name, context, recipient_email, subject):
    try:
        # Render HTML and text versions
        html_content = render_to_string(f'emails/{template_name}.html', context)
        text_content = render_to_string(f'emails/{template_name}.txt', context)

        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email='noreply@salesdog.click',
            to=[recipient_email]
        )
        email.attach_alternative(html_content, "text/html")
        email.send()

        # Log success
        logger.info(f"Email sent to {recipient_email}: {subject}")
        return f"Email sent successfully to {recipient_email}"

    except Exception as e:
        logger.error(f"Email send failed: {e}")
        # Retry with exponential backoff
        raise self.retry(countdown=60 * (2 ** self.request.retries))
```

### Email Templates Structure

**Base Template (`emails/base.html`):**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ subject }}</title>
    <style>
        /* TalentBase email styles */
        .email-container { max-width: 600px; margin: 0 auto; }
        .header { background: #1a365d; color: white; padding: 20px; }
        .content { padding: 20px; }
        .footer { background: #f7fafc; padding: 15px; }
        .btn { background: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="https://www.salesdog.click/logo.png" alt="TalentBase" height="40">
            <h1>TalentBase</h1>
        </div>
        <div class="content">
            {% block content %}{% endblock %}
        </div>
        <div class="footer">
            <p>Atenciosamente,<br>Equipe TalentBase</p>
            <p><a href="mailto:contato@salesdog.click">contato@salesdog.click</a></p>
            <p><small><a href="{{ unsubscribe_url }}">Cancelar inscrição</a></small></p>
        </div>
    </div>
</body>
</html>
```

### Email Templates (Portuguese)

**Candidate Registration Confirmation:**
```html
<!-- emails/candidate_registration.html -->
{% extends 'emails/base.html' %}
{% block content %}
<h2>Bem-vindo ao TalentBase!</h2>
<p>Olá {{ candidate_name }},</p>
<p>Sua conta foi criada com sucesso no TalentBase!</p>
<p><strong>Próximos passos:</strong></p>
<ul>
    <li>Complete seu perfil profissional</li>
    <li>Adicione suas experiências e habilidades</li>
    <li>Comece a buscar oportunidades</li>
</ul>
<p><a href="{{ dashboard_url }}" class="btn">Acessar Minha Conta</a></p>
{% endblock %}
```

**Company Registration Submitted:**
```html
<!-- emails/company_registration_submitted.html -->
{% extends 'emails/base.html' %}
{% block content %}
<h2>Cadastro Recebido</h2>
<p>Olá {{ contact_name }},</p>
<p>Seu cadastro da empresa <strong>{{ company_name }}</strong> foi recebido com sucesso e está aguardando aprovação do nosso time.</p>
<p>Você receberá um email de confirmação em até 24 horas.</p>
<p>Enquanto isso, você pode conhecer mais sobre o TalentBase:</p>
<p><a href="https://www.salesdog.click" class="btn">Visitar Site</a></p>
{% endblock %}
```

### Celery Configuration

**Celery Settings:**
```python
# settings/base.py
CELERY_BROKER_URL = config('REDIS_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND = CELERY_BROKER_URL
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'America/Sao_Paulo'

# Email task routing
CELERY_TASK_ROUTES = {
    'core.tasks.send_email_task': {'queue': 'emails'},
}
```

### Usage in Views

**Integration Example:**
```python
# authentication/views.py
from core.tasks import send_email_task

class CandidateRegistrationView(APIView):
    def post(self, request):
        # ... registration logic ...

        # Send welcome email asynchronously
        send_email_task.delay(
            template_name='candidate_registration',
            context={
                'candidate_name': user.candidateprofile.full_name,
                'dashboard_url': 'https://www.salesdog.click/candidate'
            },
            recipient_email=user.email,
            subject='Bem-vindo ao TalentBase!'
        )

        return Response({'message': 'Registration successful'})
```

### Email Monitoring

**Email Log Model:**
```python
# core/models.py
class EmailLog(BaseModel):
    recipient = models.EmailField()
    subject = models.CharField(max_length=200)
    template_name = models.CharField(max_length=100)
    status = models.CharField(max_length=20)  # sent, failed, pending
    error_message = models.TextField(blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    task_id = models.CharField(max_length=100, blank=True)
```

### Security Requirements

- SPF/DKIM configuration for domain authentication
- Rate limiting on email sending (prevent spam)
- Input validation for email addresses
- Secure storage of email service credentials
- Email content sanitization (prevent XSS)
- Attachment scanning (future enhancement)

### Project Structure Notes

- Templates: `apps/api/templates/emails/`
- Tasks: `apps/api/core/tasks.py`
- Configuration: `apps/api/talentbase/settings/`
- Monitoring: `apps/api/core/models.py` (EmailLog)

### Testing Strategy

**Unit Tests:**
- Email template rendering with context
- Celery task execution
- Email sending success/failure scenarios
- Template variable substitution

**Integration Tests:**
- End-to-end email flow from registration
- Email queue processing
- Error handling and retries

### References

- [Source: docs/epics/epics.md#Story-2.7]
- [Source: docs/epics/tech-spec-epic-2.md#Story-2.7]
- [Source: docs/epics/tech-spec-epic-2.md#Email-Templates]

## Change Log

| Date     | Version | Description   | Author        |
| -------- | ------- | ------------- | ------------- |
| 2025-10-02 | 0.1     | Initial draft | Debora |
| 2025-10-09 | 1.0     | **Completed** | Amelia (Dev Agent) |

## Dev Agent Record

### Context Reference

- [Story Context XML](../stories-context/story-context-2.7.xml) - Generated 2025-10-09

### Agent Model Used

Claude Sonnet 4 (claude-sonnet-4-20250514)

### Debug Log References

### Completion Notes

**Completion Date:** 2025-10-09

**Summary:**
Story 2.7 (Email Notification System) implementada com sucesso. Sistema completo de emails HTML com branding TalentBase, envio assíncrono via Celery, retry logic e monitoramento através do EmailLog model.

**Implementation Highlights:**

✅ **9 Email Templates Created:**
1. `templates/emails/base.html` - Base template com branding TalentBase
   - Responsive design (mobile-friendly)
   - Gradient header (#1a365d → #2d3748)
   - Styled buttons (#3182ce)
   - Info/warning/success boxes
   - Footer com contato e unsubscribe
2. `candidate_registration.html` + `.txt` - Confirmação de registro candidato
3. `company_registration_submitted.html` + `.txt` - Registro empresa recebido
4. `company_approved.html` + `.txt` - Empresa aprovada
5. `company_rejected.html` + `.txt` - Empresa rejeitada com motivo

✅ **Enhanced Email Infrastructure:**
- `core/tasks.py`: Refatorado send_email_task
  - Nova assinatura: `template_name, context, recipient_email, subject`
  - HTML + plain text multipart (EmailMultiAlternatives)
  - Retry logic com exponential backoff (60s, 120s, 240s)
  - EmailLog integration para auditoria
  - Dev mode graceful failure (skips se MailHog unavailable)
- `core/models.py`: EmailLog model
  - Campos: recipient, subject, template_name, status, error_message, sent_at, task_id
  - Status: pending, sent, failed, skipped
  - Indexes otimizados para queries
- `core/migrations/0001_add_email_log_model.py`: Migration aplicada

✅ **Services Updated:**
- `authentication/services/registration.py`:
  - CandidateRegistrationService: candidate_registration template
  - CompanyRegistrationService: company_registration_submitted template
- `user_management/services/user_management.py`:
  - Company approval: company_approved template
  - Company rejection: company_rejected template (com reason)

✅ **Production Configuration:**
- `talentbase/settings/production.py`: Dual provider support
  - SendGrid: EMAIL_PROVIDER=sendgrid + SENDGRID_API_KEY
  - AWS SES: EMAIL_PROVIDER=ses + AWS_SES_* credentials
  - Celery: TASK_ALWAYS_EAGER=False (truly async)
- `talentbase/settings/base.py`: TEMPLATES DIRS includes templates/
- `.env.example`: Documentação completa das variáveis

✅ **Comprehensive Testing:**
- `core/tests/test_tasks.py`: 8 novos testes
  - Email sending success (HTML + text)
  - All 4 template types
  - EmailLog tracking
  - Retry logic
  - Template elements validation
  - Development mode fallback
- Updated 3 existing tests para nova assinatura
- **Total: 113 passed, 2 skipped, 0 failed**

✅ **Code Quality:**
- Black: 30 files reformatted
- Ruff: 32 fixes applied (16 style warnings remain - não crítico)
- Migration: Applied to test database

**Acceptance Criteria Status:**
- ✅ AC1: Email service configurado com templates TalentBase
- ✅ AC2: 4 tipos de email implementados (candidate, company submitted/approved/rejected)
- ✅ AC3: Todos emails incluem logo, subject, greeting, action link, footer
- ✅ AC4: Async sending via Celery + Redis (EAGER em dev/test)
- ✅ AC5: Failures logged em EmailLog model
- ✅ AC6: Unsubscribe link placeholder no footer

**Technical Decisions:**
1. **Multipart emails**: HTML preferred, text fallback - ensures compatibility
2. **Exponential backoff**: 60s, 120s, 240s - balances retry attempts vs spam
3. **EmailLog model**: Provides audit trail and failure analysis
4. **Template inheritance**: base.html ensures consistent branding across all emails
5. **Dual provider support**: SendGrid OR AWS SES - deployment flexibility

**Future Enhancements (Out of Scope):**
- Admin dashboard para visualizar EmailLog (pode ser Story futura)
- Email preview no admin antes de enviar
- Template customization via admin
- Email analytics (open rate, click rate)
- Admin notification email (mencionado mas não implementado)

**Known Limitations:**
- Admin notification email (AC8 original) não implementado - TODO comentado no código
- Candidate/generic deactivation email usa template de registration (temporary)
- Unsubscribe é placeholder (# link) - funcionalidade futura

### File List

**Email Templates (9 files):**
- `apps/api/templates/emails/base.html` (192 lines) - Base template
- `apps/api/templates/emails/candidate_registration.html` (28 lines)
- `apps/api/templates/emails/candidate_registration.txt` (25 lines)
- `apps/api/templates/emails/company_registration_submitted.html` (37 lines)
- `apps/api/templates/emails/company_registration_submitted.txt` (28 lines)
- `apps/api/templates/emails/company_approved.html` (35 lines)
- `apps/api/templates/emails/company_approved.txt` (26 lines)
- `apps/api/templates/emails/company_rejected.html` (32 lines)
- `apps/api/templates/emails/company_rejected.txt` (26 lines)

**Backend Core:**
- `apps/api/core/tasks.py` (144 lines) - Enhanced send_email_task
- `apps/api/core/models.py` (114 lines) - EmailLog model added
- `apps/api/core/migrations/0001_add_email_log_model.py` - Migration
- `apps/api/core/tests/test_tasks.py` (304 lines) - 8 comprehensive tests

**Services Updated:**
- `apps/api/authentication/services/registration.py` - Candidate + Company templates
- `apps/api/user_management/services/user_management.py` - Approval/Rejection templates

**Configuration:**
- `apps/api/talentbase/settings/base.py` - TEMPLATES DIRS
- `apps/api/talentbase/settings/production.py` - SendGrid/SES config
- `apps/api/.env.example` - Email variables documentation

**Tests Updated:**
- `apps/api/authentication/tests/test_services.py` - 2 tests updated
- `apps/api/authentication/tests/test_company_registration.py` - 1 test updated

**Commit:** cf23666