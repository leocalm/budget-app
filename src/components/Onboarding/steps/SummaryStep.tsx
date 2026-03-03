import { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
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
  if (model.mode === 'manual') {
    return 'Manual periods';
  }
  const schedule = model.schedule;
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
      <Stack gap={4}>
        <Title order={3}>You&apos;re all set</Title>
        <Text size="sm" c="dimmed">
          Here&apos;s what will be configured when you enter PiggyPulse.
        </Text>
      </Stack>

      {/* Period section */}
      <Card withBorder radius="md" p="md">
        <Stack gap="xs">
          <Text size="xs" tt="uppercase" fw={600} c="dimmed" lts={0.5}>
            Period
          </Text>
          {periodModel && <Text fw={500}>{periodSummary(periodModel)}</Text>}
        </Stack>
      </Card>

      {/* Accounts section */}
      <Card withBorder radius="md" p="md">
        <Stack gap="sm">
          <Text size="xs" tt="uppercase" fw={600} c="dimmed" lts={0.5}>
            Accounts
          </Text>
          {accounts.map((account, i) => (
            <Stack key={account.id} gap={0}>
              {i > 0 && <Divider mb="sm" />}
              <Group justify="space-between" wrap="nowrap">
                <Stack gap={2}>
                  <Text fw={500} size="sm">
                    {account.name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {account.accountType}
                  </Text>
                </Stack>
                <Text fw={500} size="sm" style={{ whiteSpace: 'nowrap' }}>
                  {formatBalance(
                    account.balance,
                    account.currency.symbol,
                    account.currency.decimalPlaces
                  )}
                </Text>
              </Group>
            </Stack>
          ))}
        </Stack>
      </Card>

      {/* Categories section */}
      <Card withBorder radius="md" p="md">
        <Stack gap="sm">
          <Text size="xs" tt="uppercase" fw={600} c="dimmed" lts={0.5}>
            Categories
          </Text>
          <SimpleGrid cols={2} spacing="sm">
            {incoming.length > 0 && (
              <Stack gap="xs">
                <Text size="xs" fw={600} c="teal">
                  Incoming
                </Text>
                {incoming.map((c) => (
                  <Badge key={c.id} variant="light" color="teal" size="sm" radius="sm">
                    {c.name}
                  </Badge>
                ))}
              </Stack>
            )}
            {outgoing.length > 0 && (
              <Stack gap="xs">
                <Text size="xs" fw={600} c="red">
                  Outgoing
                </Text>
                {outgoing.map((c) => (
                  <Badge key={c.id} variant="light" color="red" size="sm" radius="sm">
                    {c.name}
                  </Badge>
                ))}
              </Stack>
            )}
          </SimpleGrid>
        </Stack>
      </Card>

      <Group justify="space-between" mt="md">
        <Button variant="default" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onEnter}>Enter PiggyPulse</Button>
      </Group>
    </Stack>
  );
}
