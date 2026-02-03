import React from 'react';
import { IconChartBar, IconTrendingUp, IconWallet } from '@tabler/icons-react';
import {
  Grid,
  Group,
  Paper,
  RingProgress,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  useMantineColorScheme,
} from '@mantine/core';
import { BalanceLineChartCard } from '@/components/Dashboard/BalanceLineChartCard';
import { CategoriesChartCard } from '@/components/Dashboard/CategoriesChartCard';
import { RecentTransactionsCard } from '@/components/Dashboard/RecentTransactionsCard';
import { AccountResponse } from '@/types/account';
import { DashboardData } from '@/types/dashboard';
import { convertCentsToDisplay } from '@/utils/currency';

interface DashboardViewProps {
  dashboardData: DashboardData | undefined;
  accounts: AccountResponse[] | undefined;
}

export const DashboardView = ({ dashboardData, accounts }: DashboardViewProps) => {
  const { colorScheme } = useMantineColorScheme();

  return (
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
        {/* Widget 1: Net Worth */}
        <StatWidget
          label="Total Assets"
          value={dashboardData?.totalAsset}
          icon={<IconWallet size={24} />}
          color="blue"
        />

        {/* Widget 2: Remaining Budget */}
        <StatWidget
          label="Remaining Budget"
          value={
            (dashboardData?.monthlyBurnIn.totalBudget || 0) -
            (dashboardData?.monthlyBurnIn.spentBudget || 0)
          }
          icon={<IconTrendingUp size={24} />}
          color={
            (dashboardData?.monthlyBurnIn.spentBudget || 0) >
            (dashboardData?.monthlyBurnIn.totalBudget || 0)
              ? 'red'
              : 'green'
          }
          subText={`of €${convertCentsToDisplay(dashboardData?.monthlyBurnIn.totalBudget || 0).toLocaleString()} limit`}
        />

        {/* Widget 3: Cash Flow (Burn Rate) */}
        <StatWidget
          label="Avg. Daily Spend"
          value={
            (dashboardData?.monthlyBurnIn.spentBudget || 0) /
            (dashboardData?.monthProgress.daysInPeriod ||
              0 - (dashboardData?.monthProgress.remainingDays || 0) ||
              1)
          }
          icon={<IconChartBar size={24} />}
          color="gray"
        />

        {/* Widget 4: Month Progress */}
        <Paper withBorder p="md" radius="md" bg={colorScheme === 'dark' ? 'dark.6' : 'gray.0'}>
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                Month Progress
              </Text>
              <Text size="xl" fw={800}>
                {dashboardData?.monthProgress.daysPassedPercentage}%
              </Text>
            </div>
            <RingProgress
              size={42}
              thickness={4}
              sections={[
                { value: dashboardData?.monthProgress.daysPassedPercentage || 0, color: 'blue' },
              ]}
            />
          </Group>
          <Text size="xs" c="dimmed" mt="xs">
            {dashboardData?.monthProgress.remainingDays} days until reset
          </Text>
        </Paper>
      </SimpleGrid>

      {/* Charts Row */}
      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <BalanceLineChartCard data={dashboardData?.budgetPerDay} accounts={accounts} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <CategoriesChartCard data={dashboardData?.spentPerCategory} />
        </Grid.Col>
      </Grid>

      {/* Activity Row */}
      <RecentTransactionsCard data={dashboardData?.recentTransactions || []} />
    </Stack>
  );
};

// Small helper for consistent stat cards
function StatWidget({ label, value, icon, color, subText }: any) {
  const { colorScheme } = useMantineColorScheme();
  return (
    <Paper withBorder p="md" radius="md" bg={colorScheme === 'dark' ? 'dark.6' : 'gray.0'}>
      <Group justify="space-between">
        <Stack gap={0}>
          <Text size="xs" c="dimmed" fw={700} tt="uppercase">
            {label}
          </Text>
          <Text size="xl" fw={800} style={{ fontFamily: 'monospace' }}>
            €{convertCentsToDisplay(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
        </Stack>
        <ThemeIcon variant="light" color={color} size="lg" radius="md">
          {icon}
        </ThemeIcon>
      </Group>
      {subText && (
        <Text size="xs" c="dimmed" mt={4}>
          {subText}
        </Text>
      )}
    </Paper>
  );
}
