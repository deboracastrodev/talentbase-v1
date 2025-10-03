# talentbase Product Requirements Document (PRD)

**Author:** Debora
**Date:** 2025-10-01
**Project Level:** Level 3 (Full Product)
**Project Type:** Web Application (SaaS Platform)
**Target Scale:** 25-35 stories, 4-5 epics, 3-4 months MVP

---

## Description, Context and Goals

**TalentBase** is a specialized recruitment and placement platform designed exclusively for sales professionals in the technology sector. Operating as a headhunter service focused on personal career relocation, TalentBase connects top-tier sales talent (SDR/BDR, Account Executive/Closer, and Customer Success Manager) with technology companies seeking to build high-performing commercial teams.

The platform serves three distinct user groups through dedicated dashboards:
- **Administrators** who manage the entire ecosystem, curate candidate profiles, oversee job postings, create rankings, and facilitate matches between candidates and companies
- **Candidates** (sales professionals) who maintain their professional profiles, showcase their sales expertise, track application status, and receive job recommendations
- **Companies** (employers) who post job openings, search and filter candidates based on specific sales criteria, view detailed candidate profiles, and manage their recruitment pipeline

The system replaces the current Notion-based workflow with a robust, scalable SaaS platform featuring shareable public profiles, advanced search and filtering capabilities, candidate ranking systems, and data-driven matching insights. Built with a modern tech stack (Remix frontend + Django backend + PostgreSQL), TalentBase is designed for rapid MVP deployment while maintaining architectural excellence for future scaling.

**Business Model:** Commission-based headhunter service charging companies for successful candidate placements, with a focus on quality over quantity through curated talent pools and data-driven candidate rankings.

### Deployment Intent

**MVP for Production SaaS Launch**

TalentBase is being built as a production-ready SaaS platform with critical MVP urgency. The immediate goal is to replace the current Notion-based candidate management system with a fully functional web application deployed to AWS (salesdog.click domain).

**Target Timeline:** 3-4 months to MVP launch
**Deployment Strategy:** Phased rollout
- Phase 1: Internal testing with existing candidate database migration from Notion
- Phase 2: Soft launch with select companies (beta testers)
- Phase 3: Full production launch with marketing campaign

**Infrastructure:** AWS (EC2/ECS), PostgreSQL RDS, Redis ElastiCache, S3 for file storage, GitHub Actions CI/CD, salesdog.click DNS already configured.

**Critical Success Factor:** System must be simple, functional, and avoid over-engineering. Matching will be manual (admin-driven) in MVP, with automated matching planned for post-MVP optimization.

### Context

**The Problem:**

Technology companies struggle to find qualified sales professionals who understand complex B2B SaaS sales cycles, have experience with modern sales tools (Salesforce, Hubspot, Apollo.io), and can navigate the unique challenges of selling technical solutions. Traditional recruitment platforms are generalist and lack the specialized filters and context needed for sales roles in tech.

Sales professionals, especially those with niche expertise (enterprise SaaS, cybersecurity solutions, HR tech), find it difficult to showcase their unique value proposition. Generic job boards don't capture critical sales metrics like deal cycle experience (3-6 months vs 6-12 months), average ticket size (ARR), or specific vertical knowledge (selling to IT departments vs Finance departments).

**Current Situation:**

TalentBase currently operates using Notion as a database, manually managing candidate profiles, company records, and job postings. While functional, this approach:
- Lacks scalability for growing candidate pools
- Doesn't provide shareable public profiles (critical for the business model)
- Has no advanced search/filtering capabilities
- Cannot generate candidate rankings or matching insights
- Requires significant manual effort for basic operations
- Doesn't support role-based access for candidates and companies

The business has proven the model and validated demand. Real candidate data exists in CSV format (docs/basedados/) with actual sales professionals ready to migrate to the new platform.

**Why Now:**

The recruitment market for tech sales talent is booming post-2024, with companies increasingly investing in revenue-generating roles. TalentBase has an opportunity to capture market share by being the first specialized platform exclusively for tech sales roles with deep vertical knowledge.

The design system is complete (Storybook deployed), architecture is documented, and infrastructure is ready. All foundational work is done—execution can begin immediately.

**Inspiration & Market Validation:**

The business model is inspired by tryrefer.com, which has successfully demonstrated the viability of specialized recruitment platforms. TalentBase differentiates by focusing exclusively on sales roles in technology, with domain-specific filters and metrics that matter to this niche.

### Goals

**Strategic Product Goals:**

1. **Replace Notion Workflow (Critical - Month 1)**
   - Migrate all existing candidate data from Notion CSV exports to PostgreSQL
   - Enable system-based candidate registration (eliminate manual Notion entry)
   - Maintain feature parity with current Notion-based profile sharing
   - Success Metric: 100% of candidate operations moved to TalentBase, zero Notion dependencies

2. **Enable Multi-Role Access (Critical - Month 1-2)**
   - Provide dedicated dashboards for Admin, Candidate, and Company roles
   - Implement secure authentication with role-based permissions
   - Create shareable public links for candidate profiles and job postings
   - Success Metric: All three user types can independently access their respective areas

3. **Advanced Candidate Search & Discovery (High Priority - Month 2-3)**
   - Build comprehensive search with sales-specific filters (position, experience type, software skills, ticket size, cycle length)
   - Implement candidate ranking system (manual curation in MVP)
   - Enable company users to search, filter, and favorite candidates
   - Success Metric: Companies can find 5+ relevant candidates in under 2 minutes

4. **Streamlined Job Management (High Priority - Month 2-3)**
   - Allow companies to create, edit, and manage job postings
   - Generate shareable public job links with detailed descriptions
   - Track candidate applications and status
   - Success Metric: Companies post 10+ jobs within first month of launch

