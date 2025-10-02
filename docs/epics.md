# talentbase - Epic Breakdown

**Author:** Debora
**Date:** 2025-10-01
**Project Level:** Level 3 (Full Product)
**Target Scale:** 32-42 stories across 5 epics, 12-week MVP timeline

---

## Epic Overview

This document provides the complete story-level breakdown for all 5 epics in the TalentBase MVP. Each epic is sequenced to deliver incremental business value, with stories designed for 2-week sprint execution.

**Epic Sequencing Strategy:**
1. **Epic 1** establishes foundation (infrastructure, landing page)
2. **Epic 2** enables user access (authentication, roles)
3. **Epic 3** delivers core candidate management (replaces Notion)
4. **Epic 4** completes marketplace (companies, jobs, search)
5. **Epic 5** optimizes operations (matching, analytics)

---

## Epic Details

## Epic 1: Foundation & Public Presence

**Timeline:** Weeks 1-2
**Goal:** Establish brand presence and core technical infrastructure
**Business Value:** Professional public face for TalentBase, technical foundation ready for feature development

### Epic 1 Success Criteria
- [ ] Landing page live at www.salesdog.click with all sections
- [ ] Design system components rendering correctly
- [ ] Database schema created with all tables and relationships
- [ ] CI/CD pipeline deploying to AWS successfully
- [ ] Backend and frontend projects structured and communicating

---

### Story 1.1: Setup Monorepo Structure & Development Environment

**As a** developer
**I want** the monorepo structure configured with all necessary tooling
**So that** the team can develop frontend and backend efficiently

**Prerequisites:**
- Repository initialized
- AWS CLI configured locally

**Acceptance Criteria:**
1. Monorepo created with `packages/design-system`, `packages/web`, `apps/api` folders
2. Design system package builds successfully with Vite + React
3. Remix app (`packages/web`) runs locally on port 3000
4. Django project (`apps/api`) runs locally on port 8000
5. PostgreSQL database running via Docker Compose
6. Redis running via Docker Compose
7. Environment variables configured (.env.example provided)
8. README.md with setup instructions

**Technical Notes:**
- Use pnpm workspaces for monorepo
- Django settings split: base.py, development.py, production.py
- Database: PostgreSQL 15+, Redis 7+

---

### Story 1.2: Implement Database Schema (All Models)

**As a** backend developer
**I want** the complete PostgreSQL schema implemented as Django models
**So that** all entities are ready for API development

**Prerequisites:**
- Django project running
- PostgreSQL connected

**Acceptance Criteria:**
1. User model created with role field (admin, candidate, company)
2. Candidate model with all sales-specific fields (position, experience, tools, etc.)
3. Company model with CNPJ, industry, status fields
4. Job model with position, seniority, salary, requirements
5. Application model linking candidates to jobs
6. Favorite model (company favorites candidates)
7. Skill model (many-to-many with candidates and jobs)
8. Experience model (candidate work history)
9. Ranking model (admin-assigned candidate scores)
10. All foreign keys and indexes defined
11. Django migrations created and applied
12. Database diagram generated (docs/arquitetura/database-schema.md updated)

**Technical Notes:**
- Use Django's built-in User model (extend with roles)
- Encrypted fields for CPF/CNPJ (django-encrypted-model-fields)
- Soft deletes via `is_active` boolean field
- created_at, updated_at timestamps on all models

---

### Story 1.3: Design System Integration & Component Library

**As a** frontend developer
**I want** the @talentbase/design-system package integrated into Remix
**So that** all UI components are consistent and reusable

**Prerequisites:**
- Design system already built (Storybook deployed)
- Remix project initialized

**Acceptance Criteria:**
1. Design system package linked via pnpm workspace
2. Tailwind CSS config imported from design system
3. All design tokens accessible (colors, spacing, typography)
4. Core components render in Remix: Button, Input, Card, Badge, Select, Checkbox
5. Component examples page created at `/dev/components`
6. Design system Storybook accessible locally
7. No console errors when using components

**Technical Notes:**
- Import design system as `@talentbase/design-system`
- Use Tailwind JIT mode
- Lucide React icons

---

### Story 1.4: Build Public Landing Page

**As a** visitor
**I want** to see a professional landing page explaining TalentBase
**So that** I understand the value and can register as candidate or company

**Prerequisites:**
- Design system integrated
- Landing page design in docs/site/landingpage.pdf

**Acceptance Criteria:**
1. Homepage route (`/`) renders with hero section
2. Value proposition clearly states "specialized tech sales recruitment"
3. "How it Works" section for candidates and companies
4. Benefits section (for candidates: get discovered, for companies: find talent)
5. Call-to-action buttons: "Register as Candidate", "Register as Company"
6. Footer with contact info, social links
7. Fully responsive (mobile, tablet, desktop)
8. Meta tags for SEO (title, description, OG tags)
9. Page loads under 2 seconds

**Technical Notes:**
- Use Remix routes: `app/routes/_public._index.tsx`
- Follow design system color palette
- Images optimized and served from public folder
- Remix meta export for SEO

---

### Story 1.5: Setup CI/CD Pipeline (GitHub Actions + AWS)

**As a** DevOps engineer
**I want** automated deployment to AWS on every merge to main
**So that** the team can ship features continuously

**Prerequisites:**
- AWS account configured
- DNS salesdog.click registered

