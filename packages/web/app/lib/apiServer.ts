/**
 * Centralized API Client for Server-Side (Remix Loaders/Actions)
 *
 * Handles all HTTP requests from Remix loaders/actions with:
 * - Manual token management (from cookies)
 * - Server-to-server communication (Docker internal network)
 * - Centralized error handling
 * - Type-safe responses
 *
 * Usage in Remix loaders:
 * ```typescript
 * import { apiServer } from '~/lib/apiServer';
 *
 * export async function loader({ request }: LoaderFunctionArgs) {
 *   const token = getAuthToken(request);
 *   const users = await apiServer.get<User[]>('/api/v1/admin/users', { token });
 *   return json({ users });
 * }
 * ```
 */

import { getApiBaseUrl } from '~/config/api';

/**
 * API Error class for better error handling
 */
export class ApiServerError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown
  ) {
    super(`API Error ${status}: ${statusText}`);
    this.name = 'ApiServerError';
  }
}

/**
 * Server Request options
 */
interface ServerRequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  token?: string; // JWT token for authentication
}

class ApiServerClient {
  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    // Use server-side base URL (Docker internal network: http://api:8000)
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}${endpoint}`;

    if (!params) {
      return url;
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });

    return `${url}?${searchParams.toString()}`;
  }

  /**
   * Build headers with authentication
   */
  private buildHeaders(options: ServerRequestOptions): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add JWT authentication if token provided
    if (options.token) {
      headers['Authorization'] = `Bearer ${options.token}`;
    }

    return headers;
  }

  /**
   * Make HTTP request
   */
  private async request<T>(
    method: string,
    endpoint: string,
    options: ServerRequestOptions & { body?: unknown } = {}
  ): Promise<T> {
    const { params, body, ...requestOptions } = options;

    const url = this.buildUrl(endpoint, params);
    const headers = this.buildHeaders(requestOptions);

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Handle non-2xx responses
    if (!response.ok) {
      let errorData: unknown;
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        errorData = await response.json();
      } else {
        errorData = await response.text();
      }

      const error = new ApiServerError(response.status, response.statusText, errorData);

      // Log error on server (for debugging)
      console.error(`[apiServer] ${method} ${endpoint} - ${error.status}:`, errorData);

      throw error;
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
      return null as T;
    }

    // Parse JSON response
    return response.json();
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options: ServerRequestOptions = {}): Promise<T> {
    return this.request<T>('GET', endpoint, options);
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: unknown, options: ServerRequestOptions = {}): Promise<T> {
    return this.request<T>('POST', endpoint, { ...options, body });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: unknown, options: ServerRequestOptions = {}): Promise<T> {
    return this.request<T>('PUT', endpoint, { ...options, body });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body?: unknown, options: ServerRequestOptions = {}): Promise<T> {
    return this.request<T>('PATCH', endpoint, { ...options, body });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options: ServerRequestOptions = {}): Promise<T> {
    return this.request<T>('DELETE', endpoint, options);
  }
}

/**
 * Default API server client instance
 *
 * Use in Remix loaders/actions:
 * @example
 * ```typescript
 * export async function loader({ request }: LoaderFunctionArgs) {
 *   const token = getAuthToken(request);
 *   const users = await apiServer.get<User[]>('/api/v1/users', { token });
 *   return json({ users });
 * }
 * ```
 */
export const apiServer = new ApiServerClient();