5. **Data-Driven Insights Foundation (Medium Priority - Month 3-4)**
   - Capture candidate status (available, inactive, under contract)
   - Build candidate ranking infrastructure for future automation
   - Provide admin analytics on candidate-job match quality
   - Success Metric: Rankings capture enough data to inform manual matching decisions, 80%+ match success rate

**Business Goals:**

- **Revenue:** Enable 5-10 successful placements in first 3 months post-launch
- **User Acquisition:** Onboard 50+ candidates and 10+ companies in beta phase
- **Operational Efficiency:** Reduce admin time per placement by 70% vs. Notion workflow
- **Market Position:** Establish TalentBase as the go-to platform for tech sales recruitment in Brazil

## Requirements

### Functional Requirements

#### FR1: Public Landing Page & Marketing Site
The system shall provide a public-facing website with:
- Homepage showcasing value proposition for candidates and companies
- "How it works" section explaining the headhunter process
- About page with company mission and differentiation
- Contact form for inquiries
- Responsive design matching the approved design system

#### FR2: Multi-Role Authentication System
The system shall implement secure authentication with three distinct user roles:
- **Admin Role:** Full system access, user management, candidate curation, job approval, matching
- **Candidate Role:** Profile management, job browsing, application tracking
- **Company Role:** Job posting, candidate search, favorites management
- Token-based authentication (Django REST Framework)
- Email/password login
- Company registration requires admin approval before access is granted

#### FR3: Candidate Profile Management
The system shall allow candidates to create and maintain comprehensive sales profiles including:
- **Basic Info:** Name, email, phone, location, profile photo
- **Video Introduction:** YouTube video URL (candidate records and uploads to their own YouTube channel, provides link)
- **Position:** SDR/BDR, Account Executive/Closer, Customer Success Manager
- **Sales Experience:** Years in sales, specialization (Inbound/Outbound, Inside/Field)
- **Sales Cycle Experience:** Short (1-3 months), Medium (3-6 months), Long (6-12+ months)
- **Ticket Size Experience:** 12-24K ARR, 24-60K ARR, 60-120K ARR, 60-120K+ ARR
- **Software/Tools Proficiency:** Salesforce, Hubspot, Pipedrive, Apollo.io, Lusha, Outreach, RD Station, etc.
- **Solutions Sold:** SaaS (ATS, ERP, CRM), Cybersecurity, HR Tech, Background Check, etc.
- **Departments Sold To:** IT, Finance, HR, Marketing, Operations, C-Level
- **Work History:** Company name, role, duration, achievements
- **Desired Salary Range**
- **Availability Status:** Available, Inactive, Under Contract
- **Bio/Summary:** Free text for personal pitch

#### FR4: Shareable Candidate Profiles
The system shall generate public shareable links for candidate profiles:
- Unique token-based URL (e.g., `/share/candidate/:token`)
- Public view without authentication required
- Display all candidate information (excluding sensitive contact details in public view)
- **Embedded YouTube video player** (if candidate provided video URL)
- Professional layout matching design system (reference: docs/layouts/perfil-candidato-referencia)
- Option for candidates to enable/disable public sharing
- Admin can generate shareable links for any candidate

#### FR5: Admin Candidate Management
Admins shall be able to:
- **Create candidate profiles directly** (manual entry by admin in addition to candidate self-registration)
- View all candidates in the system with advanced filtering
- Edit any candidate profile (data correction, profile enhancement)
- Set candidate status (available, inactive, under contract)
- Create and manage candidate rankings (manual scoring 0-100)
- Mark candidates as "verified" after vetting process
- Categorize candidates (Frontend Sales, Backend Sales, CSM, SDR/BDR specialist)
- Bulk import candidates from CSV (Notion migration)
- Delete or archive candidates

#### FR6: Company Profile Management
The system shall allow companies to manage their profiles including:
- Company name, CNPJ (Brazilian tax ID), logo
- Industry, company size, website
- Primary contact information
- Company description/about
- **Admin can create company profiles directly** (in addition to company self-registration)
- Self-registration requires admin approval
- Companies can update their own profiles
- Admin can edit any company profile

#### FR7: Job Posting Management
Companies shall be able to create and manage job postings:
- **Job Details:** Title, description, requirements
- **Position Type:** SDR/BDR, AE/Closer, CSM
- **Seniority Level:** Junior, Mid-level, Senior
- **Employment Type:** CLT (Brazilian employment contract), PJ (contractor), Hybrid
- **Salary Range**
- **Required Skills:** Multi-select from predefined list (CRM tools, sales methodologies)
- **Sales Cycle:** Expected deal cycle length
- **Ticket Size:** Expected ARR/deal size
- **Location:** Remote, Hybrid, On-site with city
- **Status:** Active, Paused, Closed
- **Admin can create job postings on behalf of companies** (in addition to company self-posting)
- Admins can approve/edit/delete all jobs
- Companies can only edit their own jobs

#### FR8: Shareable Job Listings
The system shall generate public shareable links for job postings:
- Unique token-based URL (e.g., `/share/job/:token`)
- Public view without authentication
- Display full job description, requirements, company info
- "Apply" button redirects to application flow
- Professional layout matching design system

#### FR9: Advanced Candidate Search & Filtering (Company Dashboard)
Companies shall be able to search and filter candidates by:
- Position (SDR/BDR, AE, CSM)
- Seniority level
- Sales experience type (Inbound, Outbound, Inside, Field)
- Software/tool proficiency (multi-select)
- Solutions sold (multi-select)
- Departments sold to (multi-select)
- Ticket size experience
- Sales cycle experience
- Availability status
- Location
- Search returns candidate cards with summary info
- Click on card opens detailed profile view

