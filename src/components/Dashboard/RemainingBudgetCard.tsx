import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';
import {
  Group,
  Paper,
  RingProgress,
  Stack,
  Text,
  ThemeIcon,
  useMantineColorScheme,
} from '@mantine/core';
import { MonthlyBurnIn } from '@/types/dashboard';

interface RemainingBudgetCardProps {
  data: MonthlyBurnIn | undefined;
  totalAsset: number | undefined;
}

export function RemainingBudgetCard({ data, totalAsset }: RemainingBudgetCardProps) {
  const { colorScheme } = useMantineColorScheme();
  const percentage = data ? (data.spentBudget / data.totalBudget) * 100 : 0;
  const isOverBudget = percentage > 100;

  if (!data || !totalAsset) {
    return (
      <Paper
        shadow="md"
        radius="lg"
        p="lg"
        style={{
          background:
            colorScheme === 'dark' ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-0)',
        }}
      >
        Error
      </Paper>
    );
  }

  return (
    <Paper
      shadow="md"
      radius="lg"
      p="lg"
      h="100%"
      style={{
        background:
          colorScheme === 'dark' ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-0)',
      }}
    >
      <Group justify="space-between" align="center">
        <Stack gap={0}>
          <Text size="xs" c="dimmed" fw={700} tt="uppercase">
            Total Assets
          </Text>
          <Text size="xl" fw={800} style={{ fontFamily: 'monospace' }}>
            €{(totalAsset / 100).toLocaleString()}
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
                €{((data?.totalBudget - data?.spentBudget) / 100).toLocaleString()}
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
