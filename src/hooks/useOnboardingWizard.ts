import { useCallback, useEffect, useState } from 'react';
import { getOnboardingStatus, type OnboardingStep } from '@/api/onboarding';

const STEP_INDEX: Record<OnboardingStep, number> = {
  period: 0,
  accounts: 1,
  categories: 2,
  summary: 3,
};

export interface OnboardingWizardState {
  activeStep: number;
  completedUpTo: number;
  isResuming: boolean;
  isLoading: boolean;
  goToStep: (step: number) => void;
  markStepComplete: (step: number) => void;
}

export function useOnboardingWizard(): OnboardingWizardState {
  const [activeStep, setActiveStep] = useState(0);
  const [completedUpTo, setCompletedUpTo] = useState(-1);
  const [isResuming, setIsResuming] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getOnboardingStatus()
      .then(({ status, currentStep }) => {
        if (status === 'not_started' || !currentStep) {
          setActiveStep(0);
          setCompletedUpTo(-1);
          setIsResuming(false);
        } else {
          const idx = STEP_INDEX[currentStep];
          setActiveStep(idx);
          setCompletedUpTo(idx - 1);
          setIsResuming(status === 'in_progress');
        }
      })
      .catch(() => {
        setActiveStep(0);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const goToStep = useCallback(
    (step: number) => {
      if (step <= completedUpTo + 1) {
        setActiveStep(step);
      }
    },
    [completedUpTo]
  );

  const markStepComplete = useCallback((step: number) => {
    setCompletedUpTo((prev) => Math.max(prev, step));
    setActiveStep(step + 1);
  }, []);

  return { activeStep, completedUpTo, isResuming, isLoading, goToStep, markStepComplete };
}