#### FR10: Candidate Favorites (Company Dashboard)
Companies shall be able to:
- Favorite/bookmark candidates from search results or profile views
- View all favorited candidates in a dedicated "Favorites" page
- Remove candidates from favorites
- Add notes to favorited candidates (private notes visible only to that company)

#### FR11: Job Application System
The system shall support candidate applications:
- Candidates can browse available jobs (filtered by position type, location, etc.)
- Candidates can apply to jobs with optional cover letter
- Application status tracking: Applied, Under Review, Interview Scheduled, Rejected, Offer Extended
- Companies can view all applications for their jobs
- Admins can view all applications system-wide

#### FR12: Admin Matching Dashboard (Manual Matching - MVP)
Admins shall have a matching interface to:
- Select a job posting
- View candidate suggestions based on basic criteria match (position, seniority, skills)
- Manually review candidate profiles
- Mark candidate-job pairs as "matched"
- Notify both company and candidate of the match
- Track match outcomes (interview scheduled, hired, rejected)

#### FR13: Candidate Ranking System
The system shall support manual candidate rankings:
- Admin can assign ranking score (0-100) to each candidate
- Ranking categories: Overall, SDR/BDR Specialist, AE/Closer Specialist, CSM Specialist
- Rankings displayed in admin dashboard
- Top 10 candidates visible in dedicated rankings view
- Rankings inform manual matching decisions
- Future: Rankings will feed automated matching algorithm (out of scope for MVP)

#### FR14: Dashboard Analytics (Admin)
Admin dashboard shall display:
- Total candidates (by status: available, inactive, under contract)
- Total companies (active, pending approval)
- Total jobs (active, paused, closed)
- Recent applications
- Match success rate (matches → interviews → hires)
- Top ranked candidates widget

#### FR15: Notification System (Basic Email)
The system shall send email notifications for:
- Candidate registration confirmation
- Company registration (pending approval)
- Company approval confirmation
- New job application (to company)
- Match notification (to candidate and company)
- Job status changes
- Profile updates requiring admin review

#### FR16: CSV Data Migration Tool (Admin)
The system shall provide a CSV import tool for admins to:
- Upload candidate CSV files (from Notion export)
- Map CSV columns to database fields
- Preview import before committing
- Bulk create candidate profiles
- Handle duplicates (skip or update)
- Import log with success/error reporting

### Non-Functional Requirements

#### NFR1: Performance
- **Page Load Time:** All pages must load within 2 seconds on 4G connection
- **Search Response Time:** Candidate search results must return within 1 second for queries with up to 5 filters
- **API Response Time:** REST API endpoints must respond within 500ms for 95% of requests
- **Concurrent Users:** System must support 100 concurrent users without performance degradation
- **Database Queries:** Complex queries (candidate search with multiple filters) must execute in under 300ms

#### NFR2: Scalability
- **User Growth:** Architecture must support scaling to 1,000+ candidates and 100+ companies without major refactoring
- **Database Design:** PostgreSQL schema must be normalized and optimized for growth
- **Horizontal Scaling:** Backend (Django) must be stateless to enable horizontal scaling via AWS ECS
- **Caching:** Redis caching must be implemented for frequently accessed data (candidate lists, job listings)
- **File Storage:** AWS S3 for profile photos and company logos to avoid local storage limits

#### NFR3: Security
- **Authentication:** Token-based authentication with secure token storage (httpOnly cookies on frontend)
- **Authorization:** Role-based access control (RBAC) enforced at API layer
- **Data Encryption:** Sensitive data (CPF/tax IDs) must be encrypted at rest
- **HTTPS Only:** All communication must use HTTPS/TLS
- **SQL Injection Protection:** Django ORM must be used for all database queries (no raw SQL without sanitization)
- **LGPD Compliance:** System must comply with Brazilian data protection law (LGPD)
  - User consent for data collection
  - Right to data deletion
  - Data access transparency
- **Password Security:** Passwords must be hashed using Django's default PBKDF2 algorithm

#### NFR4: Reliability & Availability
- **Uptime:** 99.5% uptime SLA (allows ~3.6 hours downtime per month)
- **Error Handling:** All API errors must return appropriate HTTP status codes and user-friendly messages
- **Database Backups:** Daily automated PostgreSQL backups with 30-day retention
- **Graceful Degradation:** If Redis cache fails, system must fall back to database queries
- **Health Checks:** API health endpoint (`/api/health`) for monitoring and load balancer checks

#### NFR5: Usability
- **Responsive Design:** All pages must be fully responsive (mobile, tablet, desktop)
- **Browser Support:** Support latest 2 versions of Chrome, Firefox, Safari, Edge
- **Accessibility:** WCAG 2.1 Level AA compliance for public-facing pages
- **Form Validation:** Real-time client-side validation with clear error messages
- **Loading States:** Visual feedback (spinners, skeleton screens) during data fetching
- **Empty States:** User-friendly empty states when no data exists

#### NFR6: Maintainability
- **Code Standards:** Follow PEP 8 (Python) and Airbnb style guide (JavaScript/React)
- **Documentation:** All API endpoints documented (OpenAPI/Swagger)
- **Component Library:** All UI components must use the @talentbase/design-system package
- **Type Safety:** TypeScript for frontend code
- **Testing:** Minimum 70% code coverage for backend API
- **Version Control:** Git with feature branch workflow
- **Code Reviews:** All PRs require review before merge

