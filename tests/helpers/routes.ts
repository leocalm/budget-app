export const criticalAuthenticatedRoutes = [
  '/dashboard',
  '/transactions',
  '/accounts',
  '/categories',
  '/vendors',
  '/budget',
  '/periods',
  '/overlays',
  '/settings',
] as const;

export const publicAuthRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password'] as const;
