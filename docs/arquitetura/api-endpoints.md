# API Endpoints

REST API endpoints do TalentBase backend (Django REST Framework).

**Base URL:** `https://api.salesdog.click/v1`

---

## Authentication

### Register Candidate
```http
POST /auth/register/candidate
```

**Request Body:**
```json
{
  "email": "joao@example.com",
  "password": "SecurePass123",
  "first_name": "João",
  "last_name": "Silva",
  "phone": "+55 11 98765-4321",
  "location": "São Paulo, SP"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "uuid",
    "email": "joao@example.com",
    "first_name": "João",
    "last_name": "Silva",
    "role": "candidate"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

### Register Company
```http
POST /auth/register/company
```

**Request Body:**
```json
{
  "email": "contato@empresa.com",
  "password": "SecurePass123",
  "first_name": "Maria",
  "last_name": "Santos",
  "company_name": "Tech Corp",
  "cnpj": "12.345.678/0001-90",
  "contact_phone": "+55 11 3456-7890"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "uuid",
    "email": "contato@empresa.com",
    "role": "company"
  },
  "company": {
    "id": "uuid",
    "company_name": "Tech Corp",
    "approved": false
  },
  "message": "Registration pending admin approval"
}
```

---

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "joao@example.com",
  "password": "SecurePass123"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": "uuid",
    "email": "joao@example.com",
    "first_name": "João",
    "last_name": "Silva",
    "role": "candidate"
  }
}
```

---

### Logout
```http
POST /auth/logout
Authorization: Token <token>
```

**Response:** `204 No Content`

---

### Refresh Token
```http
POST /auth/refresh
```

**Request Body:**
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

## Candidates

### List Candidates (Admin/Company)
```http
GET /candidates?status=available&skills=react,typescript&seniority=senior&page=1&limit=20
Authorization: Token <token>
```

**Query Parameters:**
- `status` - Filter by status (available, inactive, no_contract)
- `skills` - Comma-separated skill names
- `seniority` - Filter by seniority level
- `location` - Filter by location
- `verified` - Filter verified candidates (true/false)
- `ranking_min` - Minimum ranking score
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Response:** `200 OK`
```json
{
  "count": 45,
  "next": "/candidates?page=2",
  "previous": null,
  "results": [
    {
      "id": "uuid",
      "user": {
        "first_name": "João",
        "last_name": "Silva"
      },
      "title": "Senior Frontend Developer",
      "seniority": "senior",
      "location": "São Paulo, SP",
      "avatar": "https://...",
      "skills": [
        {"name": "React", "proficiency_level": "expert"},
        {"name": "TypeScript", "proficiency_level": "advanced"}
      ],
      "salary_min": 12000,
      "salary_max": 18000,
      "verified": true,
      "ranking_score": 85,
      "status": "available"
    }
  ]
}
```

---

### Get Candidate Detail
```http
GET /candidates/:id
Authorization: Token <token>
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "user": {
    "first_name": "João",
    "last_name": "Silva",
    "email": "joao@example.com"
  },
  "phone": "+55 11 98765-4321",
  "location": "São Paulo, SP",
  "linkedin_url": "https://linkedin.com/in/joao",
  "github_url": "https://github.com/joao",
  "title": "Senior Frontend Developer",
  "seniority": "senior",
  "bio": "Desenvolvedor com 7 anos de experiência...",
  "avatar": "https://...",
  "skills": [
    {
      "skill": {"id": "uuid", "name": "React"},
      "proficiency_level": "expert",
      "years_experience": 5
    }
  ],
  "experiences": [
    {
      "id": "uuid",
      "company": "Tech Startup",
      "position": "Senior Frontend Developer",
      "start_date": "2020-01-01",
      "end_date": null,
      "is_current": true,
      "description": "Responsável por..."
    }
  ],
  "salary_min": 12000,
  "salary_max": 18000,
  "verified": true,
  "ranking_score": 85,
  "status": "available"
}
```

---

### Get Candidate by Share Token (Public)
```http
GET /share/candidate/:token
```

**Response:** `200 OK`
```json
{
  "first_name": "João",
  "last_name": "Silva",
  "title": "Senior Frontend Developer",
  "location": "São Paulo, SP",
  "avatar": "https://...",
  "skills": [...],
  "experiences": [...],
  "verified": true
}
```

---