#### NFR7: Deployment & DevOps
- **CI/CD:** GitHub Actions pipeline for automated testing and deployment
- **Environment Parity:** Development, staging, and production environments with consistent configuration
- **Infrastructure as Code:** Docker Compose for local development, AWS ECS for production
- **Monitoring:** Application logging (CloudWatch or similar)
- **Rollback Capability:** Ability to rollback to previous deployment within 15 minutes
- **Database Migrations:** Django migrations for all schema changes with rollback support

#### NFR8: Data Integrity
- **Data Validation:** All user inputs validated on both client and server
- **Referential Integrity:** Foreign key constraints enforced at database level
- **Audit Trail:** Track creation and modification timestamps for all entities
- **Soft Deletes:** Critical data (candidates, companies, jobs) should use soft delete (is_active flag) rather than hard delete

#### NFR9: Internationalization (Future-Ready)
- **Language Support:** UI text must be externalized (i18n-ready) for future Portuguese/English support
- **Currency:** Support BRL (Brazilian Real) for salary ranges
- **Date/Time:** Use ISO 8601 format, display localized to Brazil (PT-BR)

#### NFR10: SEO (Public Pages)
- **Meta Tags:** All public pages (landing, shareable profiles, jobs) must have proper meta tags
- **Semantic HTML:** Use semantic HTML5 elements
- **Open Graph:** OG tags for social media sharing
- **Sitemap:** Auto-generated sitemap.xml for search engines
- **Page Speed:** Lighthouse score of 85+ for public pages

## User Journeys

### Journey 1: Candidate Registration & Profile Creation

**Persona:** João Silva, 28, Account Executive with 4 years of SaaS sales experience

**Goal:** Create a professional profile on TalentBase to be discovered by tech companies

**Journey Steps:**

1. **Discovery:** João finds TalentBase through LinkedIn or Google search for "tech sales jobs Brazil"
2. **Landing Page:** Arrives at homepage, reads value proposition, clicks "Register as Candidate"
3. **Registration:** Fills basic form (name, email, password, phone) → Receives confirmation email
4. **Profile Onboarding:** Redirected to dashboard with incomplete profile badge
5. **Basic Info:** Adds profile photo, location, LinkedIn URL
6. **Position Selection:** Selects "Account Executive / Closer" as primary position
7. **Sales Experience:**
   - Fills 4 years total sales experience
   - Checks "Outbound" and "Inside Sales"
   - Selects sales cycle experience: "3-6 months" and "6-12 months"
   - Selects ticket size: "60-120K ARR" and "120K+ ARR"
8. **Tools & Software:** Multi-selects Salesforce, Hubspot, Apollo.io, Outreach
9. **Solutions Sold:** Selects "SaaS - CRM", "SaaS - ATS", "HR Tech"
10. **Departments:** Selects "IT", "HR", "C-Level"
11. **Work History:** Adds 2 previous companies with roles, dates, achievements
12. **Salary & Availability:** Sets desired salary range (R$8K-12K), status "Available"
13. **Bio:** Writes 2-paragraph summary highlighting enterprise sales expertise
14. **Preview:** Reviews complete profile, clicks "Publish Profile"
15. **Shareable Link:** System generates `/share/candidate/:token`, João copies link to share on LinkedIn
16. **Browse Jobs:** Explores available AE positions, applies to 3 jobs with cover letters
17. **Dashboard:** Monitors application status, receives match notification from admin

**Success Criteria:**
- Complete profile in under 15 minutes
- Shareable link generates immediately
- Profile visible to companies in search within 5 minutes

---

### Journey 2: Company Searching for Sales Talent

**Persona:** Maria Santos, Hiring Manager at a SaaS startup, needs a Senior SDR

**Goal:** Find and favorite qualified SDR candidates with SaaS experience

**Journey Steps:**

1. **Registration:** Maria's company registers on TalentBase, admin approves within 24 hours
2. **Login:** Maria logs in, sees company dashboard
3. **Create Job (Optional First):** Posts "Senior SDR - Outbound SaaS" position
   - Fills job details: title, description, requirements
   - Selects position "SDR/BDR", seniority "Senior", salary "R$4K-6K + commission"
   - Sets required skills: Apollo.io, Lusha, LinkedIn Sales Navigator
   - Status "Active" → Job published with shareable link
4. **Candidate Search:** Navigates to "Search Candidates" page
5. **Apply Filters:**
   - Position: "SDR/BDR"
   - Seniority: "Senior" (3+ years experience)
   - Experience Type: "Outbound"
   - Software: Apollo.io, Lusha
   - Solutions Sold: "SaaS"
   - Availability: "Available"
6. **Results:** 12 candidates match criteria, displayed as cards with summary info
7. **Review Profiles:** Clicks on 5 candidate cards to view full profiles
   - Reads work history, achievements, bio
   - Checks sales cycle and ticket size compatibility
8. **Favorite Candidates:** Favorites 3 top candidates, adds private notes to each
9. **Contact Admin:** Sends message to admin requesting introduction to favorited candidates
10. **Admin Match:** Admin reviews, confirms match, sends notifications to candidates and company
11. **Interview Process:** Maria receives candidate contact info, schedules interviews
12. **Application Tracking:** Tracks applications in company dashboard, updates status to "Interview Scheduled"

**Success Criteria:**
- Find 5+ relevant candidates in under 5 minutes
- Filtering reduces 100+ candidates to 10-15 matches
- Favorite/notes functionality helps compare candidates

---

### Journey 3: Admin Managing Platform & Facilitating Matches

**Persona:** Débora, TalentBase Admin, curating platform quality and making matches

**Goal:** Migrate Notion data, curate candidate rankings, and facilitate company-candidate matches

