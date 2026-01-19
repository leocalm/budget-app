import { IconCalendarMonth, IconChevronDown } from '@tabler/icons-react';
import { Button, Group, Menu, ScrollArea, Text } from '@mantine/core';
import { BudgetPeriod } from '@/types/budget';

interface BudgetPeriodSelectorProps {
  periods: BudgetPeriod[];
  selectedPeriodId: string | null;
  onPeriodChange: (id: string) => void;
}

export function BudgetPeriodSelector({
  periods,
  selectedPeriodId,
  onPeriodChange,
}: BudgetPeriodSelectorProps) {
  const selectedPeriod = periods.find((p) => p.id === selectedPeriodId);

  // Group periods by year
  const groupedPeriods = periods.reduce(
    (acc, period) => {
      const year = period.endDate.slice(0, 4).toString();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(period);
      return acc;
    },
    {} as Record<string, BudgetPeriod[]>
  );

  // Sort years descending (newest first)
  const years = Object.keys(groupedPeriods).sort((a, b) => b.localeCompare(a));

  return (
    <Menu
      shadow="md"
      width={220}
      position="bottom-end"
      transitionProps={{ transition: 'pop-top-right' }}
    >
      <Menu.Target>
        <Button
          variant="default"
          size="sm"
          radius="md"
          leftSection={<IconCalendarMonth size={18} stroke={1.5} />}
          rightSection={<IconChevronDown size={14} stroke={1.5} />}
          styles={{
            root: { paddingLeft: 12, paddingRight: 12, height: 36 },
            label: { fontWeight: 600 },
          }}
        >
          {selectedPeriod ? `${selectedPeriod.name}` : 'Select Period'}
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <ScrollArea.Autosize mah={400} type="auto">
          {years.map((year) => (
            <div key={year}>
              <Menu.Label fw={700} c="dimmed">
                {year}
              </Menu.Label>
              {groupedPeriods[year].map((period) => (
                <Menu.Item
                  key={period.id}
                  onClick={() => onPeriodChange(period.id)}
                  style={{
                    fontWeight: period.id === selectedPeriodId ? 700 : 400,
                    backgroundColor:
                      period.id === selectedPeriodId
                        ? 'var(--mantine-color-blue-light)'
                        : undefined,
                  }}
                >
                  <Group justify="space-between" gap="xs">
                    <Text size="sm">{period.name}</Text>
                    {period.id === selectedPeriodId && (
                      <Text size="xs" c="blue" fw={800}>
                        ACTIVE
                      </Text>
                    )}
                  </Group>
                </Menu.Item>
              ))}
              <Menu.Divider />
            </div>
          ))}
        </ScrollArea.Autosize>
      </Menu.Dropdown>
    </Menu>
  );
}
