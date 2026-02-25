import React from 'react';
import { Decorator } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { delay, http, HttpResponse } from 'msw';
import { Box } from '@mantine/core';
import type { User } from '@/api/auth';
import { AuthContext } from '@/context/AuthContext';
import { BudgetProvider } from '@/context/BudgetContext';

const MOCK_USER: User = { id: '1', email: 'designer@example.com', name: 'Design Team' };

/**
 * Provides AuthContext without any network calls or redirects.
 * Use `user={null}` for unauthenticated stories (e.g. login/register pages).
 */
function MockAuthProvider({ children, user }: { children: React.ReactNode; user: User | null }) {
  const value = React.useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading: false,
      login: () => {},
      logout: () => {},
      refreshUser: async () => true,
    }),
    [user]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

interface StoryDecoratorOptions {
  /** Include BudgetProvider (period selection context). Default: true */
  withBudgetProvider?: boolean;
  /**
   * Provide a mock AuthContext without network calls.
   * - true / 'authenticated': injects a logged-in mock user
   * - 'unauthenticated': injects user=null (for login/register pages)
   * - false (default): no auth context
   */
  withAuthProvider?: boolean | 'authenticated' | 'unauthenticated';
  /** Wrap story in a padded Box. Default: true */
  padding?: boolean;
}

/**
 * Standard story decorator factory.
 * Always provides a fresh QueryClient and optionally BudgetProvider.
 *
 * Usage in meta:
 *   decorators: [createStoryDecorator()],
 *
 * Usage without BudgetProvider (e.g. Auth pages):
 *   decorators: [createStoryDecorator({ withBudgetProvider: false })],
 */
export const createStoryDecorator = (options: StoryDecoratorOptions = {}): Decorator => {
  const { withBudgetProvider = true, withAuthProvider = false, padding = true } = options;

  const mockUser: User | null =
    withAuthProvider === 'unauthenticated' ? null : withAuthProvider ? MOCK_USER : null;

  return (Story) => {
    const queryClient = React.useMemo(
      () =>
        new QueryClient({
          defaultOptions: {
            queries: { retry: false, gcTime: 0 },
            mutations: { retry: false },
          },
        }),
      []
    );

    const inner = padding ? (
      <Box p="xl">
        <Story />
      </Box>
    ) : (
      <Story />
    );

    const withAuth = (node: React.ReactNode) =>
      withAuthProvider ? <MockAuthProvider user={mockUser}>{node}</MockAuthProvider> : <>{node}</>;

    const content = withBudgetProvider ? (
      <QueryClientProvider client={queryClient}>
        {withAuth(<BudgetProvider>{inner}</BudgetProvider>)}
      </QueryClientProvider>
    ) : (
      <QueryClientProvider client={queryClient}>{withAuth(inner)}</QueryClientProvider>
    );

    return content;
  };
};

/**
 * MSW handler shorthand helpers.
 * Use these in story parameters.msw.handlers to override specific endpoints.
 *
 * Example:
 *   parameters: {
 *     msw: {
 *       handlers: [mswHandlers.loading('/api/v1/accounts')],
 *     },
 *   },
 */
export const mswHandlers = {
  /** Returns data as JSON with a short realistic delay */

  success: (path: string, data: any, delayMs = 300) =>
    http.get(path, async () => {
      await delay(delayMs);
      return HttpResponse.json(data);
    }),

  /** Returns HTTP 500 to simulate a server error */
  error: (path: string, status = 500) => http.get(path, () => new HttpResponse(null, { status })),

  /** Delays forever — shows loading state indefinitely */
  loading: (path: string) =>
    http.get(path, async () => {
      await delay('infinite');
      return HttpResponse.json(null);
    }),

  /** Returns an empty array */
  empty: (path: string) => http.get(path, () => HttpResponse.json([])),

  /** Returns null (for single-resource endpoints) */
  emptyNull: (path: string) => http.get(path, () => HttpResponse.json(null)),

  /** Returns data as JSON with a short realistic delay (POST) */

  post: (path: string, data: any, delayMs = 300) =>
    http.post(path, async () => {
      await delay(delayMs);
      return HttpResponse.json(data);
    }),

  /** Returns an HTTP error for a POST endpoint */
  postError: (path: string, status = 500, message?: string) =>
    http.post(path, () => HttpResponse.json(message ? { message } : null, { status })),

  /** Delays POST forever — shows loading state indefinitely */
  loadingPost: (path: string) =>
    http.post(path, async () => {
      // delay('infinite') is the MSW-idiomatic way to hold a request open indefinitely.
      // It participates in MSW's cleanup lifecycle, unlike new Promise(() => {}).
      await delay('infinite');
      return HttpResponse.json(null);
    }),
};