**Journey Steps:**

1. **CSV Import:** Logs into admin dashboard
2. **Data Migration:**
   - Navigates to "Import Candidates" tool
   - Uploads CSV export from Notion (50 candidates)
   - Maps CSV columns to database fields
   - Previews data, confirms import
   - Reviews import log (48 success, 2 errors - duplicates)
3. **Candidate Curation:**
   - Reviews newly imported profiles for completeness
   - Edits 5 profiles with missing data or formatting issues
   - Sets candidate statuses (30 "Available", 15 "Under Contract", 5 "Inactive")
4. **Ranking Creation:**
   - Opens "Rankings" page
   - Reviews candidate profiles and assigns scores (0-100)
   - Creates category rankings: "SDR/BDR Specialists", "AE/Closers", "CSM Experts"
   - Top 10 candidates highlighted on dashboard
5. **Company Management:**
   - Reviews 3 pending company registrations
   - Verifies company legitimacy (CNPJ, website)
   - Approves 2 companies, rejects 1 (suspicious)
6. **Job Oversight:**
   - Reviews all active job postings (15 jobs)
   - Edits 2 job descriptions for clarity
   - Pauses 1 job (company request)
7. **Matching Process:**
   - Opens "Matching Dashboard"
   - Selects job: "Senior CSM - HR Tech SaaS"
   - System suggests 8 candidates based on position, skills, experience
   - Reviews each candidate profile against job requirements
   - Selects 3 best matches manually
   - Marks matches as "Matched", system sends notifications
8. **Match Tracking:**
   - Monitors match outcomes in analytics dashboard
   - 2 matches → interviews scheduled
   - 1 match → candidate declined (salary mismatch)
   - Updates match statuses
9. **Analytics Review:**
   - Views dashboard: 52 total candidates, 18 companies, 20 active jobs
   - Match success rate: 75% (matches → interviews)
   - Identifies trends: High demand for SDRs with Apollo.io experience

**Success Criteria:**
- CSV import completes in under 10 minutes for 50 candidates
- Ranking system allows easy top-10 identification
- Matching dashboard reduces match time from 2 hours (Notion) to 30 minutes
- Analytics provide insights to improve match quality

## UX Design Principles

### 1. Sales-First Information Architecture
All candidate and job data structures must prioritize sales-specific attributes (position, cycle length, ticket size, tools) over generic job board fields. Information hierarchy should reflect what sales hiring managers actually care about.

### 2. Speed & Efficiency Over Feature Richness
The platform must optimize for speed of core workflows: candidate search (under 5 minutes to find matches), profile creation (under 15 minutes), and admin matching (30 minutes vs 2 hours in Notion). Remove unnecessary steps and clicks.

### 3. Progressive Disclosure
Complex forms (candidate profiles, job postings) should use multi-step wizards or progressive sections to avoid overwhelming users. Show advanced filters only when needed. Guide users through completion with clear progress indicators.

### 4. Trust Through Transparency
Shareable public profiles must look professional and complete to build trust with companies. Include verification badges, profile completeness indicators, and clear data sourcing. No "empty state" sections on public profiles.

### 5. Data-Driven Filtering UX
Search and filter interfaces must make complex multi-select criteria (software, solutions, departments) intuitive through:
- Clear categorization and grouping
- Search within filter options
- Selected filter chips with easy removal
- Real-time result count updates

### 6. Mobile-Responsive But Desktop-Optimized
While all pages must be mobile-responsive, recognize that primary users (admins, hiring managers) will use desktop for candidate review and matching. Optimize for large screens with multi-column layouts and data-dense tables where appropriate.

### 7. Familiar Patterns from Design System
Leverage the existing @talentbase/design-system components consistently across all pages. Users should feel a cohesive experience whether on landing page, dashboard, or shareable profile. No custom one-off UI patterns.

### 8. Status & Feedback Clarity
All actions must provide immediate visual feedback:
- Loading states during data fetches
- Success confirmations after saves
- Clear error messages with recovery actions
- Status badges (Available, Under Contract, Active Job, Pending Approval)

### 9. Admin Power-User Workflows
Admin interface should prioritize bulk operations (CSV import, multi-edit), keyboard shortcuts, and table-based views for efficiency. Admin is a power user managing 100+ candidates—design for speed.

### 10. Candidate & Company Self-Service
While admin can create everything, candidates and companies should have intuitive self-service flows that require minimal training. Onboarding tooltips and empty states should guide new users without admin intervention.

## Epics

The TalentBase MVP is structured into **5 major epics** that deliver the platform in phased increments, each providing tangible business value.

### Epic 1: Foundation & Public Presence (Weeks 1-2)
**Goal:** Establish brand presence and core infrastructure

**Key Capabilities:**
- Public landing page with value proposition for candidates and companies
- Design system integration (@talentbase/design-system)
- Database schema implementation (PostgreSQL)
- Basic infrastructure setup (Django backend, Remix frontend)
- AWS deployment pipeline (GitHub Actions CI/CD)

**Business Value:** Professional public face for TalentBase, technical foundation for all future features

**Estimated Stories:** 5-7 stories

---

### Epic 2: Authentication & User Management (Weeks 2-4)
**Goal:** Enable secure multi-role access for Admin, Candidates, and Companies

**Key Capabilities:**
- User registration flows (candidate, company, admin-created users)
- Token-based authentication (Django REST Framework)
- Role-based access control (RBAC)
- Company approval workflow (admin approves new companies)
- Email notifications (registration, approval)
- Admin user management dashboard

**Business Value:** Secure platform access, admin controls quality by approving companies

**Estimated Stories:** 6-8 stories

