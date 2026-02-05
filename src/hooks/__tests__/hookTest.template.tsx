import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Hook Test Template
 * 1. Copy this file into `src/hooks/` (or next to the hook under test).
 * 2. Rename to `<hookName>.test.tsx`.
 * 3. Replace `useExampleHook` and assertions with real logic.
 */

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Example usage:
// import { useExampleHook } from '../useExampleHook';
// import { vi, describe, it, expect } from 'vitest';
//
// vi.mock('@/api/example', () => ({ fetchExample: vi.fn() }));
//
// describe('useExampleHook', () => {
//   it('fetches data when enabled', async () => {
//     const wrapper = createWrapper();
//     const { result } = renderHook(() => useExampleHook('id'), { wrapper });
//
//     await waitFor(() => {
//       expect(result.current.isSuccess).toBe(true);
//     });
//   });
// });

export { createWrapper };