**Acceptance Criteria:**
1. GitHub Actions workflow created (`.github/workflows/deploy.yml`)
2. Workflow runs on push to `main` branch
3. Backend tests run (Django unit tests)
4. Frontend build succeeds (Remix production build)
5. Docker images built for API and web
6. Images pushed to AWS ECR
7. ECS service updated with new images
8. Deployment completes in under 15 minutes
9. Rollback workflow available for emergencies
10. Deployment notifications sent (success/failure)

**Technical Notes:**
- Use AWS ECS for container orchestration
- Environment variables stored in AWS Secrets Manager
- Database migrations run before deployment
- Blue-green deployment for zero downtime

---

### Story 1.6: Configure DNS & SSL Certificates

**As an** infrastructure admin
**I want** salesdog.click domain pointing to our application with HTTPS
**So that** users can access the platform securely

**Prerequisites:**
- AWS infrastructure deployed
- Domain salesdog.click registered

**Acceptance Criteria:**
1. Route 53 hosted zone configured for salesdog.click
2. A records point to:
   - `www.salesdog.click` → Frontend (Remix)
   - `api.salesdog.click` → Backend (Django)
   - `storybook.salesdog.click` → Design System Storybook
3. SSL certificates issued via AWS ACM
4. HTTPS enforced (HTTP redirects to HTTPS)
5. SSL certificate auto-renewal configured
6. DNS propagation confirmed (accessible globally)

**Technical Notes:**
- Use AWS Certificate Manager (ACM)
- Application Load Balancer (ALB) for SSL termination
- Redirect HTTP → HTTPS at ALB level

---

**Epic 1 Total Stories:** 6 stories
**Epic 1 Estimated Duration:** 2 weeks

---

## Epic 2: Authentication & User Management

**Timeline:** Weeks 2-4
**Goal:** Enable secure multi-role access for Admin, Candidates, and Companies
**Business Value:** Platform access control, admin quality gating via company approval

### Epic 2 Success Criteria
- [ ] Candidates can self-register and login
- [ ] Companies can register (pending admin approval)
- [ ] Admin can manage all users
- [ ] Role-based permissions enforced on all API endpoints
- [ ] Email notifications sent for registration and approval

---

### Story 2.1: Implement User Registration (Candidate)

**As a** sales professional
**I want** to register for a TalentBase account
**So that** I can create my profile and apply to jobs

**Prerequisites:**
- Database User model created
- Email service configured (SendGrid or AWS SES)

**Acceptance Criteria:**
1. Registration page at `/register/candidate`
2. Form fields: name, email, password, confirm password, phone
3. Client-side validation (email format, password strength, matching passwords)
4. API endpoint `POST /api/auth/register/candidate`
5. Password hashed using Django's default algorithm
6. User created with role="candidate", status="active"
7. Confirmation email sent with account details
8. Success message displayed, redirect to `/candidate/profile` (onboarding)
9. Error handling for duplicate email
10. Form accessible and WCAG 2.1 AA compliant

**Technical Notes:**
- Use Django REST Framework serializer for validation
- Token generation on successful registration
- Email template with TalentBase branding

---

### Story 2.2: Implement User Registration (Company)

**As a** hiring manager
**I want** to register my company on TalentBase
**So that** I can post jobs and search candidates (after admin approval)

**Prerequisites:**
- User registration (candidate) completed
- Admin notification system

**Acceptance Criteria:**
1. Registration page at `/register/company`
2. Form fields: company name, CNPJ, email, password, contact name, phone, website
3. CNPJ validation (Brazilian tax ID format)
4. API endpoint `POST /api/auth/register/company`
5. User created with role="company", status="pending_approval"
6. Company profile created linked to user
7. Email sent to user: "Registration received, pending admin approval"
8. Email sent to admin: "New company registration requires approval"
9. User cannot login until status="active"
10. Success message: "Registration submitted, you'll receive approval within 24 hours"

**Technical Notes:**
- Use CNPJ validation library (pycpfcnpj)
- Company model linked to User via OneToOne
- Admin notification via email or dashboard alert

---

### Story 2.3: Implement Login & Token Authentication

**As a** registered user
**I want** to login with my email and password
**So that** I can access my dashboard

**Prerequisites:**
- User registration flows completed

**Acceptance Criteria:**
1. Login page at `/login`
2. Form fields: email, password
3. API endpoint `POST /api/auth/login`
4. Token generated on successful authentication (DRF Token Auth)
5. Token stored securely in httpOnly cookie
6. User redirected based on role:
   - admin → `/admin`
   - candidate → `/candidate`
   - company (active) → `/company`
   - company (pending) → `/pending-approval` page
7. Error message for invalid credentials
8. Error message for inactive/pending accounts
9. "Forgot password" link (placeholder for future story)

**Technical Notes:**
- Django REST Framework TokenAuthentication
- Token stored in cookie with secure, httpOnly, sameSite flags
- Rate limiting on login endpoint (5 attempts per minute)

---

### Story 2.4: Implement Admin User Management Dashboard

**As an** admin
**I want** to view and manage all users (candidates and companies)
**So that** I can approve companies, deactivate users, and maintain platform quality

**Prerequisites:**
- Admin authenticated
- Users exist in database

**Acceptance Criteria:**
1. Admin dashboard at `/admin/users`
2. Table view of all users with columns: name, email, role, status, created_at
3. Filter by role (all, admin, candidate, company)
4. Filter by status (all, active, pending, inactive)
5. Search by name or email
6. Click user row → opens user detail modal
7. Admin can change user status (activate, deactivate, approve company)
8. Status change triggers email notification to user
9. Pagination (20 users per page)
10. Admin can create users manually (candidate, company, admin)

