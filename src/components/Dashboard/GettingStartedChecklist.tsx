import { IconCheck, IconCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Anchor, Card, List, Stack, Text, ThemeIcon } from '@mantine/core';

interface GettingStartedChecklistProps {
  hasPeriod: boolean;
  hasAccount: boolean;
  hasCategory: boolean;
}

export function GettingStartedChecklist({
  hasPeriod,
  hasAccount,
  hasCategory,
}: GettingStartedChecklistProps) {
  const { t } = useTranslation();
  const allDone = hasPeriod && hasAccount && hasCategory;

  if (allDone) {
    return null;
  }

  const steps = [
    {
      done: hasPeriod,
      label: t('dashboard.onboarding.createPeriod', 'Create a budget period'),
      to: '/periods',
    },
    {
      done: hasAccount,
      label: t('dashboard.onboarding.addAccount', 'Add an account'),
      to: '/accounts',
    },
    {
      done: hasCategory,
      label: t('dashboard.onboarding.addCategory', 'Add a category'),
      to: '/categories',
    },
  ];

  return (
    <Card withBorder p="lg" radius="md" mb="lg">
      <Stack gap="sm">
        <Text fw={600} size="lg">
          {t('dashboard.onboarding.title', 'Getting started')}
        </Text>
        <Text c="dimmed" size="sm">
          {t('dashboard.onboarding.subtitle', 'Complete these steps to set up your budget.')}
        </Text>
        <List spacing="xs" center>
          {steps.map((step) => (
            <List.Item
              key={step.to}
              icon={
                <ThemeIcon
                  color={step.done ? 'teal' : 'gray'}
                  size={20}
                  radius="xl"
                  variant={step.done ? 'filled' : 'light'}
                >
                  {step.done ? <IconCheck size={12} /> : <IconCircle size={12} />}
                </ThemeIcon>
              }
            >
              {step.done ? (
                <Text size="sm" td="line-through" c="dimmed">
                  {step.label}
                </Text>
              ) : (
                <Anchor component={Link} to={step.to} size="sm">
                  {step.label}
                </Anchor>
              )}
            </List.Item>
          ))}
        </List>
      </Stack>
    </Card>
  );
}
