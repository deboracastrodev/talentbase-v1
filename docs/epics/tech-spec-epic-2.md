# Technical Specification - Epic 2: Authentication & User Management

**Epic:** Epic 2 - Authentication & User Management
**Timeline:** Weeks 2-4
**Stories:** 2.1 - 2.7
**Author:** BMad Architecture Agent
**Date:** 2025-10-01

---

## Epic Overview

### Business Context
Epic 2 establishes secure multi-role access control for TalentBase. This epic enables candidates to self-register, companies to request access (with admin approval), and admins to manage all users. The company approval workflow ensures platform quality by allowing admins to vet companies before granting access.

### Success Criteria
- Candidates can self-register and login immediately
- Companies can register (pending admin approval before access)
- Admin can view, approve/reject, and manage all users
- Role-based permissions enforced on all API endpoints and frontend routes
- Email notifications sent for registration, approval, and rejection

### Architecture Context

**Authentication Strategy:**
- Token-Based Auth: Django REST Framework Token Authentication
- Cookie Storage: Token stored in httpOnly cookie (XSS protection)
- Multi-Role: 3 roles (admin, candidate, company) with distinct permissions
- Company Approval: Companies require admin approval before access

**Authorization (RBAC):**
- Admin: Full access to all resources, user management, approvals
- Candidate: Own profile CRUD, job browsing, applications
- Company: Own profile/jobs CRUD, candidate search, application reviews

---

## Key Implementation Details

### Story 2.1: User Registration (Candidate)
- Route: `/auth/register/candidate`
- API: `POST /api/v1/auth/register/candidate`
- Flow: Form submission ’ User + CandidateProfile created ’ Token generated ’ Email sent ’ Redirect to `/candidate/onboarding`
- Security: PBKDF2 password hashing, email uniqueness, rate limiting (10 registrations/hour per IP)

### Story 2.2: User Registration (Company)
- Route: `/auth/register/company`
- API: `POST /api/v1/auth/register/company`
- CNPJ Validation: Format check + digit validation using pycpfcnpj library
- Flow: Form submission ’ User (is_active=False) + CompanyProfile created ’ Emails sent (company + admin) ’ Cannot login until approved

### Story 2.3: Login & Token Authentication
- Route: `/auth/login`
- API: `POST /api/v1/auth/login`
- Token Storage: httpOnly cookie (7 days expiry)
- Role-Based Redirect:
  - admin ’ `/admin`
  - candidate ’ `/candidate`
  - company (active) ’ `/company`
  - company (pending) ’ `/auth/registration-pending`

### Story 2.4: Admin User Management Dashboard
- Route: `/admin/users`
- API: `GET /api/v1/admin/users?role=&status=&search=`
- Features: Filter by role/status, search by name/email, pagination (20 users/page), user detail modal
- Permissions: Admin only

### Story 2.5: Company Approval Workflow
- API:
  - `POST /api/v1/admin/users/:id/approve`
  - `POST /api/v1/admin/users/:id/reject`
- Approval Flow: Admin clicks Approve ’ User.is_active=True ’ Email sent ’ Company can login
- Rejection Flow: Admin clicks Reject (with reason) ’ User.is_active=False ’ Email sent with reason
- Audit: Log admin ID, timestamp, action, reason

### Story 2.6: Role-Based Access Control (RBAC)
- Django Permissions: IsAuthenticated, IsAdmin, IsOwner, IsCandidate, IsCompany
- Remix Route Protection: `requireAuth(request, 'admin')` in loader functions
- Enforcement: All API endpoints decorated with permission classes, frontend routes check role

### Story 2.7: Email Notification System
- Service: AWS SES or SendGrid
- Templates: HTML + plain text for all events
- Async Sending: Celery tasks via Redis queue
- Events:
  - Candidate registration confirmation
  - Company registration submitted
  - Company approval granted
  - Company registration rejected

---

## Database Schema Changes

### User Model Updates
```python
# authentication/models.py
class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('candidate', 'Candidate'),
        ('company', 'Company'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    email = models.EmailField(unique=True, db_index=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### CandidateProfile Minimal Fields (Story 2.1)
```python
# candidates/models.py
class CandidateProfile(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20)
    # Additional fields added in Epic 3
