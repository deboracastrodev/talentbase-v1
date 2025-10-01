# Database Schema

Schema do banco de dados PostgreSQL para o TalentBase.

---

## Entity Relationship Diagram (ERD)

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│     User     │       │   Candidate  │       │   Company    │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │◄─────┤ user_id (FK) │       │ user_id (FK) │────┐
│ email        │       │ phone        │       │ company_name │    │
│ password     │       │ location     │       │ cnpj         │    │
│ role         │       │ title        │       │ size         │    │
│ is_active    │       │ seniority    │       │ industry     │    │
│ created_at   │       │ salary_min   │       └──────────────┘    │
│ updated_at   │       │ salary_max   │                           │
└──────────────┘       │ status       │                           │
                       │ verified     │                           │
                       │ ranking      │                           │
                       └──────────────┘                           │
                               │                                  │
                    ┌──────────┴──────────┐                      │
                    │                     │                       │
         ┌──────────▼──────────┐  ┌──────▼──────────┐           │
         │  CandidateSkill     │  │  Experience     │           │
         ├─────────────────────┤  ├─────────────────┤           │
         │ id (PK)             │  │ id (PK)         │           │
         │ candidate_id (FK)   │  │ candidate_id(FK)│           │
         │ skill_id (FK)       │  │ company         │           │
         │ proficiency_level   │  │ position        │           │
         └─────────────────────┘  │ start_date      │           │
                    │              │ end_date        │           │
                    │              │ description     │           │
         ┌──────────▼──────────┐  └─────────────────┘           │
         │       Skill         │                                 │
         ├─────────────────────┤                                 │
         │ id (PK)             │                                 │
         │ name                │                                 │
         │ category            │                                 │
         └─────────────────────┘                                 │
                                                                 │
┌──────────────┐                                                │
│     Job      │◄───────────────────────────────────────────────┘
├──────────────┤
│ id (PK)      │
│ company_id   │
│ title        │
│ description  │
│ seniority    │
│ salary_min   │
│ salary_max   │
│ location     │
│ work_mode    │
│ status       │
│ share_token  │
│ created_at   │
└──────────────┘
        │
        ├──────────────────┐
        │                  │
┌───────▼──────┐  ┌────────▼─────────┐
│   JobSkill   │  │   Application    │
├──────────────┤  ├──────────────────┤
│ id (PK)      │  │ id (PK)          │
│ job_id (FK)  │  │ job_id (FK)      │
│ skill_id(FK) │  │ candidate_id(FK) │
│ required     │  │ status           │
└──────────────┘  │ applied_at       │
                  │ notes            │
                  └──────────────────┘

┌──────────────────┐
│    Favorite      │
├──────────────────┤
│ id (PK)          │
│ company_id (FK)  │
│ candidate_id(FK) │
│ created_at       │
└──────────────────┘
```

---

## Models (Django)

### 1. User (Authentication)

```python
# apps/authentication/models.py

class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom user model with email as username
    """
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('candidate', 'Candidate'),
        ('company', 'Company'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'role']
```

---

### 2. Candidate

```python
# apps/candidates/models.py

class Candidate(models.Model):
    """
    Candidate profile with professional information
    """
    STATUS_CHOICES = [
        ('incomplete', 'Incomplete Profile'),
        ('available', 'Available'),
        ('no_contract', 'No Contract'),
        ('inactive', 'Inactive'),
    ]

    SENIORITY_CHOICES = [
        ('intern', 'Intern'),
        ('junior', 'Junior'),
        ('mid', 'Mid-level'),
        ('senior', 'Senior'),
        ('lead', 'Lead'),
        ('principal', 'Principal'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='candidate_profile')

    # Personal Info
    phone = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=200)
    linkedin_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)

    # Professional Info
    title = models.CharField(max_length=200)  # Ex: "Senior Frontend Developer"
    seniority = models.CharField(max_length=20, choices=SENIORITY_CHOICES)
    bio = models.TextField(blank=True)

    # Salary
    salary_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    salary_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    salary_currency = models.CharField(max_length=3, default='BRL')

    # Status & Verification
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='incomplete')
    verified = models.BooleanField(default=False)
    verified_at = models.DateTimeField(null=True, blank=True)

    # Ranking
    ranking_score = models.IntegerField(default=0)
    ranking_category = models.CharField(max_length=100, blank=True)  # Ex: "Frontend", "Backend"

    # Shareable
    share_token = models.CharField(max_length=64, unique=True, blank=True)

    # Avatar
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-ranking_score', '-created_at']

    def save(self, *args, **kwargs):
        if not self.share_token:
            self.share_token = secrets.token_urlsafe(32)
        super().save(*args, **kwargs)
```

---

### 3. Skill

```python
# apps/candidates/models.py

class Skill(models.Model):
    """
    Skills catalog (programming languages, tools, soft skills)
    """
    CATEGORY_CHOICES = [
        ('language', 'Programming Language'),
        ('framework', 'Framework'),
        ('tool', 'Tool'),
        ('soft', 'Soft Skill'),
        ('other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
```

---

### 4. CandidateSkill

```python
# apps/candidates/models.py

class CandidateSkill(models.Model):
    """
    Many-to-many relationship between Candidate and Skill with proficiency
    """
    PROFICIENCY_CHOICES = [
        ('basic', 'Basic'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    proficiency_level = models.CharField(max_length=20, choices=PROFICIENCY_CHOICES)
    years_experience = models.IntegerField(null=True, blank=True)

    class Meta:
        unique_together = ['candidate', 'skill']
```

---

### 5. Experience

```python
# apps/candidates/models.py

class Experience(models.Model):
    """
    Professional experience history
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='experiences')

    company = models.CharField(max_length=200)
    position = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=200, blank=True)

    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)  # Null = current job
    is_current = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_date']
