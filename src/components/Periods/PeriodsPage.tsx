import { IconCalendarClock } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button, Paper, Stack, Text, ThemeIcon, Title } from '@mantine/core';

export function PeriodsPage() {
  const { t } = useTranslation();

  return (
    <Paper withBorder p="xl" radius="lg">
      <Stack gap="md" align="flex-start">
        <ThemeIcon variant="light" color="cyan" size="xl" radius="xl">
          <IconCalendarClock size={20} />
        </ThemeIcon>
        <div>
          <Title order={2}>{t('periods.page.title')}</Title>
          <Text c="dimmed">{t('periods.page.description')}</Text>
        </div>
        <Button component={Link} to="/dashboard" variant="light" color="cyan">
          {t('periods.page.backToDashboard')}
        </Button>
      </Stack>
    </Paper>
  );
}
