import { IconCalendarEvent } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button, Stack, Text } from '@mantine/core';

interface NoPeriodStateProps {
  pageTitle: string;
}

/**
 * Displayed when no budget period is selected.
 * Provides a clear visual indicator and a link to the Periods page.
 */
export function NoPeriodState({ pageTitle }: NoPeriodStateProps) {
  const { t } = useTranslation('v2');
  const navigate = useNavigate();

  return (
    <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
      <Text fz={28} fw={700} ff="var(--mantine-font-family-headings)">
        {pageTitle}
      </Text>
      <Stack
        align="center"
        gap="md"
        py="xl"
        style={{
          background: 'var(--v2-surface)',
          border: '1px solid var(--v2-border)',
          borderRadius: 'var(--mantine-radius-lg)',
          padding: 'var(--mantine-spacing-xl)',
        }}
      >
        <IconCalendarEvent size={48} stroke={1.2} color="var(--v2-primary)" />
        <Text fz="lg" fw={600} ta="center">
          {t('common.noPeriodSelected')}
        </Text>
        <Text fz="sm" c="dimmed" ta="center" maw={400}>
          {t('common.noPeriodStateDescription')}
        </Text>
        <Button
          variant="light"
          leftSection={<IconCalendarEvent size={16} />}
          onClick={() => navigate('/periods')}
        >
          {t('common.goToPeriods')}
        </Button>
      </Stack>
    </Stack>
  );
}