### Update Candidate Profile
```http
PATCH /candidates/:id
Authorization: Token <token>
```

**Request Body:**
```json
{
  "bio": "Updated bio...",
  "salary_min": 15000,
  "status": "available"
}
```

**Response:** `200 OK`

---

### Add Candidate Skill
```http
POST /candidates/:id/skills
Authorization: Token <token>
```

**Request Body:**
```json
{
  "skill_id": "uuid",
  "proficiency_level": "expert",
  "years_experience": 5
}
```

**Response:** `201 Created`

---

### Add Experience
```http
POST /candidates/:id/experiences
Authorization: Token <token>
```

**Request Body:**
```json
{
  "company": "Tech Startup",
  "position": "Senior Developer",
  "start_date": "2020-01-01",
  "end_date": null,
  "is_current": true,
  "description": "Responsible for..."
}
```

**Response:** `201 Created`

---

## Companies

### Get Company Profile
```http
GET /companies/:id
Authorization: Token <token>
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "company_name": "Tech Corp",
  "description": "Leading tech company...",
  "website": "https://techcorp.com",
  "size": "51-200",
  "industry": "Technology",
  "location": "São Paulo, SP",
  "logo": "https://...",
  "approved": true
}
```

---

### Update Company Profile
```http
PATCH /companies/:id
Authorization: Token <token>
```

**Request Body:**
```json
{
  "description": "Updated description...",
  "website": "https://newsite.com"
}
```

**Response:** `200 OK`

---

## Jobs

### List Jobs
```http
GET /jobs?status=active&seniority=senior&location=remote&page=1
Authorization: Token <token> (optional for public jobs)
```

**Query Parameters:**
- `status` - Filter by status (active, draft, paused, closed)
- `seniority` - Filter by seniority
- `location` - Filter by location
- `work_mode` - Filter by work mode (remote, hybrid, onsite)
- `skills` - Comma-separated skills
- `company_id` - Filter by company
- `page`, `limit` - Pagination

**Response:** `200 OK`
```json
{
  "count": 23,
  "results": [
    {
      "id": "uuid",
      "company": {
        "id": "uuid",
        "company_name": "Tech Corp",
        "logo": "https://..."
      },
      "title": "Senior Frontend Developer",
      "seniority": "senior",
      "location": "São Paulo, SP",
      "work_mode": "remote",
      "salary_min": 12000,
      "salary_max": 18000,
      "salary_public": true,
      "skills": [
        {"name": "React", "required": true},
        {"name": "TypeScript", "required": true}
      ],
      "created_at": "2025-10-01T10:00:00Z"
    }
  ]
}
```

---

### Get Job Detail
```http
GET /jobs/:id
Authorization: Token <token> (optional)
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "company": {
    "id": "uuid",
    "company_name": "Tech Corp",
    "description": "...",
    "logo": "https://..."
  },
  "title": "Senior Frontend Developer",
  "description": "We are looking for...",
  "requirements": "- 5+ years experience...",
  "benefits": "- Health insurance...",
  "seniority": "senior",
  "location": "São Paulo, SP",
  "work_mode": "remote",
  "salary_min": 12000,
  "salary_max": 18000,
  "salary_public": true,
  "skills": [
    {"skill": {"name": "React"}, "required": true}
  ],
  "status": "active",
  "share_token": "abc123...",
  "created_at": "2025-10-01T10:00:00Z"
}
```

---

### Get Job by Share Token (Public)
```http
GET /share/job/:token
```

**Response:** `200 OK` (same as Get Job Detail, public view)

---

### Create Job (Company)
```http
POST /jobs
Authorization: Token <token>
```

**Request Body:**
```json
{
  "title": "Senior Frontend Developer",
  "description": "We are looking for...",
  "requirements": "- 5+ years...",
  "benefits": "- Health insurance...",
  "seniority": "senior",
  "location": "São Paulo, SP",
  "work_mode": "remote",
  "salary_min": 12000,
  "salary_max": 18000,
  "salary_public": true,
  "skills": [
    {"skill_id": "uuid", "required": true},
    {"skill_id": "uuid", "required": false}
  ]
}
```

**Response:** `201 Created`

---

### Update Job
```http
PATCH /jobs/:id
Authorization: Token <token>
```

**Request Body:**
```json
{
  "description": "Updated description...",
  "status": "paused"
}
```

**Response:** `200 OK`

