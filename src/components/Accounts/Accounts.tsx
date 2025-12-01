import { useState } from 'react';
import { Stack } from '@mantine/core';
import { AccountsTable } from '@/components/Accounts/AccountsTable';
import { CreateAccount } from '@/components/Accounts/CreateAccount';

export function Accounts() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAccountCreated = () => {
    setRefreshKey((prev) => prev + 1); // Trigger refresh
  };

  return (
    <Stack gap="lg">
      <CreateAccount onAccountCreated={handleAccountCreated} />
      <AccountsTable key={refreshKey} />
    </Stack>
  );
}