```

### CompanyProfile Fields (Story 2.2)
```python
# companies/models.py
class CompanyProfile(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    company_name = models.CharField(max_length=200)
    cnpj = models.CharField(max_length=255)  # Encrypted
    website = models.URLField()
    contact_person_name = models.CharField(max_length=200)
    contact_person_email = models.EmailField()
    contact_person_phone = models.CharField(max_length=20)
    created_by_admin = models.BooleanField(default=False)
```

---

## API Endpoints Summary

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| POST | `/api/v1/auth/register/candidate` | AllowAny | Candidate self-registration |
| POST | `/api/v1/auth/register/company` | AllowAny | Company registration (pending approval) |
| POST | `/api/v1/auth/login` | AllowAny | User login, returns token |
| POST | `/api/v1/auth/logout` | IsAuthenticated | Logout, delete token |
| GET | `/api/v1/auth/me` | IsAuthenticated | Get current user info |
| GET | `/api/v1/admin/users` | IsAdmin | List all users (filter, search, paginate) |
| POST | `/api/v1/admin/users/:id/approve` | IsAdmin | Approve company registration |
| POST | `/api/v1/admin/users/:id/reject` | IsAdmin | Reject company registration |

---

## Frontend Routes Summary

| Route | Role | Description |
|-------|------|-------------|
| `/auth/register/candidate` | Public | Candidate registration form |
| `/auth/register/company` | Public | Company registration form |
| `/auth/login` | Public | Login form |
| `/auth/registration-pending` | Public | Pending approval page |
| `/admin/users` | Admin | User management dashboard |
| `/candidate` | Candidate | Candidate dashboard (placeholder) |
| `/company` | Company | Company dashboard (placeholder) |

---

## Testing Strategy

### Unit Tests (Django)
- `test_candidate_registration_success`: Valid registration creates User + CandidateProfile
- `test_candidate_registration_duplicate_email`: Duplicate email returns 400
- `test_company_registration_invalid_cnpj`: Invalid CNPJ returns validation error
- `test_login_success`: Valid credentials return token
- `test_login_pending_company`: Pending company receives 403 error
- `test_admin_approve_company`: Approval sets is_active=True, sends email

### E2E Tests (Playwright)
- `candidate-registration.spec.ts`: Full registration flow, redirect to onboarding
- `company-registration.spec.ts`: Registration ’ pending page
- `login-redirect.spec.ts`: Login redirects based on role
- `admin-approval.spec.ts`: Admin approves company ’ company can login

### Manual Testing Checklist
- [ ] Candidate can register and login immediately
- [ ] Company registration sends emails to company and admin
- [ ] Pending company cannot login
- [ ] Admin can approve company
- [ ] Approved company receives email and can login
- [ ] Admin can reject company with reason
- [ ] Rejected company receives email with reason
- [ ] RBAC enforced: candidate cannot access `/admin/users`

---

## Email Templates

### Candidate Registration Confirmation
**Subject:** Bem-vindo ao TalentBase!
**Body:**
```
Olá [CANDIDATE_NAME],

Sua conta foi criada com sucesso no TalentBase!

Próximos passos:
1. Complete seu perfil profissional
2. Adicione suas experiências e habilidades
3. Comece a buscar oportunidades

Acesse sua conta: https://www.salesdog.click/candidate

Atenciosamente,
Equipe TalentBase
```

### Company Registration Submitted
**Subject:** Cadastro Recebido - Aguardando Aprovação
**Body:**
```
Olá [CONTACT_NAME],

Seu cadastro da empresa [COMPANY_NAME] foi recebido com sucesso e está aguardando aprovação do nosso time.

Você receberá um email de confirmação em até 24 horas.

Atenciosamente,
Equipe TalentBase
```

### Company Approval Granted
**Subject:** Empresa Aprovada - Acesse Sua Conta
**Body:**
```
Olá [CONTACT_NAME],

Sua empresa [COMPANY_NAME] foi aprovada no TalentBase!

Agora você pode:
- Publicar vagas de vendas
- Buscar candidatos qualificados
- Gerenciar processos seletivos

Acesse sua conta: https://www.salesdog.click/company

Atenciosamente,
Equipe TalentBase
```

### Company Registration Rejected
**Subject:** Cadastro Não Aprovado
**Body:**
```
Olá [CONTACT_NAME],

Infelizmente, não pudemos aprovar o cadastro da empresa [COMPANY_NAME] no TalentBase.

Motivo: [REJECTION_REASON]

Se você acredita que houve um erro, entre em contato conosco: contato@salesdog.click

Atenciosamente,
Equipe TalentBase
```

---

## Configuration Requirements

### Django Settings

**apps/api/talentbase/settings/base.py:**
```python
# Email Configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = config('EMAIL_HOST', default='smtp.sendgrid.net')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = True
EMAIL_HOST_USER = config('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = 'noreply@salesdog.click'

# Celery Configuration
CELERY_BROKER_URL = config('REDIS_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND = CELERY_BROKER_URL
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
```

### Environment Variables

**Development (.env.development):**
```
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_HOST_USER=your-mailtrap-user
EMAIL_HOST_PASSWORD=your-mailtrap-password
```

**Production (.env.production):**
```
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=your-sendgrid-api-key
```

---

## Celery Tasks

### Email Sending Task
```python
# core/tasks.py
from celery import shared_task
from django.core.mail import send_mail

@shared_task
def send_email_task(subject, message, recipient_list):
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email='noreply@salesdog.click',
            recipient_list=recipient_list,
            fail_silently=False,
        )
        return f"Email sent to {recipient_list}"
    except Exception as e:
        # Log error for admin review
        logger.error(f"Email send failed: {e}")
        return f"Email failed: {e}"
```

### Usage in Views
```python
from core.tasks import send_email_task

# In register_candidate view
send_email_task.delay(
    subject='Bem-vindo ao TalentBase!',
    message=f'Olá {user.candidate_profile.full_name}, sua conta foi criada.',
    recipient_list=[user.email]
)
```

---

## Epic Completion Checklist

**Epic 2 Definition of Done:**
- [ ] Story 2.1: Candidate registration working, email sent
- [ ] Story 2.2: Company registration working, pending approval, emails sent
- [ ] Story 2.3: Login functional, role-based redirect working
- [ ] Story 2.4: Admin dashboard shows all users with filters
- [ ] Story 2.5: Admin can approve/reject companies, emails sent
- [ ] Story 2.6: RBAC enforced on all API endpoints and routes
- [ ] Story 2.7: Email notifications working asynchronously via Celery
- [ ] All unit tests passing (>80% coverage)
- [ ] All E2E tests passing
- [ ] Manual testing checklist completed

---

## Next Steps (Epic 3)

After Epic 2 completion, proceed to **Epic 3: Candidate Management System**:
- Story 3.1: Candidate profile creation (multi-step form)
- Story 3.2: Admin creates candidate profiles manually
- Story 3.3: Shareable public candidate profiles
- Story 3.4: CSV import for Notion data migration
- Story 3.5: Candidate dashboard with profile editing

---

**Document Version:** 1.0
**Last Updated:** 2025-10-01
**Status:** Ready for Implementation