---

### Epic 3: Candidate Management System (Weeks 4-7)
**Goal:** Replace Notion with comprehensive candidate profile management

**Key Capabilities:**
- Candidate profile creation (self-registration + admin-created)
- Sales-specific profile fields (position, cycle, ticket size, tools, solutions, departments)
- Shareable public candidate profiles (`/share/candidate/:token`)
- CSV import tool for Notion data migration
- Admin candidate curation (edit, status management, verification)
- Candidate ranking system (manual 0-100 scoring)
- Candidate dashboard (view profile, browse jobs, track applications)

**Business Value:** Core value proposition delivered - migrate from Notion, enable candidate discovery

**Estimated Stories:** 8-10 stories

---

### Epic 4: Company & Job Management (Weeks 7-10)
**Goal:** Enable companies to post jobs and search candidates

**Key Capabilities:**
- Company profile management (self-service + admin-created)
- Job posting creation and management (companies + admin on behalf of)
- Shareable public job listings (`/share/job/:token`)
- Advanced candidate search with sales-specific filters
- Candidate favorites with private notes
- Job application system
- Company dashboard (post jobs, search candidates, manage applications)

**Business Value:** Complete the marketplace - companies can find talent and post opportunities

**Estimated Stories:** 7-9 stories

---

### Epic 5: Matching & Analytics (Weeks 10-12)
**Goal:** Streamline admin matching process and provide data-driven insights

**Key Capabilities:**
- Admin matching dashboard (manual candidate-job matching)
- Match suggestion engine (basic criteria matching)
- Match notifications (email to candidate + company)
- Match outcome tracking (interview, hired, rejected)
- Admin analytics dashboard (candidates, companies, jobs, match success rate)
- Top 10 candidate rankings display
- Application status tracking workflow

**Business Value:** Reduce admin matching time from 2 hours to 30 minutes, data to optimize future automated matching

**Estimated Stories:** 6-8 stories

---

**Total Estimated Stories:** 32-42 stories across 5 epics

**Note:** Detailed story breakdown with acceptance criteria available in [epics.md](./epics.md)

## Out of Scope

The following features are **intentionally excluded from MVP** to maintain focus on core value delivery and avoid over-engineering. These are preserved for future phases post-MVP launch.

### Phase 2: Automation & Intelligence (Post-MVP)

**Automated Matching Algorithm (AI-Powered)**
- AI-powered candidate-job matching based on historical success data
- Machine learning model trained on match outcomes (hire rate, interview conversion)
- Automatic match suggestions sent to companies without admin intervention
- Semantic matching (understand candidate experience narratives vs rigid filters)
- Rationale: MVP uses manual admin matching to validate criteria and gather training data for future AI model

**Advanced Analytics & Reporting**
- Detailed analytics dashboards for companies (application conversion rates, time-to-hire)
- Candidate analytics (profile view count, application success rate)
- Market insights (salary trends, in-demand skills, position demand)
- Export reports to PDF/Excel
- Rationale: Focus on operational analytics first; business intelligence comes after usage data accumulates

**AI-Powered Video Interviews & Assessments**
- Video pitch recording (candidates record 2-3 minute sales pitch)
- AI-powered video interview analysis (communication skills, confidence, articulation)
- Automated interview via AI (chatbot asks sales scenario questions, analyzes responses)
- Video introductions on candidate profiles
- Speech analysis: tonality, pacing, filler words
- Rationale: Trust currently built through admin verification and company vetting; AI video analysis requires significant ML infrastructure and training data

**Candidate Skills Assessment & Verification**
- Online sales skills tests (cold calling simulation, objection handling)
- Integration with third-party assessment tools (Criteria Corp, Predictive Index)
- Verified certifications and badges (Salesforce certified, Hubspot certified)
- Rationale: Manual vetting sufficient for MVP; formal assessments add complexity and cost

### Phase 3: Platform Expansion

**Multi-Language Support (English)**
- Full internationalization (i18n) for English-speaking markets
- Localized content, currency conversion (USD, EUR)
- Expand beyond Brazil to LATAM, USA markets
- Rationale: MVP focuses on Brazilian market; i18n infrastructure is ready but content not translated

**WhatsApp Integration for Candidate Onboarding**
- Candidates register and create profiles via WhatsApp chatbot
- Conversational profile creation (bot asks questions, candidate responds)
- WhatsApp Business API integration
- Auto-import candidate data from WhatsApp to TalentBase
- Notifications sent via WhatsApp (matches, applications)
- Admin can manage candidates via WhatsApp admin panel
- Rationale: Web-based registration sufficient for MVP; WhatsApp integration requires API costs and conversational AI development. Will be implemented post-MVP to reduce friction for candidate acquisition in Brazil (where WhatsApp is dominant).

**Mobile Native Apps**
- iOS and Android native applications
- Push notifications for matches, applications, messages
- Mobile-optimized candidate profile creation
- Rationale: Responsive web app sufficient for MVP; native apps require significant investment

**Candidate Messaging System**
- In-platform messaging between candidates and companies
- Admin can facilitate introductions via messaging
- Message templates for common scenarios
- Rationale: Email notifications sufficient for MVP; messaging adds moderation complexity

**Referral & Incentive Program**
- Candidates refer other candidates (referral bonus)
- Companies refer other companies (discount on placements)
- Affiliate program for recruitment influencers
- Rationale: Growth mechanism for later stage; MVP focuses on organic growth

### Phase 4: Advanced Features

**Video Interviews & Scheduling**
- Integrated video interview scheduling (Calendly-like)
- Embedded video conferencing (Zoom/Google Meet integration)
- Interview feedback and scorecards
- Rationale: Companies use existing tools (Zoom, Teams); integration is nice-to-have

