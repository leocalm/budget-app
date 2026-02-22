import { Stack } from '@mantine/core';
import { BasicAppShell } from '@/AppShell';
import { TransactionsContainer } from '@/components/Transactions';

export function TransactionsPage() {
  return (
    <BasicAppShell>
      <Stack gap="md" w="100%">
        <TransactionsContainer />
      </Stack>
    </BasicAppShell>
  );
}
