import type { LinksFunction } from '@remix-run/node';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
  isRouteErrorResponse,
} from '@remix-run/react';
import { ToastProvider } from '@talentbase/design-system';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

import globals from './globals.css?url';
import { useHydrated } from './hooks/useHydrated';
import { createQueryClient } from './lib/queryClient';

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: globals }];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  // Create a stable QueryClient instance per app instance
  // This prevents state sharing between users in SSR
  const [queryClient] = useState(() => createQueryClient());
  const hydrated = useHydrated();

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Outlet />
      </ToastProvider>
      {/* React Query DevTools - only in development and after hydration */}
      {hydrated && process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

/**
 * Error Boundary Component
 * Catches and displays route errors gracefully
 */
export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>
            {error.status} - {error.statusText}
          </title>
          <Meta />
          <Links />
        </head>
        <body className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <h1 className="text-6xl font-bold text-gray-900 mb-4">{error.status}</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">{error.statusText}</h2>
            {error.data && <p className="text-gray-600 mb-8">{error.data}</p>}
            <a
              href="/"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
            >
              Voltar para Home
            </a>
          </div>
          <Scripts />
        </body>
      </html>
    );
  }

  // Handle unexpected errors
  const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Erro - Talentbase</title>
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">Ops!</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Algo deu errado</h2>
          <p className="text-gray-600 mb-8">{errorMessage}</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
          >
            Voltar para Home
          </a>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
