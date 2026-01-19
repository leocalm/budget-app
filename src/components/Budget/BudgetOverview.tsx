import { Paper, SimpleGrid, Stack, Text, Group, ThemeIcon, RingProgress } from '@mantine/core';
import { BudgetAllocationChart } from './BudgetAllocationChart';

interface BudgetOverviewProps {
  totalBudget: number;
  totalSpent: number;
  allocationData: { name: string; value: number; color: string }[];
}

export function BudgetOverview({ totalBudget, totalSpent, allocationData }: BudgetOverviewProps) {
  const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const remaining = totalBudget - totalSpent;
  const isOverBudget = remaining < 0;

  return (
    <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
      <Paper withBorder p="md" radius="md">
        <Stack gap="xs">
          <Text size="xs" c="dimmed" fw={700} tt="uppercase">
            Budget Utilization
          </Text>
          <Group align="center" gap="xl">
            <RingProgress
              size={120}
              thickness={12}
              roundCaps
              sections={[{ value: Math.min(percentage, 100), color: isOverBudget ? 'red' : 'blue' }]}
              label={
                <Text c={isOverBudget ? 'red' : 'blue'} fw={700} ta="center" size="xl">
                  {percentage.toFixed(0)}%
                </Text>
              }
            />
            <div>
              <Text size="sm" c="dimmed">
                Spent
              </Text>
              <Text fw={700} size="lg">
                €{(totalSpent / 100).toLocaleString()}
              </Text>
              <Text size="sm" c="dimmed" mt="xs">
                Remaining
              </Text>
              <Text fw={700} size="lg" c={isOverBudget ? 'red' : 'green'}>
                €{(remaining / 100).toLocaleString()}
              </Text>
            </div>
          </Group>
        </Stack>
      </Paper>

      <Paper withBorder p="md" radius="md">
        <Stack gap="xs" h="100%">
          <Text size="xs" c="dimmed" fw={700} tt="uppercase">
            Status
          </Text>
          <Group align="flex-start" justify="space-between" h="100%">
             <Stack gap="xs">
                <Group>
                    <ThemeIcon color={isOverBudget ? 'red' : 'green'} variant="light" size="lg" radius="md">
                        {isOverBudget ? <span>⚠️</span> : <span>✅</span>}
                    </ThemeIcon>
                    <Text fw={600}>{isOverBudget ? 'Over Budget' : 'On Track'}</Text>
                </Group>
                <Text size="sm" c="dimmed" lh={1.4}>
                    {isOverBudget 
                        ? "You have exceeded your total budget limit for this period." 
                        : "You are within your planned budget limits."}
                </Text>
             </Stack>
          </Group>
        </Stack>
      </Paper>

      <Paper withBorder p="md" radius="md">
        <Stack gap="xs">
          <Text size="xs" c="dimmed" fw={700} tt="uppercase">
            Allocation
          </Text>
          <BudgetAllocationChart data={allocationData} totalBudget={totalBudget} />
        </Stack>
      </Paper>
    </SimpleGrid>
  );
}