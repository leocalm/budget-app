import { useCallback } from 'react';
import zxcvbn from 'zxcvbn';

export interface PasswordStrengthResult {
  score: number; // 0-4
  feedback: string;
  suggestions: string[];
  isStrong: boolean; // score >= 3
}

/**
 * Hook for evaluating password strength using zxcvbn
 * Returns password strength feedback and suggestions
 */
export function usePasswordStrength() {
  const evaluate = useCallback((password: string): PasswordStrengthResult => {
    if (!password) {
      return {
        score: 0,
        feedback: 'Password is required',
        suggestions: [],
        isStrong: false,
      };
    }

    const result = zxcvbn(password);

    // Map zxcvbn score (0-4) to human-readable feedback
    const feedbackMap = [
      'Very weak password - This is easily cracked',
      'Weak password - Add more variety to your password',
      'Fair password - Could be stronger',
      'Good password - This will protect your account',
      'Very strong password - Excellent choice',
    ];

    const feedback = feedbackMap[result.score];
    const suggestions = result.feedback.suggestions || [];

    return {
      score: result.score,
      feedback,
      suggestions,
      isStrong: result.score >= 3,
    };
  }, []);

  return { evaluate };
}
