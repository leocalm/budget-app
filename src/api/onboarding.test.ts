import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiGet, apiPost } from './client';
import { completeOnboarding, getOnboardingStatus } from './onboarding';

vi.mock('./client', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

describe('onboarding API', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getOnboardingStatus returns mapped response', async () => {
    vi.mocked(apiGet).mockResolvedValue({
      status: 'in_progress',
      currentStep: 'accounts',
    });
    const result = await getOnboardingStatus();
    expect(result.status).toBe('in_progress');
    expect(result.currentStep).toBe('accounts');
  });

  it('completeOnboarding calls correct endpoint', async () => {
    vi.mocked(apiPost).mockResolvedValue(undefined);
    await completeOnboarding();
    expect(apiPost).toHaveBeenCalledWith('/api/onboarding/complete', {});
  });
});