**Technical Notes:**
- Use Remix loader to fetch users via API
- Table component from design system
- API endpoint: `GET /api/admin/users` (admin-only permission)

---

### Story 2.5: Implement Company Approval Workflow

**As an** admin
**I want** to review pending company registrations and approve/reject them
**So that** only legitimate companies can access the platform

**Prerequisites:**
- Admin user management dashboard
- Company registrations exist

**Acceptance Criteria:**
1. Admin sees "Pending Approvals" widget on dashboard with count
2. Click widget → navigates to `/admin/users?status=pending&role=company`
3. Admin can view company details: name, CNPJ, website, contact info
4. Admin can verify CNPJ (external lookup or manual verification)
5. Admin can click "Approve" or "Reject" with optional reason
6. Approval:
   - User status changes to "active"
   - Email sent: "Your company has been approved! You can now login."
7. Rejection:
   - User status changes to "rejected"
   - Email sent: "Your registration was not approved" + reason
8. Approved companies can immediately login and access `/company` dashboard
9. Audit log records approval/rejection (admin user, timestamp, reason)

**Technical Notes:**
- API endpoints: `POST /api/admin/users/:id/approve`, `POST /api/admin/users/:id/reject`
- Email templates for approval and rejection
- Consider CNPJ public API for validation (ReceitaWS)

---

### Story 2.6: Implement Role-Based Access Control (RBAC)

**As a** system
**I want** to enforce role-based permissions on all API endpoints
**So that** users can only access resources appropriate to their role

**Prerequisites:**
- All user roles defined (admin, candidate, company)
- API endpoints created

**Acceptance Criteria:**
1. All API endpoints require authentication (except public routes)
2. Admin role has access to all endpoints
3. Candidate role can:
   - Read/update own profile
   - Browse jobs
   - Create applications
   - View own applications
4. Company role can:
   - Read/update own company profile
   - CRUD own job postings
   - Search candidates (read-only)
   - Favorite candidates
   - View applications to own jobs
5. Unauthorized access returns 403 Forbidden with clear message
6. Permission decorator applied to all Django views
7. Frontend routes protected (redirect to login if unauthenticated)
8. Frontend hides UI elements not permitted for role

**Technical Notes:**
- Django REST Framework permissions: IsAuthenticated, custom role checks
- Remix loaders check authentication and role via cookie token
- Custom permission classes: IsAdmin, IsCandidate, IsCompany, IsOwner

---

### Story 2.7: Implement Email Notification System (Basic)

**As a** user
**I want** to receive email notifications for important events
**So that** I stay informed about my account and activity

**Prerequisites:**
- Email service configured (SendGrid/AWS SES)

**Acceptance Criteria:**
1. Email service configured with TalentBase branded templates
2. Emails sent for:
   - Candidate registration confirmation
   - Company registration submitted
   - Company approval granted
   - Company registration rejected
