export interface ApiError {
  message: string;
  status: number;
}

export function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 'message' in error && 'status' in error;
}

/**
 * Extracts a human-readable message from an openapi-fetch error.
 * Use in React Query onError handlers and toast notifications.
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}
