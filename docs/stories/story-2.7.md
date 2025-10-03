# Story 2.7: Email Notification System (Basic)

Status: Draft

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

- [ ] Task 1: Configurar serviço de email (AC: 1)
  - [ ] Configurar SendGrid ou AWS SES
  - [ ] Configurar credenciais e settings Django
  - [ ] Testar envio básico de email
- [ ] Task 2: Criar templates de email (AC: 2, 3)
  - [ ] Template confirmação candidato (HTML + texto)
  - [ ] Template registro empresa enviado
  - [ ] Template empresa aprovada
  - [ ] Template empresa rejeitada
- [ ] Task 3: Configurar Celery para envio assíncrono (AC: 4)
  - [ ] Configurar Celery com Redis
  - [ ] Criar task send_email_task
  - [ ] Integrar com views de registro/aprovação
- [ ] Task 4: Implementar logging e monitoramento (AC: 5)
  - [ ] Configurar logging para falhas de email
  - [ ] Criar dashboard admin para logs de email
  - [ ] Implementar retry logic para falhas
- [ ] Task 5: Criar sistema de templates personalizáveis (AC: 3)
  - [ ] Criar base template com branding
  - [ ] Implementar variáveis dinâmicas
  - [ ] Adicionar preview de templates

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

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML/JSON will be added here by context workflow -->

### Agent Model Used

Claude Sonnet 4 (claude-sonnet-4-20250514)

### Debug Log References

### Completion Notes List

### File List