3. All emails include:
   - TalentBase logo
   - Clear subject line
   - Personalized greeting (user's name)
   - Action link (e.g., "Login to your dashboard")
   - Footer with contact info
4. Emails sent asynchronously (Celery + Redis queue)
5. Failed email sends logged for admin review
6. Unsubscribe link (placeholder for future)

**Technical Notes:**
- Use Django email templates (HTML + plain text fallback)
- Celery task: `send_email_task`
- Email tracking (optional): SendGrid analytics

---

**Epic 2 Total Stories:** 7 stories
**Epic 2 Estimated Duration:** 2 weeks

---

## Epic 3: Candidate Management System

**Timeline:** Weeks 4-7
**Goal:** Replace Notion with comprehensive candidate profile management
**Business Value:** Core value proposition - migrate from Notion, enable candidate discovery by companies

### Epic 3 Success Criteria
- [ ] All Notion candidate data migrated to TalentBase
- [ ] Candidates can create and edit comprehensive sales profiles
- [ ] Shareable public candidate profiles generate and work
- [ ] Admin can curate, rank, and manage all candidates
- [ ] Candidate dashboard functional for profile and job browsing

---

### Story 3.1: Implement Candidate Profile Creation (Self-Registration)

**As a** candidate
**I want** to create my comprehensive sales profile
**So that** companies can discover my skills and experience

**Prerequisites:**
- Candidate registered and authenticated
- Candidate model schema exists

**Acceptance Criteria:**
1. Candidate redirected to `/candidate/profile/create` after registration
2. Multi-step form wizard with progress indicator (5 steps):
   - Step 1: Basic Info (name, phone, location, photo upload to S3)
   - Step 2: Position & Experience (position, years, Inbound/Outbound, Inside/Field, sales cycle, ticket size)
   - Step 3: Tools & Software (multi-select: Salesforce, Hubspot, Apollo.io, etc.)
   - Step 4: Solutions & Departments (solutions sold, departments sold to)
   - Step 5: Work History & Bio (add 1+ previous companies, write bio)
3. Each step has client-side validation before "Next"
4. "Save Draft" button on each step (saves progress)
5. API endpoint `POST /api/candidates` creates profile
6. File upload for profile photo (max 2MB, JPG/PNG)
7. Photo stored in AWS S3, URL saved to database
8. Success message: "Profile created! Generate your shareable link."
9. Redirect to `/candidate/profile` (view mode)

**Technical Notes:**
- Use Remix Form with multi-step state management
- S3 presigned URLs for direct upload from browser
- Candidate linked to User via OneToOne field

---

### Story 3.2: Generate Shareable Public Candidate Profile

**As a** candidate
**I want** to generate a public shareable link to my profile
**So that** I can share it on LinkedIn and with recruiters

**Prerequisites:**
- Candidate profile created

**Acceptance Criteria:**
1. Button "Generate Shareable Link" on candidate dashboard
2. API endpoint `POST /api/candidates/:id/generate-share-token`
3. Unique token generated (UUID), stored in database
4. Public URL format: `https://www.salesdog.click/share/candidate/:token`
5. Public page renders at `/share/candidate/:token` (no auth required)
6. Public profile displays:
   - Name, photo, position, location
   - Years of experience, sales specialization
   - Tools & software proficiency (badges)
   - Solutions sold, departments (tags)
   - Work history (company, role, dates)
   - Bio/summary
   - "Contact via TalentBase" button (opens contact form → admin)
7. Public profile excludes: email, phone, salary expectations
8. Candidate can regenerate token (invalidates old link)
9. Candidate can disable public sharing (returns 404 on token)
10. Public profile is SEO optimized (meta tags, OG tags for LinkedIn preview)

**Technical Notes:**
- Token stored in Candidate model: `share_token` field
- Public route accessible without authentication
- Use design system for consistent styling
- Meta tags include candidate name, position for rich social previews

---

### Story 3.3: Implement CSV Import Tool (Admin - Notion Migration)

**As an** admin
**I want** to bulk import candidates from CSV
**So that** I can migrate existing Notion data quickly

**Prerequisites:**
- Admin authenticated
- Candidate model ready
- Sample CSV from docs/basedados/

**Acceptance Criteria:**
1. Admin page at `/admin/import/candidates`
2. File upload accepts .csv files (max 10MB)
3. After upload, shows column mapping interface:
   - CSV columns listed
   - Dropdown to map to Candidate model fields
   - Auto-detect common field names (e.g., "Name" → name)
4. Preview table shows first 5 rows with mappings
5. Admin clicks "Import" → API `POST /api/admin/candidates/import`
6. Backend processes CSV:
   - Creates Candidate records
   - Links to User (creates basic user if email provided)
   - Handles duplicates (skip or update based on email)
7. Import progress indicator (X of Y candidates processed)
8. Import complete: shows summary
   - Successes: 48 candidates imported
   - Errors: 2 duplicates skipped
9. Download error log CSV (rows that failed with reason)
10. Imported candidates visible in admin candidate list

**Technical Notes:**
- Use pandas for CSV parsing in Django
- Celery async task for large imports
- Validation: required fields, email format, CNPJ format

---

### Story 3.4: Implement Admin Candidate Curation & Editing

**As an** admin
**I want** to edit any candidate profile and set statuses
**So that** I can maintain data quality and mark availability

**Prerequisites:**
- Candidates exist in database
- Admin authenticated

**Acceptance Criteria:**
1. Admin page at `/admin/candidates`
2. Table lists all candidates: name, position, status, ranking score, created_at
3. Filters: position, status (available, inactive, under contract), verified
4. Search by name or email
5. Click candidate row → opens candidate edit form
6. Admin can edit all fields (same as candidate profile form)
7. Admin can set:
   - Status: Available, Inactive, Under Contract
   - Verified: Yes/No (badge on public profile)
   - Category: SDR/BDR Specialist, AE/Closer, CSM Expert
8. API endpoint `PATCH /api/admin/candidates/:id`
9. Changes saved with audit log (admin user, timestamp)
10. Candidate receives email notification if status changes

**Technical Notes:**
- Admin-only permission on edit endpoint
- Audit trail in CandidateAudit model (optional)
- Verified badge shown on public profile

---

### Story 3.5: Implement Candidate Ranking System (Admin)

**As an** admin
**I want** to assign ranking scores to candidates
**So that** I can identify top talent for matching

**Prerequisites:**
- Candidates exist
- Ranking model created

**Acceptance Criteria:**
1. Admin page at `/admin/rankings`
2. List of all candidates with current ranking score (default 0)
3. Admin can assign score 0-100 to each candidate
4. Score categories:
   - Overall Ranking
   - SDR/BDR Specialist Ranking
   - AE/Closer Ranking
   - CSM Ranking
5. Admin can add ranking notes (why this score)
6. Top 10 candidates highlighted (score >= 80)
7. API endpoint `POST /api/admin/rankings` (create/update ranking)
8. Rankings displayed in admin candidate table (sortable column)
9. Ranking score influences future matching suggestions (Epic 5)
10. Ranking history tracked (score changes over time)

**Technical Notes:**
- Ranking model: candidate_id, category, score, notes, created_by (admin)
- Allow multiple rankings per candidate (by category)
- Sort candidates by ranking score

---

### Story 3.6: Implement Candidate Dashboard (View Profile & Browse Jobs)

**As a** candidate
**I want** to view my profile and browse available jobs
**So that** I can track my info and apply to opportunities

**Prerequisites:**
- Candidate profile created
- Jobs exist in database (created in Epic 4, but can show placeholder)

**Acceptance Criteria:**
1. Candidate dashboard at `/candidate`
2. Dashboard sections:
   - Profile completeness widget (% complete, link to edit)
   - Shareable link display with "Copy Link" button
   - Application status summary (Applied: X, Under Review: Y, etc.)
   - Recommended jobs widget (3-5 jobs matching candidate position)
3. "My Profile" link → `/candidate/profile` (view mode)
4. "Edit Profile" button → `/candidate/profile/edit`
5. "Browse Jobs" link → `/candidate/jobs` (job listing page)
6. "My Applications" link → `/candidate/applications`
7. Dashboard loads in under 2 seconds
8. Empty states if no data (e.g., no applications yet)

**Technical Notes:**
- Remix loader fetches candidate data + applications + jobs
- Profile completeness calculated: required fields filled / total fields
- Recommended jobs based on position match (simple filter for MVP)

---

### Story 3.7: Implement Candidate Profile Editing

**As a** candidate
**I want** to edit my profile information
**So that** I can keep it up-to-date

**Prerequisites:**
- Candidate profile exists

**Acceptance Criteria:**
1. Edit profile page at `/candidate/profile/edit`
2. Form pre-populated with current data
3. Same multi-step wizard as creation (or single-page edit)
4. All fields editable (except email → requires verification flow)
5. Photo upload to replace existing
6. API endpoint `PATCH /api/candidates/:id`
7. Changes saved immediately (or "Save Changes" button)
8. Success message: "Profile updated successfully"
9. If shareable link is public, changes reflect immediately on public page
10. Validation same as creation

**Technical Notes:**
- PATCH allows partial updates
- Candidate can only edit own profile (permission check)
- Re-upload photo replaces old one in S3

---

**Epic 3 Total Stories:** 7 stories
**Epic 3 Estimated Duration:** 3 weeks

---

## Epic 4: Company & Job Management

**Timeline:** Weeks 7-10
**Goal:** Enable companies to post jobs and search candidates
**Business Value:** Complete the marketplace - companies can find talent and post opportunities

### Epic 4 Success Criteria
- [ ] Companies can create and manage job postings
- [ ] Shareable public job links work
- [ ] Companies can search candidates with advanced filters
- [ ] Companies can favorite candidates and add notes
- [ ] Job application flow functional (candidates apply, companies review)

---

### Story 4.1: Implement Company Profile Management (Self-Service)

**As a** company user
**I want** to manage my company profile
**So that** candidates and talent can learn about us

**Prerequisites:**
- Company registered and approved by admin

**Acceptance Criteria:**
1. Company dashboard at `/company`
2. "Company Profile" link → `/company/profile`
3. Profile page shows: company name, logo, CNPJ, industry, website, description
4. "Edit Profile" button → `/company/profile/edit`
5. Edit form allows updating: logo (S3 upload), industry, website, description, contact info
6. API endpoint `PATCH /api/companies/:id`
7. Changes saved, success message
8. Company profile visible on public job postings
9. Logo displayed on company dashboard
10. Admin can also edit company profiles via `/admin/companies/:id`

**Technical Notes:**
- Company linked to User (OneToOne)
- Logo stored in S3 (max 1MB, square dimensions recommended)
- Admin edit has full access, company can only edit own profile

---

### Story 4.2: Implement Job Posting Creation (Company + Admin)

**As a** company user
**I want** to create job postings
**So that** candidates can discover and apply to our openings

**Prerequisites:**
- Company profile created
- Job model exists

**Acceptance Criteria:**
1. "Create Job" button on company dashboard → `/company/jobs/new`
2. Job creation form with fields:
   - Title, description (rich text or markdown)
   - Position type: SDR/BDR, AE/Closer, CSM
   - Seniority: Junior, Mid, Senior
   - Employment type: CLT, PJ, Hybrid
   - Salary range (min-max in BRL)
   - Required skills (multi-select from predefined list)
   - Sales cycle, ticket size
   - Location: Remote, Hybrid, On-site + city
3. API endpoint `POST /api/jobs`
4. Job created with status="active", company_id=current user's company
5. Success message: "Job posted! Share your job link."
6. Redirect to `/company/jobs/:id` (job detail view)
7. Admin can create jobs on behalf of companies via `/admin/jobs/new` (select company dropdown)
8. Validation: all required fields, salary min < max

**Technical Notes:**
- Job model linked to Company (ForeignKey)
- Rich text editor for description (Tiptap or simple textarea)
- Predefined skill options seeded in database

---

### Story 4.3: Generate Shareable Public Job Listing

**As a** company user
**I want** to generate a public shareable link for my job posting
**So that** I can share it on LinkedIn, email, etc.

**Prerequisites:**
- Job posting created

**Acceptance Criteria:**
1. "Generate Shareable Link" button on job detail page
2. API endpoint `POST /api/jobs/:id/generate-share-token`
3. Unique token generated (UUID), stored in Job model
4. Public URL: `https://www.salesdog.click/share/job/:token`
5. Public page renders at `/share/job/:token` (no auth required)
6. Public job page displays:
   - Job title, company name, company logo
   - Position type, seniority, employment type
   - Salary range
   - Description (formatted)
   - Required skills (badges)
   - Sales cycle, ticket size
   - Location
   - "Apply Now" button (redirects to `/apply/:token` or login if not authenticated)
7. Public job excludes: internal notes, applicant count
8. Company can regenerate token (invalidates old link)
9. Company can disable sharing (returns 404)
10. SEO optimized (meta tags, OG tags for social sharing)

**Technical Notes:**
- Token stored in Job model: `share_token` field
- Public route accessible without auth
- "Apply Now" requires candidate login → creates Application

---

### Story 4.4: Implement Advanced Candidate Search (Company Dashboard)

**As a** company user
**I want** to search and filter candidates by sales-specific criteria
**So that** I can find qualified talent quickly

**Prerequisites:**
- Candidates exist in database
- Company authenticated

**Acceptance Criteria:**
1. "Search Candidates" page at `/company/candidates`
2. Search bar (free text search by name, bio keywords)
3. Filter panel with:
   - Position: SDR/BDR, AE/Closer, CSM (multi-select)
   - Seniority: Junior, Mid, Senior
   - Experience type: Inbound, Outbound, Inside Sales, Field Sales
   - Software/Tools: multi-select (Salesforce, Hubspot, Apollo, etc.)
   - Solutions sold: multi-select (SaaS, Cybersecurity, HR Tech, etc.)
   - Departments: multi-select (IT, Finance, HR, C-Level, etc.)
   - Ticket size: checkboxes (12-24K, 24-60K, 60-120K, 120K+)
   - Sales cycle: checkboxes (1-3mo, 3-6mo, 6-12mo, 12mo+)
   - Availability: Available, Inactive, Under Contract
   - Location: text input (city)
4. "Apply Filters" button
5. API endpoint `GET /api/candidates?position=AE&tools=Salesforce,Hubspot&status=available`
6. Results displayed as candidate cards:
   - Photo, name, position, location
   - Years of experience, top 3 tools
   - "View Profile" link, "Favorite" button
7. Result count displayed: "12 candidates match your criteria"
8. Pagination (20 candidates per page)
9. Results load in under 1 second
10. Empty state if no matches: "No candidates found, try adjusting filters"

**Technical Notes:**
- Django query with Q objects for complex filters
- Use PostgreSQL array fields for multi-select filtering
- Index on commonly filtered fields (position, status, tools)
- Return only "available" candidates by default (hide "under contract" unless admin)

---

### Story 4.5: Implement Candidate Favorites & Notes (Company)

**As a** company user
**I want** to favorite candidates and add private notes
**So that** I can track promising talent and compare candidates

**Prerequisites:**
- Candidate search working
- Favorite model exists

**Acceptance Criteria:**
1. "Favorite" button (heart icon) on candidate cards in search results
2. Click favorite → API `POST /api/favorites` (candidate_id, company_id)
3. Favorite icon fills (visual feedback)
4. "My Favorites" page at `/company/favorites`
5. Favorites page lists all favorited candidates (same card layout)
6. Each favorite card has "Add Note" button
7. Click "Add Note" → modal opens with textarea
8. API `PATCH /api/favorites/:id` saves note (private, only visible to company)
9. Note displayed on favorite card (collapsed, click to expand)
10. "Remove Favorite" button (unfavorite candidate)
11. Favorite count displayed on company dashboard widget

**Technical Notes:**
- Favorite model: company_id, candidate_id, note (text), created_at
- Unique constraint: (company_id, candidate_id)
- Notes are private per company (Company A's note on Candidate X not visible to Company B)

---

### Story 4.6: Implement Job Application System (Candidate Applies)

**As a** candidate
**I want** to apply to job postings
**So that** I can express interest and be considered for roles

**Prerequisites:**
- Jobs exist
- Candidate authenticated

**Acceptance Criteria:**
1. "Browse Jobs" page at `/candidate/jobs`
2. Job listing displays all active jobs (public or matched to candidate)
3. Job cards show: title, company name, logo, position, seniority, salary, location
4. Click "View Details" → `/candidate/jobs/:id`
5. Job detail page has "Apply" button
6. Click "Apply" → modal opens with optional cover letter textarea
7. API endpoint `POST /api/applications` (job_id, candidate_id, cover_letter)
8. Application created with status="applied"
9. Success message: "Application submitted!"
10. "Apply" button changes to "Applied" (disabled)
11. Candidate can view applications at `/candidate/applications`
12. Company receives notification: "New application for [Job Title]"

**Technical Notes:**
- Application model: job_id, candidate_id, cover_letter, status, created_at
- Prevent duplicate applications (unique constraint)
- Email notification to company on new application

---

### Story 4.7: Implement Application Management (Company Reviews)

**As a** company user
**I want** to review applications to my job postings
**So that** I can move candidates through the hiring pipeline

**Prerequisites:**
- Applications exist

**Acceptance Criteria:**
1. Company dashboard shows "Applications" widget with count
2. "My Jobs" page at `/company/jobs` lists all company's jobs
3. Each job card shows application count: "5 applications"
4. Click job → `/company/jobs/:id`
5. Job detail page shows "Applications" tab
6. Applications table lists: candidate name, photo, position, applied date, status
7. Click candidate → opens candidate profile (full view)
8. Company can update application status:
   - Applied → Under Review → Interview Scheduled → Offer Extended → Hired
   - Or: Rejected (at any stage)
9. API endpoint `PATCH /api/applications/:id` (update status)
10. Status change sends notification to candidate
11. Company can add internal notes to application (not visible to candidate)

**Technical Notes:**
- Application status enum: applied, under_review, interview_scheduled, offer_extended, hired, rejected
- Admin can view all applications system-wide via `/admin/applications`
- Candidate sees status updates on `/candidate/applications`

---

### Story 4.8: Implement Admin Job Management & Oversight

**As an** admin
**I want** to manage all job postings (create, edit, pause, delete)
**So that** I can maintain job quality and help companies

**Prerequisites:**
- Jobs exist

**Acceptance Criteria:**
1. Admin page at `/admin/jobs`
2. Table lists all jobs: title, company, position, status, created_at
3. Filters: status (active, paused, closed), position, company
4. Search by title or company name
5. Admin can:
   - Create job on behalf of company (select company dropdown)
   - Edit any job (same form as company job creation)
   - Pause job (status → paused, not visible to candidates)
   - Close job (status → closed, archived)
   - Delete job (soft delete: is_active=false)
6. API endpoint `PATCH /api/admin/jobs/:id`
7. Job status changes reflected immediately on candidate job browse page
8. Admin can view applications for any job

**Technical Notes:**
- Admin-only permissions on admin endpoints
- Paused jobs not visible in candidate job browse
- Closed jobs archived but data retained

---

**Epic 4 Total Stories:** 8 stories
**Epic 4 Estimated Duration:** 3 weeks

---

## Epic 5: Matching & Analytics

**Timeline:** Weeks 10-12
**Goal:** Streamline admin matching process and provide data-driven insights
**Business Value:** Reduce admin matching time from 2 hours to 30 minutes, capture data for future automated matching

### Epic 5 Success Criteria
- [ ] Admin can use matching dashboard to pair candidates and jobs
- [ ] Match suggestions based on criteria (position, skills, experience)
- [ ] Notifications sent to candidates and companies on match
- [ ] Match outcomes tracked (interview, hired, rejected)
- [ ] Admin analytics dashboard shows platform health metrics

---

### Story 5.1: Implement Admin Matching Dashboard (Manual Matching)

**As an** admin
**I want** a dedicated interface to match candidates to jobs
**So that** I can facilitate placements efficiently

**Prerequisites:**
- Candidates and jobs exist
- Ranking system implemented

**Acceptance Criteria:**
1. Admin page at `/admin/matching`
2. Two-panel layout:
   - Left panel: Job selection (dropdown or searchable list)
   - Right panel: Candidate suggestions (once job selected)
3. Admin selects a job from dropdown
4. System suggests candidates based on:
   - Position match (SDR job → SDR candidates)
   - Seniority match (Senior job → Senior candidates)
   - Required skills match (job requires Salesforce → candidates with Salesforce)
   - Availability (only "available" candidates)
   - Ranking score (higher ranked candidates first)
5. Suggested candidates displayed as cards with match score % (calculated)
6. Admin can:
   - Review candidate profile (click to expand)
   - Click "Match" button to create match
7. API endpoint `POST /api/admin/matches` (job_id, candidate_id)
8. Match created with status="matched"
9. Notifications sent:
   - Candidate: "You've been matched to [Job Title] at [Company]"
   - Company: "We've matched [Candidate Name] to your job [Job Title]"
10. Match appears in admin match tracking list

**Technical Notes:**
- Match model: job_id, candidate_id, created_by (admin), status, outcome
- Match score calculated: position (40%), skills overlap (30%), seniority (20%), ranking (10%)
- Suggestions API: `GET /api/admin/matching/suggestions?job_id=X`

---

### Story 5.2: Implement Match Notifications (Email to Candidate & Company)

**As a** candidate and company
**I want** to receive notifications when admin creates a match
**So that** I can take next steps (candidate: prepare, company: review and contact)

**Prerequisites:**
- Match created via admin dashboard
- Email notification system (Epic 2)

**Acceptance Criteria:**
1. When match created, trigger Celery task `send_match_notification`
2. Email sent to candidate:
   - Subject: "You've been matched to a job opportunity!"
   - Body: Job title, company name, position, salary range
   - CTA: "View Job Details" (link to job page)
   - Next steps: "The company will review your profile and may contact you for an interview"
3. Email sent to company:
   - Subject: "New candidate matched to your job: [Job Title]"
   - Body: Candidate name, position, years of experience, top skills
   - CTA: "View Candidate Profile" (link to candidate profile)
   - Next steps: "Review the candidate and reach out via TalentBase or directly"
4. Match status displayed on:
   - Candidate dashboard: "Matches" widget (count)
   - Company dashboard: "Matches" widget (count)
5. Both parties can view match details on their dashboards

**Technical Notes:**
- Email templates with match details
- Match details page: `/candidate/matches/:id` and `/company/matches/:id`
- Include candidate shareable link in company email

---

### Story 5.3: Implement Match Outcome Tracking (Admin)

**As an** admin
**I want** to track match outcomes (interview, hired, rejected)
**So that** I can measure match quality and optimize future matching

**Prerequisites:**
- Matches created

**Acceptance Criteria:**
1. Admin page at `/admin/matches`
2. Table lists all matches: candidate name, job title, company, match date, status, outcome
3. Match status: matched, contacted, interview_scheduled, hired, rejected
4. Admin can update match outcome:
   - Click match row → opens match detail modal
   - Dropdown to select outcome
   - Date field for outcome (e.g., interview scheduled date, hire date)
   - Notes field (optional: why rejected, feedback)
5. API endpoint `PATCH /api/admin/matches/:id`
6. Outcome change updates match record
7. Metrics calculated:
   - Match → Interview rate
   - Match → Hire rate
   - Average time to hire
8. Filters: outcome (all, hired, rejected, pending), date range

**Technical Notes:**
- Match outcome enum: matched, contacted, interview_scheduled, offer_extended, hired, rejected, declined
- Outcome date stored (e.g., hire_date, rejection_date)
- Analytics aggregate outcomes for dashboard

---

### Story 5.4: Implement Admin Analytics Dashboard

**As an** admin
**I want** to see platform health metrics and insights
**So that** I can understand usage and optimize operations

**Prerequisites:**
- Candidates, companies, jobs, matches exist

**Acceptance Criteria:**
1. Admin dashboard at `/admin` (homepage after admin login)
2. Dashboard widgets:
   - Total candidates (breakdown: available, inactive, under contract)
   - Total companies (breakdown: active, pending approval)
   - Total jobs (breakdown: active, paused, closed)
   - Total matches (this month)
   - Match success rate: (matches → interviews) / total matches * 100%
   - Hire rate: (matches → hired) / total matches * 100%
   - Top 10 ranked candidates (widget with quick links)
   - Recent activity feed (recent registrations, applications, matches)
3. API endpoint `GET /api/admin/analytics` returns aggregated stats
4. Dashboard loads in under 2 seconds
5. Charts (optional): candidate growth over time, match outcomes pie chart
6. Refresh button to reload data

**Technical Notes:**
- Django aggregation queries for counts and rates
- Cache analytics data in Redis (1-hour TTL)
- Use Chart.js or Recharts for visualizations (optional)

---

### Story 5.5: Implement Top 10 Rankings Display (Admin & Public)

**As an** admin
**I want** to see Top 10 candidates by category
**So that** I can quickly identify best talent for matching

**Prerequisites:**
- Ranking system implemented (Epic 3)

**Acceptance Criteria:**
1. Admin page at `/admin/rankings/top10`
2. Tabs for categories:
   - Overall Top 10
   - SDR/BDR Top 10
   - AE/Closer Top 10
   - CSM Top 10
3. Each tab lists top 10 candidates by ranking score (desc)
4. Candidate cards show: photo, name, position, score, verified badge
5. Click candidate → opens candidate profile
6. API endpoint `GET /api/admin/rankings/top10?category=overall`
7. Top 10 widget on admin dashboard homepage
8. (Optional) Public page at `/top-talent` for marketing (if candidates opt-in)

**Technical Notes:**
- Query rankings ordered by score DESC, limit 10
- Category filter on Ranking model
- Only show "verified" candidates in public top 10 (if implemented)

---

### Story 5.6: Implement Candidate Application Tracking (Candidate Dashboard)

**As a** candidate
**I want** to view all my applications and match status
**So that** I can track my job search progress

**Prerequisites:**
- Applications exist
- Matches exist

**Acceptance Criteria:**
1. "My Applications" page at `/candidate/applications`
2. Table lists applications: job title, company, applied date, status
3. Status badge color-coded:
   - Applied (blue)
   - Under Review (yellow)
   - Interview Scheduled (green)
   - Offer Extended (green)
   - Hired (success green)
   - Rejected (red)
4. Click application → view job details + application details (cover letter, status history)
5. "Matches" tab shows admin-created matches
6. Match cards display: job title, company, match date, status
7. Empty state if no applications: "You haven't applied to any jobs yet"
8. Filter by status (all, under review, interview, rejected)

**Technical Notes:**
- API endpoint `GET /api/candidates/me/applications`
- Matches API: `GET /api/candidates/me/matches`
- Status history tracked (optional: ApplicationStatusHistory model)

---

### Story 5.7: Implement Admin Dashboard for Company Management

**As an** admin
**I want** to manage all companies (create, edit, approve, deactivate)
**So that** I can maintain company quality and assist with setup

**Prerequisites:**
- Companies exist

**Acceptance Criteria:**
1. Admin page at `/admin/companies`
2. Table lists all companies: name, CNPJ, status, created_at, job count
3. Filters: status (active, pending, rejected, inactive)
4. Search by name or CNPJ
5. Admin can:
   - Create company manually (form with company fields + user credentials)
   - Edit company profile (any field)
   - Approve/reject pending companies (same as Story 2.5)
   - Deactivate company (status → inactive, can't login or post jobs)
   - View company's jobs (link to filtered job list)
6. API endpoint `POST /api/admin/companies` (create), `PATCH /api/admin/companies/:id` (edit)
7. Bulk actions (optional): approve multiple pending companies
8. Company detail view shows: profile, jobs posted, applications received

**Technical Notes:**
- Admin creates company + user in single transaction
- Deactivated companies retain data but lose access
- Company job count aggregated from Job model

---

**Epic 5 Total Stories:** 7 stories
**Epic 5 Estimated Duration:** 2-3 weeks

---

## Summary

**Total Stories:** 35 stories across 5 epics
**Timeline:** 12 weeks (3 months) MVP
**Delivery:** Phased by epic, each delivering incremental business value

### Next Steps After Epic Breakdown

1. **Architecture & Technical Design:** Run solution architecture workflow to generate detailed tech specs
2. **UX/UI Specification:** Create comprehensive UX spec for all user-facing flows (optional but recommended)
3. **Sprint Planning:** Group stories into 2-week sprints (approximately 6 sprints)
4. **Story Refinement:** Add technical implementation details and edge cases during sprint planning
5. **Testing Strategy:** Define acceptance test criteria and QA approach per epic
6. **Deployment Plan:** Validate AWS infrastructure readiness and CI/CD pipeline per epic release

**See [PRD.md](./PRD.md) for full product requirements and context.**
