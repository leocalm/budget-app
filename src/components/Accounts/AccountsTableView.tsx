import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Drawer, Modal, SimpleGrid, Text, useMantineTheme } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { CardSkeleton, StateRenderer } from '@/components/Utils';
import type { AccountResponse } from '@/types/account';
import { AccountCard } from './AccountCard';
import { EditAccountForm } from './EditAccountForm';

interface AccountsTableViewProps {
  accounts: AccountResponse[] | undefined;
  isLocked: boolean;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onDelete: (id: string) => void;
  onAccountUpdated: () => void;
  onViewDetails?: (account: AccountResponse) => void;
  onAddAccount?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

export function AccountsTableView({
  accounts,
  isLocked,
  isLoading,
  isError,
  onRetry,
  onDelete,
  onAccountUpdated,
  onViewDetails,
  onAddAccount,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
}: AccountsTableViewProps) {
  const { t } = useTranslation();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [selected, setSelected] = useState<AccountResponse | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Intersection Observer for scroll-triggered load more
  useEffect(() => {
    if (!hasMore || isLoadingMore || !onLoadMore) {
      return;
    }

    const node = sentinelRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: '200px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, onLoadMore, accounts?.length]);

  return (
    <StateRenderer
      variant="page"
      isLocked={isLocked}
      lockMessage={t('states.locked.message.periodRequired')}
      lockAction={{ label: t('states.locked.configure'), to: '/periods' }}
      hasError={isError}
      errorMessage={t('states.error.loadFailed.message')}
      onRetry={onRetry}
      isLoading={isLoading}
      loadingSkeleton={
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg" w="100%">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <CardSkeleton key={item} />
          ))}
        </SimpleGrid>
      }
      isEmpty={!accounts || accounts.length === 0}
      emptyItemsLabel={t('states.contract.items.accounts')}
      emptyMessage={t('states.empty.accounts.message')}
      emptyAction={
        onAddAccount
          ? {
              label: t('states.empty.accounts.addAccount'),
              onClick: onAddAccount,
            }
          : undefined
      }
    >
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

        {(hasMore || isLoadingMore) && (
          <Box
            ref={sentinelRef}
            style={{
              padding: '12px 16px 20px',
              textAlign: 'center',
            }}
          >
            <Text size="sm" c="dimmed">
              {isLoadingMore ? t('states.loading.default') : ''}
            </Text>
          </Box>
        )}

        {isMobile ? (
          <Drawer
            opened={editOpened}
            onClose={closeEdit}
            title={t('accounts.table.editTitle')}
            position="bottom"
          >
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
          <Modal
            opened={editOpened}
            onClose={closeEdit}
            title={t('accounts.table.editTitle')}
            centered
          >
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
    </StateRenderer>
  );
}
