import { describe, expect, it } from 'vitest';
import { resolveState } from './resolveState';

describe('resolveState', () => {
  it('returns locked before all other states', () => {
    expect(
      resolveState({
        isLocked: true,
        hasError: true,
        isLoading: true,
        isEmpty: true,
      })
    ).toBe('locked');
  });

  it('returns error before loading and empty', () => {
    expect(resolveState({ hasError: true, isLoading: true, isEmpty: true })).toBe('error');
  });

  it('returns loading before empty', () => {
    expect(resolveState({ isLoading: true, isEmpty: true })).toBe('loading');
  });

  it('returns empty before active', () => {
    expect(resolveState({ isEmpty: true })).toBe('empty');
  });

  it('returns active when no other state applies', () => {
    expect(resolveState({})).toBe('active');
  });
});
