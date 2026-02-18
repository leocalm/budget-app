export type RenderState = 'locked' | 'error' | 'loading' | 'empty' | 'active';

export interface ResolveStateInput {
  isLocked?: boolean;
  hasError?: boolean;
  isLoading?: boolean;
  isEmpty?: boolean;
}

export function resolveState({
  isLocked = false,
  hasError = false,
  isLoading = false,
  isEmpty = false,
}: ResolveStateInput): RenderState {
  if (isLocked) {
    return 'locked';
  }

  if (hasError) {
    return 'error';
  }

  if (isLoading) {
    return 'loading';
  }

  if (isEmpty) {
    return 'empty';
  }

  return 'active';
}
