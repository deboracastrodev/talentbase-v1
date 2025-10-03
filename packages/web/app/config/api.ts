/**
 * API Configuration
 *
 * Centralizes API URL configuration for the application.
 * Addresses LOW-2 from Story 2.1 review.
 *
 * Environment Variables:
 * - VITE_API_URL: API base URL (required in production)
 *
 * Examples:
 * - Development: http://localhost:8000
 * - Staging: https://api-staging.talentbase.com
 * - Production: https://api.talentbase.com
 */

// Extend Window interface to include ENV
declare global {
  interface Window {
    ENV?: {
      API_URL?: string;
    };
  }
}

/**
 * Get the API base URL based on environment.
 *
 * Priority:
 * 1. window.ENV.API_URL (set by root.tsx from server env vars)
 * 2. import.meta.env.VITE_API_URL (Vite build-time env var)
 * 3. Fallback to localhost:8000 (development only)
 *
 * Note: In production, VITE_API_URL MUST be set during build.
 * In Remix, we expose server env vars via window.ENV in root.tsx.
 */
export function getApiBaseUrl(): string {
  // 1. Check window.ENV (set by root.tsx loader)
  if (typeof window !== 'undefined' && window.ENV?.API_URL) {
    return window.ENV.API_URL;
  }

  // 2. Check Vite env var (build-time)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // 3. Development fallback
  // In production, this will fail fast and tell us env var is missing
  const isDevelopment = import.meta.env.DEV;
  if (isDevelopment) {
    return 'http://localhost:8000';
  }

  // Production without env var - fail fast with helpful error
  throw new Error(
    'API_URL not configured! Set VITE_API_URL environment variable or configure window.ENV.API_URL in root.tsx'
  );
}

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  auth: {
    registerCandidate: '/api/v1/auth/register/candidate',
    registerCompany: '/api/v1/auth/register/company',
    login: '/api/v1/auth/login',
    logout: '/api/v1/auth/logout',
  },
  candidate: {
    profile: '/api/v1/candidates/profile',
    list: '/api/v1/candidates',
  },
  company: {
    profile: '/api/v1/companies/profile',
    list: '/api/v1/companies',
  },
  jobs: {
    list: '/api/v1/jobs',
    detail: (id: string) => `/api/v1/jobs/${id}`,
  },
} as const;

/**
 * Build full API URL
 */
export function buildApiUrl(endpoint: string): string {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${endpoint}`;
}

/**
 * Default fetch options for API requests
 */
export const defaultFetchOptions: RequestInit = {
  credentials: 'include', // Always include cookies for authentication
  headers: {
    'Content-Type': 'application/json',
  },
};
