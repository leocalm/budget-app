import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getOnboardingStatus } from '@/api/onboarding';
import { useOnboardingWizard } from './useOnboardingWizard';

vi.mock('@/api/onboarding', () => ({
  getOnboardingStatus: vi.fn(),
}));

describe('useOnboardingWizard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('starts at step 0 for not_started status', async () => {
    vi.mocked(getOnboardingStatus).mockResolvedValue({
      status: 'not_started',
      currentStep: null,
    });
    const { result } = renderHook(() => useOnboardingWizard());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.activeStep).toBe(0);
    expect(result.current.isResuming).toBe(false);
  });

  it('resumes at step 1 for in_progress/accounts', async () => {
    vi.mocked(getOnboardingStatus).mockResolvedValue({
      status: 'in_progress',
      currentStep: 'accounts',
    });
    const { result } = renderHook(() => useOnboardingWizard());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.activeStep).toBe(1);
    expect(result.current.isResuming).toBe(true);
  });

  it('resumes at step 2 for in_progress/categories', async () => {
    vi.mocked(getOnboardingStatus).mockResolvedValue({
      status: 'in_progress',
      currentStep: 'categories',
    });
    const { result } = renderHook(() => useOnboardingWizard());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.activeStep).toBe(2);
  });

  it('resumes at step 3 for in_progress/summary', async () => {
    vi.mocked(getOnboardingStatus).mockResolvedValue({
      status: 'in_progress',
      currentStep: 'summary',
    });
    const { result } = renderHook(() => useOnboardingWizard());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.activeStep).toBe(3);
  });

  it('markStepComplete advances activeStep and unlocks next step', async () => {
    vi.mocked(getOnboardingStatus).mockResolvedValue({
      status: 'not_started',
      currentStep: null,
    });
    const { result } = renderHook(() => useOnboardingWizard());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.markStepComplete(0));
    expect(result.current.activeStep).toBe(1);
    expect(result.current.completedUpTo).toBe(0);
  });

  it('goToStep allows going back to a completed step', async () => {
    vi.mocked(getOnboardingStatus).mockResolvedValue({
      status: 'not_started',
      currentStep: null,
    });
    const { result } = renderHook(() => useOnboardingWizard());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.markStepComplete(0));
    act(() => result.current.goToStep(0));
    expect(result.current.activeStep).toBe(0);
  });

  it('goToStep blocks skipping forward past completedUpTo + 1', async () => {
    vi.mocked(getOnboardingStatus).mockResolvedValue({
      status: 'not_started',
      currentStep: null,
    });
    const { result } = renderHook(() => useOnboardingWizard());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.goToStep(2));
    expect(result.current.activeStep).toBe(0); // stays at 0
  });
});