```

---

### 6. Company

```python
# apps/companies/models.py

class Company(models.Model):
    """
    Company profile
    """
    SIZE_CHOICES = [
        ('1-10', '1-10 employees'),
        ('11-50', '11-50 employees'),
        ('51-200', '51-200 employees'),
        ('201-500', '201-500 employees'),
        ('501-1000', '501-1000 employees'),
        ('1000+', '1000+ employees'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='company_profile')

    company_name = models.CharField(max_length=200)
    cnpj = models.CharField(max_length=18, unique=True)
    description = models.TextField(blank=True)
    website = models.URLField(blank=True)

    size = models.CharField(max_length=20, choices=SIZE_CHOICES)
    industry = models.CharField(max_length=100)
    location = models.CharField(max_length=200)

    logo = models.ImageField(upload_to='company_logos/', blank=True, null=True)

    # Contact
    contact_name = models.CharField(max_length=200)
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=20)

    # Approval
    approved = models.BooleanField(default=False)
    approved_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

---

### 7. Job

```python
# apps/jobs/models.py

class Job(models.Model):
    """
    Job posting
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('closed', 'Closed'),
    ]

    WORK_MODE_CHOICES = [
        ('remote', 'Remote'),
        ('hybrid', 'Hybrid'),
        ('onsite', 'On-site'),
    ]

    SENIORITY_CHOICES = [
        ('intern', 'Intern'),
        ('junior', 'Junior'),
        ('mid', 'Mid-level'),
        ('senior', 'Senior'),
        ('lead', 'Lead'),
        ('principal', 'Principal'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='jobs')

    title = models.CharField(max_length=200)
    description = models.TextField()
    requirements = models.TextField(blank=True)
    benefits = models.TextField(blank=True)

    seniority = models.CharField(max_length=20, choices=SENIORITY_CHOICES)
    location = models.CharField(max_length=200)
    work_mode = models.CharField(max_length=10, choices=WORK_MODE_CHOICES)

    # Salary
    salary_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    salary_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    salary_currency = models.CharField(max_length=3, default='BRL')
    salary_public = models.BooleanField(default=True)

    # Status
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')

    # Shareable
    share_token = models.CharField(max_length=64, unique=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.share_token:
            self.share_token = secrets.token_urlsafe(32)
        super().save(*args, **kwargs)
```

---

### 8. JobSkill

```python
# apps/jobs/models.py

class JobSkill(models.Model):
    """
    Skills required for a job
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    required = models.BooleanField(default=True)  # True = mandatory, False = nice to have

    class Meta:
        unique_together = ['job', 'skill']
```

---

### 9. Application

```python
# apps/jobs/models.py

class Application(models.Model):
    """
    Candidate application to a job
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('reviewing', 'Reviewing'),
        ('interview', 'Interview'),
        ('offer', 'Offer'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('withdrawn', 'Withdrawn'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='applications')

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True)

    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['job', 'candidate']
        ordering = ['-applied_at']
```

---

### 10. Favorite

```python
# apps/companies/models.py

class Favorite(models.Model):
    """
    Company favorites a candidate
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='favorites')
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='favorited_by')

    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['company', 'candidate']
        ordering = ['-created_at']
```

---

## Indexes

Para otimização de queries:

```python
# Candidate
indexes = [
    models.Index(fields=['status', 'verified']),
    models.Index(fields=['ranking_score']),
    models.Index(fields=['share_token']),
]

# Job
indexes = [
    models.Index(fields=['status', 'company']),
    models.Index(fields=['share_token']),
    models.Index(fields=['created_at']),
]

# Application
indexes = [
    models.Index(fields=['job', 'status']),
    models.Index(fields=['candidate', 'status']),
]
```

---

## Migrations

Para criar o banco de dados:

```bash
# Criar migrations
python manage.py makemigrations

# Aplicar migrations
python manage.py migrate

# Criar superuser admin
python manage.py createsuperuser
```
