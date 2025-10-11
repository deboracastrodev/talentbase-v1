/**
 * Centralized API Client for Client-Side (Browser)
 *
 * Handles all HTTP requests from the browser with:
 * - Automatic authentication via cookies
 * - Centralized error handling
 * - Type-safe responses
 * - Request/response interceptors
 *
 * Usage:
 * ```typescript
 * import { apiClient } from '~/lib/apiClient';
 *
 * // GET request
 * const users = await apiClient.get<User[]>('/api/v1/admin/users');
 *
 * // POST request
 * const newUser = await apiClient.post<User>('/api/v1/users', { name: 'John' });
 * ```
 */

import { buildApiUrl } from '~/config/api';

/**
 * API Error class for better error handling
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown
  ) {
    super(`API Error ${status}: ${statusText}`);
    this.name = 'ApiError';
  }
}

/**
 * API Client configuration
 */
interface ApiClientConfig {
  baseURL?: string;
  headers?: Record<string, string>;
  onError?: (error: ApiError) => void;
}

/**
 * Request options
 */
interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
}

class ApiClient {
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig = {}) {
    this.config = {
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      ...config,
    };
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = buildApiUrl(endpoint);

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
   * Make HTTP request
   */
  private async request<T>(
    method: string,
    endpoint: string,
    options: RequestOptions & { body?: unknown } = {}
  ): Promise<T> {
    const { headers, params, body } = options;

    const url = this.buildUrl(endpoint, params);

    const response = await fetch(url, {
      method,
      headers: {
        ...this.config.headers,
        ...headers,
      },
      credentials: 'include', // Always include cookies (for auth_token)
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

      const error = new ApiError(response.status, response.statusText, errorData);

      // Call error handler if provided
      if (this.config.onError) {
        this.config.onError(error);
      }

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
  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('GET', endpoint, options);
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('POST', endpoint, { ...options, body });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('PUT', endpoint, { ...options, body });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('PATCH', endpoint, { ...options, body });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('DELETE', endpoint, options);
  }
}

/**
 * Default API client instance
 *
 * @example
 * ```typescript
 * import { apiClient } from '~/lib/apiClient';
 * const users = await apiClient.get<User[]>('/api/v1/users');
 * ```
 */
export const apiClient = new ApiClient();

/**
 * Create a custom API client with specific configuration
 *
 * @example
 * ```typescript
 * const customClient = createApiClient({
 *   onError: (error) => {
 *     console.error('API Error:', error);
 *     toast.error(error.message);
 *   }
 * });
 * ```
 */
export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config);
}