**Salary Benchmarking Tool**
- Real-time salary data for sales positions by region, seniority, company size
- Salary negotiation guidance for candidates
- Market rate recommendations for companies
- Rationale: Static salary ranges sufficient for MVP; benchmarking requires large dataset

**Company Reviews & Ratings**
- Candidates rate companies post-interview (Glassdoor-like)
- Public company ratings visible to candidates
- Admin moderation of reviews
- Rationale: Adds complexity and potential legal issues; focus on placement quality first

**Automated Candidate Sourcing**
- Scrape LinkedIn for passive candidates matching criteria
- Auto-invite candidates to join TalentBase
- Chrome extension for recruiters to import LinkedIn profiles
- Rationale: Manual candidate acquisition via admin and self-registration sufficient for MVP; auto-sourcing raises compliance concerns

**Advanced Search Filters**
- Geolocation-based radius search (candidates within 50km)
- Availability date filtering (available in 30 days, 60 days)
- Language proficiency (English fluency for global SaaS roles)
- Salary expectation range filtering
- Rationale: Core filters cover 90% of use cases; advanced filters add UI complexity

### Technical Debt & Optimizations (Deferred)

**GraphQL API**
- Migrate from REST to GraphQL for flexible querying
- Reduce over-fetching and under-fetching
- Rationale: REST API simpler for MVP; GraphQL benefits emerge at scale

**Advanced Caching Strategy**
- Multi-tier caching (Redis + CDN)
- Cache invalidation strategies
- Real-time cache updates via WebSockets
- Rationale: Basic Redis caching sufficient for MVP load; optimize when performance issues arise

**Microservices Architecture**
- Split monolith into domain-driven microservices
- Separate services for candidates, jobs, matching, analytics
- Rationale: Monolith faster to develop and deploy for MVP; microservices add operational overhead

**Comprehensive Test Suite**
- End-to-end tests (Cypress/Playwright)
- Load testing (simulate 1000+ concurrent users)
- Penetration testing and security audit
- Rationale: Core unit and integration tests cover MVP; comprehensive testing post-launch

---

**Key Philosophy:** MVP delivers core value (replace Notion, enable candidate discovery, facilitate placements) with minimal complexity. Post-MVP phases add automation, intelligence, and scale features based on user feedback and usage data.

---

## Next Steps

Now that the PRD and Epic Breakdown are complete, the following workflows and activities should be executed to move toward implementation.

### Immediate Next Steps (This Week)

**1. Stakeholder Review & Approval**
- Review this PRD with all stakeholders (business owner, technical leads)
- Validate goals, scope, and timeline align with business objectives
- Approve epic prioritization and phasing
- Sign off on MVP scope and out-of-scope items

**2. Solution Architecture Workflow** ⚠️ **CRITICAL - REQUIRED BEFORE DEVELOPMENT**
- **Action:** Run the solution architecture workflow
- **Command:** Launch architect agent or run `bmad/bmm/workflows/3-solutioning/workflow.yaml`
- **Input Documents:**
  - This PRD ([docs/PRD.md](./PRD.md))
  - Epic Breakdown ([docs/epics.md](./epics.md))
  - Existing Architecture Docs ([docs/arquitetura/](./arquitetura/))
- **Expected Outputs:**
  - Detailed solution architecture document
  - Component diagrams and system design
  - API design specifications (REST endpoints)
  - Database optimization and indexing strategy
  - Deployment architecture (AWS infrastructure)
  - Technical specification for each epic
  - Integration points and external dependencies

**Why Critical:** Level 3 projects require architectural planning before story implementation. Architecture will inform technical decisions, identify risks, and create implementation blueprints for development team.

---

### Phase 1: Architecture & Design (Week 1-2)

**3. UX/UI Specification Workflow** (Highly Recommended)
- **Action:** Create comprehensive UX specification
- **Command:** Run UX specification workflow or continue with plan-project workflow
- **Input Documents:**
  - PRD, epics, architecture (once complete)
  - Design system ([packages/design-system/](../packages/design-system/))
  - Layout references ([docs/layouts/](./layouts/), [docs/site/](./site/))
- **Expected Outputs:**
  - Information architecture (sitemap, navigation)
  - User flow diagrams for all 3 personas (admin, candidate, company)
  - Wireframes for key pages (dashboards, profile forms, search)
  - Component inventory mapped to design system
  - Interaction patterns and micro-interactions
  - Responsive breakpoints and mobile considerations

**4. Database Schema Validation**
- Review existing schema ([docs/arquitetura/database-schema.md](./arquitetura/database-schema.md))
- Validate against PRD requirements (all FR fields covered)
- Add missing fields: video_url (Candidate), share_token (Candidate, Job)
- Confirm indexes on frequently queried fields (position, status, skills)
- Review soft delete strategy (is_active boolean)

**5. API Endpoint Specification**
- Review existing API docs ([docs/arquitetura/api-endpoints.md](./arquitetura/api-endpoints.md))
- Validate all FR requirements have corresponding endpoints
- Define request/response schemas (JSON)
- Document authentication and permission requirements per endpoint
- Plan pagination, filtering, sorting strategies

---

### Phase 2: Development Preparation (Week 2-3)

