import React from 'react';
import { Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { initialTransactions } from '@/mocks/budgetData';
import { BalanceOverTimeChart } from './BalanceOverTimeChart';
import { RecentActivityTable } from './RecentActivityTable';
import { StatCard } from './StatCard';
import { TopCategoriesChart } from './TopCategoriesChart';

const balanceHistory = [
  { date: 'Jan 1', balance: 12000 },
  { date: 'Jan 5', balance: 12500 },
  { date: 'Jan 10', balance: 11800 },
  { date: 'Jan 15', balance: 13000 },
  { date: 'Jan 20', balance: 12800 },
  { date: 'Jan 25', balance: 13500 },
  { date: 'Jan 30', balance: 12450 },
];

const topCategories = [
  { category: 'Outros', amount: 284, color: '#ff6b9d', colorEnd: '#ff8fb3' },
  { category: 'Cuidados Pessoais', amount: 246, color: '#ffa940', colorEnd: '#ffbd6b' },
  { category: 'Macumba', amount: 234, color: '#ffa940', colorEnd: '#ffbd6b' },
  { category: 'Mercado', amount: 225, color: '#ffa940', colorEnd: '#ffbd6b' },
  { category: 'iCloud', amount: 135, color: '#00d4ff', colorEnd: '#5ae1ff' },
];

export function DashboardContainer() {
  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center" mb="md">
        <Title
          order={1}
          style={{
            background:
              'linear-gradient(135deg, var(--mantine-color-white) 0%, var(--mantine-color-cyan-5) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Financial Dashboard
        </Title>
        <Group
          gap="xs"
          bg="dark.7"
          p="xs"
          style={{
            borderRadius: 'var(--mantine-radius-md)',
            border: '1px solid var(--mantine-color-dark-4)',
          }}
        >
          <span>📅</span>
          <Text
            size="sm"
            fw={500}
            c="dimmed"
            style={{ fontFamily: 'var(--mantine-font-family-monospace)' }}
          >
            Jan/26
          </Text>
        </Group>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        <StatCard
          icon={() => <span>🥧</span>}
          label="Remaining Budget"
          value="€ 2,188.54"
          featured
          trend={{ direction: 'down', value: '↓ 12%', positive: false }}
          meta="vs last month • €8,046 limit"
        />
        <StatCard
          icon={() => <span>👛</span>}
          label="Total Assets"
          value="€ 538.62"
          trend={{ direction: 'up', value: '↑ 8%', positive: true }}
        />
        <StatCard
          icon={() => <span>📈</span>}
          label="Avg. Daily Spend"
          value="€ 222.56"
          meta="Past 7 days"
        />
        <StatCard
          icon={() => <span>💳</span>}
          label="Month Progress"
          value="86%"
          meta="5 days until reset"
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <BalanceOverTimeChart data={balanceHistory} />
        <TopCategoriesChart data={topCategories} />
      </SimpleGrid>

      <RecentActivityTable transactions={initialTransactions.slice(0, 5)} />
    </Stack>
  );
}
