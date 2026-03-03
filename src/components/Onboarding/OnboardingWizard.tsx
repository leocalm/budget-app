import { IconCheck, IconInfoCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Group,
  Stepper,
  Text,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { completeOnboarding } from '@/api/onboarding';
import { useAuth } from '@/context/AuthContext';
import { useOnboardingWizard } from '@/hooks/useOnboardingWizard';
import { FocusLayout } from './FocusLayout';
import { AccountsStep } from './steps/AccountsStep';
import { CategoriesStep } from './steps/CategoriesStep';
import { PeriodModelStep } from './steps/PeriodModelStep';
import { SummaryStep } from './steps/SummaryStep';

const STEP_LABELS = ['Period', 'Accounts', 'Categories', 'Summary'];

interface StepChipsProps {
  activeStep: number;
}

function StepChips({ activeStep }: StepChipsProps) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const primary = theme.colors[theme.primaryColor][5];
  const muted = isDark ? theme.colors.dark[4] : theme.colors.gray[4];

  return (
    <Group gap={0} align="center" justify="center" mb="lg">
      {STEP_LABELS.map((label, i) => {
        const isActive = i === activeStep;
        const isDone = i < activeStep;
        const isLast = i === STEP_LABELS.length - 1;

        const circleBg = isActive || isDone ? primary : 'transparent';
        const circleBorder = isActive || isDone ? primary : muted;
        const textColor = isActive || isDone ? theme.white : muted;

        return (
          <Group key={label} gap={0} align="center" wrap="nowrap">
            {/* Step circle */}
            <Group gap={6} align="center" wrap="nowrap">
              <Box
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  flexShrink: 0,
                  background: circleBg,
                  border: `2px solid ${circleBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 200ms ease',
                }}
              >
                {isDone ? (
                  <IconCheck size={14} color={theme.white} stroke={3} />
                ) : (
                  <Text size="xs" fw={700} style={{ color: textColor, lineHeight: 1 }}>
                    {i + 1}
                  </Text>
                )}
              </Box>
              {isActive && (
                <Text size="sm" fw={600} style={{ whiteSpace: 'nowrap' }}>
                  {label}
                </Text>
              )}
            </Group>

            {/* Connector line between steps */}
            {!isLast && (
              <Box
                style={{
                  width: isActive ? 12 : 20,
                  height: 2,
                  background: isDone ? primary : muted,
                  margin: '0 6px',
                  flexShrink: 0,
                  transition: 'all 200ms ease',
                }}
              />
            )}
          </Group>
        );
      })}
    </Group>
  );
}

export function OnboardingWizard() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const { activeStep, isResuming, isLoading, goToStep, markStepComplete } = useOnboardingWizard();
  const isMobile = useMediaQuery('(max-width: 48em)');

  async function handleComplete() {
    await completeOnboarding();
    await refreshUser();
    void navigate('/dashboard', { replace: true });
  }

  if (isLoading) {
    return null;
  }

  return (
    <FocusLayout>
      {isResuming && (
        <Alert icon={<IconInfoCircle size={16} />} mb="lg" withCloseButton>
          Your setup was saved. Continue where you left off.
        </Alert>
      )}

      {isMobile ? (
        <>
          <StepChips activeStep={activeStep} />
          {activeStep === 0 && <PeriodModelStep onComplete={() => markStepComplete(0)} />}
          {activeStep === 1 && (
            <AccountsStep onComplete={() => markStepComplete(1)} onBack={() => goToStep(0)} />
          )}
          {activeStep === 2 && (
            <CategoriesStep onComplete={() => markStepComplete(2)} onBack={() => goToStep(1)} />
          )}
          {activeStep === 3 && <SummaryStep onEnter={handleComplete} onBack={() => goToStep(2)} />}
        </>
      ) : (
        <Stepper active={activeStep} onStepClick={goToStep}>
          <Stepper.Step label="Period">
            <PeriodModelStep onComplete={() => markStepComplete(0)} />
          </Stepper.Step>
          <Stepper.Step label="Accounts">
            <AccountsStep onComplete={() => markStepComplete(1)} onBack={() => goToStep(0)} />
          </Stepper.Step>
          <Stepper.Step label="Categories">
            <CategoriesStep onComplete={() => markStepComplete(2)} onBack={() => goToStep(1)} />
          </Stepper.Step>
          <Stepper.Step label="Summary">
            <SummaryStep onEnter={handleComplete} onBack={() => goToStep(2)} />
          </Stepper.Step>
        </Stepper>
      )}
    </FocusLayout>
  );
}
