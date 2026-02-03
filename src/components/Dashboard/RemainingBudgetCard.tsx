import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';
import { Group, Paper, RingProgress, Stack, Text, ThemeIcon } from '@mantine/core';
import { MonthlyBurnIn } from '@/types/dashboard';
import { convertCentsToDisplay } from '@/utils/currency';

interface RemainingBudgetCardProps {
  data: MonthlyBurnIn | undefined;
  totalAsset: number | undefined;
}

export function RemainingBudgetCard({ data, totalAsset }: RemainingBudgetCardProps) {
  const percentage = data ? (data.spentBudget / data.totalBudget) * 100 : 0;
  const isOverBudget = percentage > 100;

  if (!data || !totalAsset) {
    return (
      <Paper shadow="md" radius="lg" p="lg" style={{ background: 'var(--bg-card)' }}>
        Error
      </Paper>
    );
  }

  return (
    <Paper shadow="md" radius="lg" p="lg" h="100%" style={{ background: 'var(--bg-card)' }}>
      <Group justify="space-between" align="center">
        <Stack gap={0}>
          <Text size="xs" c="dimmed" fw={700} tt="uppercase">
            Total Assets
          </Text>
          <Text size="xl" fw={800} style={{ fontFamily: 'monospace' }}>
            €{convertCentsToDisplay(totalAsset).toLocaleString()}
          </Text>

          <Group gap="xs" mt="md">
            <ThemeIcon color={isOverBudget ? 'red' : 'green'} variant="light" radius="xl">
              {isOverBudget ? <IconTrendingDown size={16} /> : <IconTrendingUp size={16} />}
            </ThemeIcon>
            <div>
              <Text size="xs" c="dimmed">
                Remaining Budget
              </Text>
              <Text fw={700} c={isOverBudget ? 'red' : 'green'}>
                €{convertCentsToDisplay(data?.totalBudget - data?.spentBudget).toLocaleString()}
              </Text>
            </div>
          </Group>
        </Stack>

        <RingProgress
          size={120}
          thickness={8}
          roundCaps
          sections={[{ value: Math.min(percentage, 100), color: isOverBudget ? 'red' : 'blue' }]}
          label={
            <Text ta="center" fw={700} size="sm">
              {percentage.toFixed(0)}%
            </Text>
          }
        />
      </Group>
    </Paper>
  );
}
