import { Divider, ScrollArea, Stack, Text } from '@mantine/core';
import type { components } from '@/api/v2';
import { PeriodGapWarning } from './PeriodGapWarning';
import { PeriodOption } from './PeriodOption';
import { groupPeriods } from './periodUtils';

type PeriodResponse = components['schemas']['PeriodResponse'];

interface PeriodDropdownProps {
  periods: PeriodResponse[];
  selectedPeriodId: string | null;
  onSelect: (id: string) => void;
  /** Whether the user is currently in a gap (no active period) */
  isInGap: boolean;
}

export function PeriodDropdown({
  periods,
  selectedPeriodId,
  onSelect,
  isInGap,
}: PeriodDropdownProps) {
  const groups = groupPeriods(periods);

  return (
    <ScrollArea.Autosize mah={400} data-testid="period-dropdown">
      <Stack gap="xs" p="xs">
        {isInGap && <PeriodGapWarning />}
        {isInGap && groups.length > 0 && <Divider />}

        {groups.map((group, idx) => (
          <Stack key={group.label} gap={2}>
            {idx > 0 && !isInGap && <Divider my={4} />}
            <Text
              fz={10}
              fw={600}
              tt="uppercase"
              c="dimmed"
              px="sm"
              style={{ letterSpacing: '0.08em' }}
            >
              {group.label}
            </Text>
            {group.periods.map((period) => (
              <PeriodOption
                key={period.id}
                period={period}
                isSelected={period.id === selectedPeriodId}
                onSelect={onSelect}
              />
            ))}
          </Stack>
        ))}

        {groups.length === 0 && !isInGap && (
          <Text fz="sm" c="dimmed" ta="center" py="md">
            No periods found
          </Text>
        )}
      </Stack>
    </ScrollArea.Autosize>
  );
}
