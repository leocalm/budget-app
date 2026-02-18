import React from 'react';
import { Box, Group, SimpleGrid, Stack, Text, Title, useMantineColorScheme } from '@mantine/core';
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
  { categoryName: 'Outros', amountSpent: 284, budgetedValue: 300, percentageSpent: 95 },
  { categoryName: 'Cuidados Pessoais', amountSpent: 246, budgetedValue: 300, percentageSpent: 82 },
  { categoryName: 'Macumba', amountSpent: 234, budgetedValue: 300, percentageSpent: 78 },
  { categoryName: 'Mercado', amountSpent: 225, budgetedValue: 300, percentageSpent: 75 },
  { categoryName: 'iCloud', amountSpent: 135, budgetedValue: 300, percentageSpent: 45 },
];

export function DashboardContainer() {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Box
      style={{
        margin: '0 auto',
        maxWidth: '1100px',
        padding: 'var(--spacing-2xl)',
      }}
    >
      <Stack gap="lg">
        <Group justify="space-between" align="center" mb="md">
          <Title
            order={1}
            style={{
              background: isDark
                ? 'linear-gradient(135deg, var(--text-primary) 0%, var(--accent-primary) 100%)'
                : 'linear-gradient(135deg, var(--text-primary) 0%, var(--accent-primary) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Financial Dashboard
          </Title>
          <Group
            gap="xs"
            p="xs"
            style={{
              borderRadius: 'var(--mantine-radius-md)',
              border: '1px solid var(--border-medium)',
              background: 'var(--bg-card)',
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
    </Box>
  );
}
