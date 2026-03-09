import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { useDisplayCurrency } from '@/hooks/useDisplayCurrency';
import type { AccountResponse } from '@/types/account';
import { formatCurrency } from '@/utils/currency';

interface AccountSnapshotCardProps {
  account: AccountResponse | undefined;
  isLoading: boolean;
}

export function AccountSnapshotCard({ account, isLoading }: AccountSnapshotCardProps) {
  const { i18n } = useTranslation();
  const globalCurrency = useDisplayCurrency();

  const format = (cents: number) => formatCurrency(cents, globalCurrency, i18n.language);

  if (isLoading || !account) {
    return (
      <Paper withBorder radius="md" p="md" h="100%">
        <Text c="dimmed" size="sm">
          Loading...
        </Text>
      </Paper>
    );
  }

  const changePositive = account.balanceChangeThisPeriod >= 0;

  return (
    <Paper withBorder radius="md" p="md" h="100%">
      <Stack gap="xs">
        <Group gap="xs">
          <Text size="xs" c="dimmed" fw={600} tt="uppercase">
            {account.name}
          </Text>
        </Group>

        <Text size="xl" fw={700} style={{ fontFamily: 'var(--mantine-font-family-monospace)' }}>
          {format(account.balance)}
        </Text>

        <Group gap="xs">
          <ThemeIcon size="xs" variant="light" color={changePositive ? 'green' : 'red'} radius="xl">
            {changePositive ? <IconTrendingUp size={12} /> : <IconTrendingDown size={12} />}
          </ThemeIcon>
          <Text size="xs" c={changePositive ? 'green' : 'red'} fw={500}>
            {format(Math.abs(account.balanceChangeThisPeriod))}
          </Text>
          <Text size="xs" c="dimmed">
            this period
          </Text>
        </Group>

        <Text size="xs" c="dimmed">
          {account.transactionCount} transactions
        </Text>
      </Stack>
    </Paper>
  );
}
