import { IconArrowRight } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { Button, Group, Paper, Text, useMantineColorScheme } from '@mantine/core';
import { TransactionsTable } from '@/components/Transactions';
import { TransactionResponse } from '@/types/transaction';

interface RecentTransactionsCardProps {
  data: TransactionResponse[];
}

export function RecentTransactionsCard({ data }: RecentTransactionsCardProps) {
  const { colorScheme } = useMantineColorScheme();

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
      <Group justify="space-between" mb="md">
        <Text fw={600} size="lg">
          Recent Activity
        </Text>
        <Button
          component={Link}
          to="/transactions"
          variant="subtle"
          size="xs"
          rightSection={<IconArrowRight size={14} />}
        >
          View All
        </Button>
      </Group>

      <TransactionsTable
        transactions={data}
        isError={false}
        isLoading={false}
        insertEnabled={false}
      />
    </Paper>
  );
}
