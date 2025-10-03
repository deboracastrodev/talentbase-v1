/**
 * Test frontend-backend API connection
 * Note: Requires Docker services (PostgreSQL, Redis) and Django dev server running
 */
import { describe, it, expect } from 'vitest';

describe('API Integration', () => {
  it('should connect to Django backend health endpoint', async () => {
    const response = await fetch('http://localhost:8000/health/');
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.status).toBe('healthy');
    expect(data.database).toBe('connected');
    expect(data.cache).toBe('connected');
  });
});
