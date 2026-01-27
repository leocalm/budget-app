import React, { useState } from 'react';
import { Drawer, Modal, SimpleGrid, Text, useMantineTheme } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import type { AccountResponse } from '@/types/account';
import { AccountCard } from './AccountCard';
import { EditAccountForm } from './EditAccountForm';

export interface AccountStats {
  balanceHistory: { date: string; balance: number }[];
  monthlySpent: number;
  transactionCount: number;
}

interface AccountsTableViewProps {
  accounts: AccountResponse[] | undefined;
  isLoading: boolean;
  onDelete: (id: string) => void;
  onAccountUpdated: () => void;
  accountStats?: Record<string, AccountStats>;
  onViewDetails?: (account: AccountResponse) => void;
}

export function AccountsTableView({
  accounts,
  isLoading,
  onDelete,
  onAccountUpdated,
  accountStats = {},
  onViewDetails,
}: AccountsTableViewProps) {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [selected, setSelected] = useState<AccountResponse | null>(null);

  if (isLoading) {
    return <Text>Loading accounts...</Text>;
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
      {accounts?.map((account) => {
        const stats = accountStats[account.id] || {
          balanceHistory: [],
          monthlySpent: 0,
          transactionCount: 0,
        };
        return (
          <AccountCard
            key={account.id}
            account={account}
            balanceHistory={stats.balanceHistory}
            monthlySpent={stats.monthlySpent}
            transactionCount={stats.transactionCount}
            onEdit={(account) => {
              setSelected(account);
              openEdit();
            }}
            onDelete={() => onDelete(account.id)}
            onViewDetails={() => onViewDetails?.(account)}
          />
        );
      })}
      {isMobile ? (
        <Drawer opened={editOpened} onClose={closeEdit} title="Edit Account" position="bottom">
          <div>
            {selected && (
              <EditAccountForm
                account={selected}
                onUpdated={() => {
                  closeEdit();
                  setSelected(null);
                  onAccountUpdated();
                }}
              />
            )}
          </div>
        </Drawer>
      ) : (
        <Modal opened={editOpened} onClose={closeEdit} title="Edit Account" centered>
          {selected && (
            <EditAccountForm
              account={selected}
              onUpdated={() => {
                closeEdit();
                setSelected(null);
                onAccountUpdated();
              }}
            />
          )}
        </Modal>
      )}
    </SimpleGrid>
  );
}
