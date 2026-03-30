import { useTranslation } from 'react-i18next';
import { Badge, Group, Stack, Text, UnstyledButton } from '@mantine/core';
import type { components } from '@/api/v2';
import { useV2Theme } from '@/theme/v2';
import { periodBadgeText, periodDateRange } from './periodUtils';

type PeriodResponse = components['schemas']['PeriodResponse'];

interface PeriodOptionProps {
  period: PeriodResponse;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function PeriodOption({ period, isSelected, onSelect }: PeriodOptionProps) {
  const { t } = useTranslation('v2');
  const { accents } = useV2Theme();
  const badge = periodBadgeText(period, t);
  const dateRange = periodDateRange(period);

  return (
    <UnstyledButton
      onClick={() => onSelect(period.id)}
      data-testid={`period-option-${period.id}`}
      px="sm"
      py="xs"
      w="100%"
      style={{
        borderRadius: 'var(--mantine-radius-sm)',
        backgroundColor: isSelected ? 'var(--v2-elevated)' : undefined,
      }}
    >
      <Group justify="space-between" wrap="nowrap">
        <Stack gap={0}>
          <Text fz="sm" fw={isSelected ? 600 : 400}>
            {period.name}
          </Text>
          <Text fz="xs" c="dimmed">
            {dateRange}
          </Text>
        </Stack>
        {badge && (
          <Badge
            size="xs"
            variant="light"
            color={period.status === 'active' ? 'lavender' : 'gray'}
            style={
              period.status === 'active'
                ? { backgroundColor: `${accents.primary}20`, color: accents.primary }
                : undefined
            }
          >
            {badge}
          </Badge>
        )}
      </Group>
    </UnstyledButton>
  );
}
