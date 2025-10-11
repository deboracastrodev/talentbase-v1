/**
 * Application Routes Configuration
 *
 * Centralized route definitions and builders to avoid hardcoded URLs throughout the app.
 * Benefits:
 * - Type-safe route generation
 * - Easy refactoring (change once, update everywhere)
 * - Consistent query parameters
 * - Better maintainability
 */

/**
 * Route Paths - Base paths without query parameters
 */
export const ROUTES = {
  // Public Routes
  home: '/',

  // Auth Routes
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    candidateRegister: '/auth/register/candidate',
    companyRegister: '/auth/register/company',
  },

  // Admin Routes
  admin: {
    dashboard: '/admin',
    users: '/admin/users',
    companies: '/admin/companies',
    candidates: '/admin/candidates',
    candidatesNew: '/admin/candidates/new',
    jobs: '/admin/jobs',
    applications: '/admin/applications',
    matching: '/admin/matching',
    importCandidates: '/admin/import/candidates',
  },

  // Candidate Routes
  candidate: {
    dashboard: '/candidate/dashboard',
    profile: '/candidate/profile',
    profileCreate: '/candidate/profile/create',
  },

  // Company Routes
  company: {
    dashboard: '/company/dashboard',
    profile: '/company/profile',
    jobs: '/company/jobs',
  },

  // Public Profile Sharing
  share: {
    candidate: (token: string) => `/share/candidate/${token}`,
  },
} as const;

/**
 * User Status Filter Options
 */
export type UserStatus = 'all' | 'pending' | 'approved' | 'rejected' | 'inactive';

/**
 * User Role Filter Options
 */
export type UserRole = 'all' | 'admin' | 'candidate' | 'company';

/**
 * Admin Users Route Builder
 *
 * @example
 * // All pending company approvals
 * buildAdminUsersRoute({ status: 'pending', role: 'company' })
 * // => '/admin/users?status=pending&role=company'
 *
 * // Search for a specific user
 * buildAdminUsersRoute({ search: 'john@example.com' })
 * // => '/admin/users?search=john%40example.com'
 *
 * // Page 2 of all users
 * buildAdminUsersRoute({ page: 2 })
 * // => '/admin/users?page=2'
 */
export function buildAdminUsersRoute(params?: {
  status?: UserStatus;
  role?: UserRole;
  search?: string;
  page?: number;
}): string {
  if (!params) {
    return ROUTES.admin.users;
  }

  const searchParams = new URLSearchParams();

  if (params.status && params.status !== 'all') {
    searchParams.set('status', params.status);
  }

  if (params.role && params.role !== 'all') {
    searchParams.set('role', params.role);
  }

  if (params.search) {
    searchParams.set('search', params.search);
  }

  if (params.page && params.page > 1) {
    searchParams.set('page', params.page.toString());
  }

  const query = searchParams.toString();
  return query ? `${ROUTES.admin.users}?${query}` : ROUTES.admin.users;
}

/**
 * Admin Candidates Route Builder
 *
 * @example
 * // Success after creating candidate
 * buildAdminCandidatesRoute({ created: true, email_sent: true })
 * // => '/admin/candidates?created=true&email_sent=true'
 */
export function buildAdminCandidatesRoute(params?: {
  created?: boolean;
  email_sent?: boolean;
  search?: string;
  page?: number;
}): string {
  if (!params) {
    return ROUTES.admin.candidates;
  }

  const searchParams = new URLSearchParams();

  if (params.created !== undefined) {
    searchParams.set('created', String(params.created));
  }

  if (params.email_sent !== undefined) {
    searchParams.set('email_sent', String(params.email_sent));
  }

  if (params.search) {
    searchParams.set('search', params.search);
  }

  if (params.page && params.page > 1) {
    searchParams.set('page', params.page.toString());
  }

  const query = searchParams.toString();
  return query ? `${ROUTES.admin.candidates}?${query}` : ROUTES.admin.candidates;
}

/**
 * Candidate Dashboard Route Builder with Share Actions
 */
export function buildCandidateDashboardRoute(params?: {
  action?: 'generate-link' | 'toggle-sharing';
}): string {
  if (!params?.action) {
    return ROUTES.candidate.dashboard;
  }

  const searchParams = new URLSearchParams({ action: params.action });
  return `${ROUTES.candidate.dashboard}?${searchParams.toString()}`;
}

/**
 * Quick Access Routes - Common route combinations
 */
export const QUICK_ROUTES = {
  // Admin quick access
  pendingCompanyApprovals: buildAdminUsersRoute({ status: 'pending', role: 'company' }),
  pendingCandidateApprovals: buildAdminUsersRoute({ status: 'pending', role: 'candidate' }),
  allPendingApprovals: buildAdminUsersRoute({ status: 'pending' }),
  activeUsers: buildAdminUsersRoute({ status: 'approved' }),

  // Auth redirects
  loginWithRedirect: (returnTo: string) =>
    `${ROUTES.auth.login}?returnTo=${encodeURIComponent(returnTo)}`,
} as const;

/**
 * Route Validation Helpers
 */
export const isAdminRoute = (path: string): boolean => path.startsWith('/admin');
export const isCandidateRoute = (path: string): boolean => path.startsWith('/candidate');
export const isCompanyRoute = (path: string): boolean => path.startsWith('/company');
export const isAuthRoute = (path: string): boolean => path.startsWith('/auth');
export const isPublicRoute = (path: string): boolean =>
  !isAdminRoute(path) && !isCandidateRoute(path) && !isCompanyRoute(path);
