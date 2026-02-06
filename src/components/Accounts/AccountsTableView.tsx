import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Drawer, Modal, SimpleGrid, useMantineTheme } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { EmptyState, LoadingState } from '@/components/Utils';
import type { AccountResponse } from '@/types/account';
import { AccountCard } from './AccountCard';
import { EditAccountForm } from './EditAccountForm';

interface AccountsTableViewProps {
  accounts: AccountResponse[] | undefined;
  isLoading: boolean;
  onDelete: (id: string) => void;
  onAccountUpdated: () => void;
  onViewDetails?: (account: AccountResponse) => void;
  onAddAccount?: () => void;
}

export function AccountsTableView({
  accounts,
  isLoading,
  onDelete,
  onAccountUpdated,
  onViewDetails,
  onAddAccount,
}: AccountsTableViewProps) {
  const { t } = useTranslation();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [selected, setSelected] = useState<AccountResponse | null>(null);

  if (isLoading) {
    return <LoadingState variant="spinner" text={t('states.loading.default')} />;
  }

  if (!accounts || accounts.length === 0) {
    return (
      <EmptyState
        icon="🏦"
        title={t('states.empty.accounts.title')}
        message={t('states.empty.accounts.message')}
        primaryAction={
          onAddAccount
            ? {
                label: t('states.empty.accounts.addAccount'),
                icon: <span>+</span>,
                onClick: onAddAccount,
              }
            : undefined
        }
      />
    );
  }

  return (
    <>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        {accounts?.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            balanceHistory={account.balancePerDay}
            monthlySpent={account.balanceChangeThisPeriod}
            transactionCount={account.transactionCount}
            onEdit={(acc) => {
              setSelected(acc);
              openEdit();
            }}
            onDelete={() => onDelete(account.id)}
            onViewDetails={() => onViewDetails?.(account)}
          />
        ))}
      </SimpleGrid>
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
    </>
  );
}