**6. Sprint Planning**
- Break 5 epics into 6 sprints (2 weeks each)
- Suggested sprint breakdown:
  - **Sprint 1:** Epic 1 - Foundation (stories 1.1-1.6)
  - **Sprint 2:** Epic 2 - Auth & Users (stories 2.1-2.7)
  - **Sprint 3:** Epic 3 Part 1 - Candidate Profiles (stories 3.1-3.4)
  - **Sprint 4:** Epic 3 Part 2 + Epic 4 Part 1 (stories 3.5-3.7, 4.1-4.2)
  - **Sprint 5:** Epic 4 Part 2 - Jobs & Search (stories 4.3-4.8)
  - **Sprint 6:** Epic 5 - Matching & Analytics (stories 5.1-5.7)

**7. Story Refinement Sessions**
- For each sprint, conduct refinement sessions:
  - Review story acceptance criteria with developers
  - Add technical implementation notes (libraries, patterns)
  - Identify edge cases and error scenarios
  - Estimate story points (Fibonacci scale)
  - Identify dependencies between stories

**8. Development Environment Setup**
- Provision AWS accounts (dev, staging, prod)
- Configure GitHub repository access for all developers
- Set up local development environment (monorepo, Docker Compose)
- Configure CI/CD pipeline (GitHub Actions)
- Provision external services: SendGrid (email), AWS S3 (file storage)

---

### Phase 3: Implementation (Week 3-15)

**9. Sprint Execution (6 Sprints x 2 Weeks = 12 Weeks)**
- Execute stories per sprint plan
- Daily standups (15 min sync)
- Mid-sprint check-ins (review progress, blockers)
- Sprint demos (showcase completed features to stakeholders)
- Sprint retrospectives (continuous improvement)

**10. Testing Strategy**
- **Unit Tests:** Backend API (Django) - minimum 70% coverage
- **Integration Tests:** API endpoints with database interactions
- **Component Tests:** Frontend design system components
- **Manual QA:** User acceptance testing per epic completion
- **Regression Testing:** Re-test prior epics as new ones complete

**11. Data Migration Planning**
- Plan Notion CSV import (Story 3.3)
- Clean and prepare candidate data in docs/basedados/
- Map CSV columns to Candidate model fields
- Test import on staging environment before production
- Validate imported data (completeness, accuracy)

---

### Phase 4: Pre-Launch (Week 15-16)

**12. User Acceptance Testing (UAT)**
- Recruit beta users: 5-10 candidates, 2-3 companies
- Provide test accounts and onboarding guide
- Collect feedback on usability, bugs, missing features
- Prioritize critical fixes vs nice-to-haves

**13. Security & Compliance Review**
- Penetration testing (optional, or post-launch)
- LGPD compliance audit (data consent, privacy policy, data deletion)
- SSL certificate validation
- Secure token storage verification
- Rate limiting and DDoS protection

**14. Performance Testing**
- Load test: simulate 100 concurrent users
- Measure API response times (target: <500ms)
- Measure page load times (target: <2s)
- Database query optimization (slow query log analysis)

**15. Deployment to Production**
- Deploy to AWS production environment
- Configure DNS (salesdog.click → production)
- Run database migrations
- Import candidate data from Notion
- Smoke test all critical user flows
- Monitor logs and error rates

---

### Phase 5: Launch & Post-Launch (Week 16+)

**16. Soft Launch**
- Announce to existing candidate network (email, LinkedIn)
- Invite select companies (controlled rollout)
- Monitor system health, error rates, user feedback
- Fix critical bugs within 24 hours

**17. Marketing & Growth**
- Public launch announcement (LinkedIn, website)
- Content marketing (blog posts, case studies)
- Partnerships with tech sales communities
- Track key metrics: candidate signups, company registrations, matches, hires

**18. Post-MVP Iterations**
- Collect user feedback and usage data
- Prioritize Phase 2 features (AI matching, WhatsApp integration, video interviews)
- Plan quarterly roadmap based on data and feedback
- Iterate on matching algorithm using real match outcome data

---

## Recommended Workflow Sequence

Based on the BMad workflow system, execute in this order:

1. ✅ **PRD & Epic Breakdown** (Complete - this document)
2. ⚠️ **Solution Architecture Workflow** (NEXT - CRITICAL)
   - Run: `bmad/bmm/workflows/3-solutioning/workflow.yaml`
3. 🎨 **UX Specification Workflow** (Recommended for UI-heavy project)
   - Run: UX workflow from plan-project menu
4. 📋 **Story Generation & Refinement**
   - Stories already outlined in epics.md
   - Refine with technical details during sprint planning
5. 🚀 **Development & Testing**
   - Execute sprints per epic breakdown
6. 🎯 **Deployment & Launch**
   - Follow deployment workflow per sprint completion

---

## Key Contacts & Resources

**Documentation:**
- PRD: [docs/PRD.md](./PRD.md)
- Epics: [docs/epics.md](./epics.md)
- Architecture: [docs/arquitetura/](./arquitetura/)
- Design System: [packages/design-system/](../packages/design-system/)
- Layouts: [docs/layouts/](./layouts/)

**Project Assets:**
- Real candidate data: [docs/basedados/](./basedados/)
- Landing page design: [docs/site/landingpage.pdf](./site/landingpage.pdf)
- Design inspiration: [docs/layouts/](./layouts/)

**Infrastructure:**
- Domain: salesdog.click (configured)
- AWS: CLI configured, accounts ready
- GitHub: Repository ready, CI/CD pipeline to be configured

---

**Next Immediate Action:** Run solution architecture workflow with this PRD and epics as input.

## Document Status

- [ ] Goals and context validated with stakeholders
- [ ] All functional requirements reviewed
- [ ] User journeys cover all major personas
- [ ] Epic structure approved for phased delivery
- [ ] Ready for architecture phase

_Note: See technical-decisions.md for captured technical context_

---

_This PRD adapts to project level Level 3 (Full Product) - providing appropriate detail without overburden._
