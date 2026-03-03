import { IconInfoCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { Alert, Group, Stepper, Text, useMatches } from '@mantine/core';
import { completeOnboarding } from '@/api/onboarding';
import { useOnboardingWizard } from '@/hooks/useOnboardingWizard';
import { FocusLayout } from './FocusLayout';
import { AccountsStep } from './steps/AccountsStep';
import { CategoriesStep } from './steps/CategoriesStep';
import { PeriodModelStep } from './steps/PeriodModelStep';
import { SummaryStep } from './steps/SummaryStep';

const STEP_LABELS = ['Period', 'Accounts', 'Categories', 'Summary'];

export function OnboardingWizard() {
  const navigate = useNavigate();
  const { activeStep, isResuming, isLoading, goToStep, markStepComplete } = useOnboardingWizard();
  const isMobile = useMatches({ base: true, sm: false });

  async function handleComplete() {
    await completeOnboarding();
    void navigate('/dashboard', { replace: true });
  }

  if (isLoading) {
    return null;
  }

  const steps = (
    <>
      <Stepper.Step label={isMobile ? undefined : 'Period'}>
        <PeriodModelStep onComplete={() => markStepComplete(0)} />
      </Stepper.Step>
      <Stepper.Step label={isMobile ? undefined : 'Accounts'}>
        <AccountsStep onComplete={() => markStepComplete(1)} onBack={() => goToStep(0)} />
      </Stepper.Step>
      <Stepper.Step label={isMobile ? undefined : 'Categories'}>
        <CategoriesStep onComplete={() => markStepComplete(2)} onBack={() => goToStep(1)} />
      </Stepper.Step>
      <Stepper.Step label={isMobile ? undefined : 'Summary'}>
        <SummaryStep onEnter={handleComplete} onBack={() => goToStep(2)} />
      </Stepper.Step>
    </>
  );

  return (
    <FocusLayout>
      {isResuming && (
        <Alert icon={<IconInfoCircle size={16} />} mb="lg" withCloseButton>
          Your setup was saved. Continue where you left off.
        </Alert>
      )}

      {isMobile && (
        <Group justify="space-between" align="baseline" mb="md">
          <Text fw={700} size="lg">
            {STEP_LABELS[activeStep]}
          </Text>
          <Text size="sm" c="dimmed">
            {activeStep + 1} / {STEP_LABELS.length}
          </Text>
        </Group>
      )}

      <Stepper
        active={activeStep}
        onStepClick={goToStep}
        styles={
          isMobile
            ? {
                steps: { display: 'none' },
              }
            : undefined
        }
      >
        {steps}
      </Stepper>
    </FocusLayout>
  );
}
