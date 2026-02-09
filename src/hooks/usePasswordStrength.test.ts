import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { usePasswordStrength } from './usePasswordStrength';

describe('usePasswordStrength', () => {
  it('returns weak password result for empty password', () => {
    const { result } = renderHook(() => usePasswordStrength());
    const evaluation = result.current.evaluate('');

    expect(evaluation.score).toBe(0);
    expect(evaluation.isStrong).toBe(false);
    expect(evaluation.feedback).toContain('required');
  });

  it('returns weak password for common weak patterns', () => {
    const { result } = renderHook(() => usePasswordStrength());
    const evaluation = result.current.evaluate('password');

    expect(evaluation.score).toBeLessThan(3);
    expect(evaluation.isStrong).toBe(false);
    expect(evaluation.feedback).toContain('weak');
  });

  it('returns strong password for complex patterns', () => {
    const { result } = renderHook(() => usePasswordStrength());
    const evaluation = result.current.evaluate('SuperSecurePassword123!@#');

    expect(evaluation.score).toBeGreaterThanOrEqual(3);
    expect(evaluation.isStrong).toBe(true);
    // Should contain either "Good" or "Very strong" in the feedback
    const hasStrongFeedback =
      evaluation.feedback.includes('Good') || evaluation.feedback.includes('Very strong');
    expect(hasStrongFeedback).toBe(true);
  });

  it('returns suggestions for weak passwords', () => {
    const { result } = renderHook(() => usePasswordStrength());
    const evaluation = result.current.evaluate('test123');

    expect(evaluation.suggestions).toBeDefined();
    expect(Array.isArray(evaluation.suggestions)).toBe(true);
  });

  it('evaluates sequential numbers as weak', () => {
    const { result } = renderHook(() => usePasswordStrength());
    const evaluation = result.current.evaluate('123456789');

    expect(evaluation.score).toBeLessThan(3);
    expect(evaluation.isStrong).toBe(false);
  });

  it('evaluates mixed case and numbers as stronger', () => {
    const { result } = renderHook(() => usePasswordStrength());
    const evaluation = result.current.evaluate('MyPassword2024');

    expect(evaluation.score).toBeGreaterThanOrEqual(2);
  });

  it('evaluates special characters as adding strength', () => {
    const { result } = renderHook(() => usePasswordStrength());
    const weak = result.current.evaluate('password123');
    const stronger = result.current.evaluate('password123!@#');

    expect(stronger.score).toBeGreaterThanOrEqual(weak.score);
  });

  it('provides feedback messages for all strength levels', () => {
    const { result } = renderHook(() => usePasswordStrength());

    const veryWeak = result.current.evaluate('');
    expect(veryWeak.feedback).toBeDefined();
    expect(veryWeak.feedback.length > 0).toBe(true);

    const weak = result.current.evaluate('pass');
    expect(weak.feedback).toBeDefined();
    expect(weak.feedback.length > 0).toBe(true);

    const strong = result.current.evaluate('VerySecurePass123!@#');
    expect(strong.feedback).toBeDefined();
    expect(strong.feedback.length > 0).toBe(true);
  });
});
