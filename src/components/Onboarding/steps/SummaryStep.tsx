import { useEffect, useState } from 'react';
import { Button, Group, Loader, Stack, Text, Title } from '@mantine/core';
import { fetchAccountsManagement } from '@/api/account';
import { fetchCategoriesForManagement } from '@/api/category';
import { fetchPeriodModel } from '@/api/settings';
import type { AccountManagementResponse } from '@/types/account';
import type { CategoryManagementRow } from '@/types/category';
import type { PeriodModelResponse } from '@/types/settings';

interface Props {
  onEnter: () => void;
  onBack: () => void;
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

function formatBalance(cents: number, symbol: string, decimalPlaces: number): string {
  const divisor = 10 ** decimalPlaces;
  const value = cents / divisor;
  return `${symbol}${value.toFixed(decimalPlaces)}`;
}

const ADJECTIVAL_UNITS: Record<string, string> = {
  days: 'Daily',
  weeks: 'Weekly',
  months: 'Monthly',
  years: 'Yearly',
};

function periodSummary(model: PeriodModelResponse): string {
  if (model.periodMode === 'manual') {
    return 'Manual periods';
  }
  const schedule = model.periodSchedule;
  if (!schedule) {
    return 'Automatic periods';
  }
  const unitKey = schedule.durationUnit.toLowerCase();
  let label: string;
  if (schedule.durationValue === 1 && ADJECTIVAL_UNITS[unitKey]) {
    label = ADJECTIVAL_UNITS[unitKey];
  } else {
    const plural = `${schedule.durationValue} ${unitKey}`;
    label = plural.charAt(0).toUpperCase() + plural.slice(1);
  }
  return `${label}, starting on the ${ordinal(schedule.startDay)}`;
}

export function SummaryStep({ onEnter, onBack }: Props) {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<AccountManagementResponse[]>([]);
  const [incoming, setIncoming] = useState<CategoryManagementRow[]>([]);
  const [outgoing, setOutgoing] = useState<CategoryManagementRow[]>([]);
  const [periodModel, setPeriodModel] = useState<PeriodModelResponse | null>(null);

  useEffect(() => {
    Promise.all([
      fetchAccountsManagement(),
      fetchCategoriesForManagement(),
      fetchPeriodModel(),
    ]).then(([accts, cats, period]) => {
      setAccounts(accts.filter((a) => !a.isArchived));
      setIncoming(cats.incoming);
      setOutgoing(cats.outgoing);
      setPeriodModel(period);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <Group justify="center" p="xl">
        <Loader />
      </Group>
    );
  }

  return (
    <Stack gap="lg">
      <Title order={3}>You&apos;re all set!</Title>

      {/* Period section */}
      <Stack gap="xs">
        <Text fw={600}>Period</Text>
        {periodModel && <Text>{periodSummary(periodModel)}</Text>}
      </Stack>

      {/* Accounts section */}
      <Stack gap="xs">
        <Text fw={600}>Accounts</Text>
        {accounts.map((account) => (
          <Group key={account.id} justify="space-between">
            <Text>{account.name}</Text>
            <Text c="dimmed" size="sm">
              {account.accountType} &mdash;{' '}
              {formatBalance(
                account.balance,
                account.currency.symbol,
                account.currency.decimalPlaces
              )}
            </Text>
          </Group>
        ))}
      </Stack>

      {/* Categories section */}
      <Stack gap="xs">
        <Text fw={600}>Categories</Text>
        {incoming.length > 0 && (
          <Stack gap={2}>
            <Text size="sm" c="dimmed" tt="uppercase">
              Incoming
            </Text>
            {incoming.map((c) => (
              <Text key={c.id}>{c.name}</Text>
            ))}
          </Stack>
        )}
        {outgoing.length > 0 && (
          <Stack gap={2}>
            <Text size="sm" c="dimmed" tt="uppercase">
              Outgoing
            </Text>
            {outgoing.map((c) => (
              <Text key={c.id}>{c.name}</Text>
            ))}
          </Stack>
        )}
      </Stack>

      <Group justify="space-between" mt="md">
        <Button variant="default" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onEnter}>Enter PiggyPulse</Button>
      </Group>
    </Stack>
  );
}