---

### Delete Job
```http
DELETE /jobs/:id
Authorization: Token <token>
```

**Response:** `204 No Content`

---

## Applications

### Apply to Job (Candidate)
```http
POST /jobs/:job_id/apply
Authorization: Token <token>
```

**Request Body:**
```json
{
  "notes": "I'm interested in this position because..."
}
```

**Response:** `201 Created`

---

### List Applications (Candidate)
```http
GET /candidates/:id/applications?status=pending
Authorization: Token <token>
```

**Response:** `200 OK`
```json
{
  "results": [
    {
      "id": "uuid",
      "job": {
        "id": "uuid",
        "title": "Senior Frontend Developer",
        "company": {"company_name": "Tech Corp"}
      },
      "status": "pending",
      "applied_at": "2025-10-01T10:00:00Z"
    }
  ]
}
```

---

### List Applications for Job (Company)
```http
GET /jobs/:id/applications?status=reviewing
Authorization: Token <token>
```

**Response:** `200 OK`
```json
{
  "results": [
    {
      "id": "uuid",
      "candidate": {
        "id": "uuid",
        "first_name": "João",
        "last_name": "Silva",
        "title": "Senior Frontend Developer",
        "avatar": "https://..."
      },
      "status": "reviewing",
      "notes": "Interested because...",
      "applied_at": "2025-10-01T10:00:00Z"
    }
  ]
}
```

---

### Update Application Status (Company)
```http
PATCH /applications/:id
Authorization: Token <token>
```

**Request Body:**
```json
{
  "status": "interview",
  "notes": "Scheduling interview for next week"
}
```

**Response:** `200 OK`

---

## Favorites

### Add Favorite (Company favorites Candidate)
```http
POST /favorites
Authorization: Token <token>
```

**Request Body:**
```json
{
  "candidate_id": "uuid",
  "notes": "Great profile for future openings"
}
```

**Response:** `201 Created`

---

### List Favorites
```http
GET /favorites
Authorization: Token <token>
```

**Response:** `200 OK`
```json
{
  "results": [
    {
      "id": "uuid",
      "candidate": {
        "id": "uuid",
        "first_name": "João",
        "last_name": "Silva",
        "title": "Senior Frontend Developer",
        "avatar": "https://..."
      },
      "notes": "Great profile...",
      "created_at": "2025-10-01T10:00:00Z"
    }
  ]
}
```

---

### Remove Favorite
```http
DELETE /favorites/:id
Authorization: Token <token>
```

**Response:** `204 No Content`

---

## Skills (Public)

### List All Skills
```http
GET /skills?category=language&search=react
```

**Query Parameters:**
- `category` - Filter by category
- `search` - Search by name

**Response:** `200 OK`
```json
{
  "results": [
    {
      "id": "uuid",
      "name": "React",
      "category": "framework"
    },
    {
      "id": "uuid",
      "name": "TypeScript",
      "category": "language"
    }
  ]
}
```

---

## Rankings (Admin)

### Get Rankings
```http
GET /rankings?category=frontend&limit=10
Authorization: Token <token>
```

**Response:** `200 OK`
```json
{
  "category": "frontend",
  "results": [
    {
      "rank": 1,
      "candidate": {
        "id": "uuid",
        "first_name": "João",
        "last_name": "Silva",
        "title": "Senior Frontend Developer",
        "avatar": "https://..."
      },
      "ranking_score": 95
    }
  ]
}
```

---

### Update Candidate Ranking (Admin)
```http
PATCH /candidates/:id/ranking
Authorization: Token <token>
```

**Request Body:**
```json
{
  "ranking_score": 85,
  "ranking_category": "frontend"
}
```

**Response:** `200 OK`

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "validation_error",
  "details": {
    "email": ["This field is required."],
    "password": ["Password must be at least 8 characters."]
  }
}
```

### 401 Unauthorized
```json
{
  "error": "authentication_failed",
  "message": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "error": "permission_denied",
  "message": "You do not have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "error": "not_found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "server_error",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting

- **Authenticated requests:** 1000 requests/hour
- **Public endpoints:** 100 requests/hour
- **Share links:** 500 requests/hour

**Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1633024800
```

---

## Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

**Response Format:**
```json
{
  "count": 100,
  "next": "/endpoint?page=2",
  "previous": null,
  "results": [...]
}
```
