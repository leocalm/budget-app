import { apiGet, apiPost } from './client';

export type OnboardingStatus = 'not_started' | 'in_progress' | 'completed';
export type OnboardingStep = 'period' | 'accounts' | 'categories' | 'summary';

export interface OnboardingStatusResponse {
  status: OnboardingStatus;
  currentStep: OnboardingStep | null;
}

export async function getOnboardingStatus(): Promise<OnboardingStatusResponse> {
  return apiGet<OnboardingStatusResponse>('/api/onboarding/status');
}

export async function completeOnboarding(): Promise<void> {
  return apiPost<void, Record<string, never>>('/api/onboarding/complete', {});
}
