import React, { useState } from 'react';
import { IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import {
  ActionIcon,
  Affix,
  Button,
  Drawer,
  Group,
  Stack,
  Transition,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import type { TransactionFilterParams } from '@/api/transaction';
import { StateRenderer, TransactionListSkeleton } from '@/components/Utils';
import { useCreateVendor } from '@/hooks/useVendors';
import { AccountResponse } from '@/types/account';
import { CategoryResponse } from '@/types/category';
import { TransactionRequest, TransactionResponse } from '@/types/transaction';
import { Vendor } from '@/types/vendor';
import { convertDisplayToCents } from '@/utils/currency';
import { formatDateForApi } from '@/utils/date';
import type { EditFormValues } from './Form/EditTransactionForm';
import { MobileTransactionCard } from './List/MobileTransactionCard';
import { PageHeader } from './PageHeader';
import { TransactionFilters } from './TransactionFilters';
import { TransactionModal } from './TransactionModal';
import { TransactionsLedger } from './TransactionsLedger';

export interface TransactionsPageViewProps {
  transactions: TransactionResponse[] | undefined;
  isLocked: boolean;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  insertEnabled: boolean;
  accounts: AccountResponse[] | undefined;
  categories: CategoryResponse[] | undefined;
  vendors: Vendor[] | undefined;
  filters: TransactionFilterParams;
  onFiltersChange: (filters: TransactionFilterParams) => void;
  createTransaction: (payload: TransactionRequest) => Promise<unknown>;
  updateTransaction: (id: string, payload: TransactionRequest) => Promise<unknown>;
  deleteTransaction: (id: string) => Promise<unknown>;
  isFetchingMore?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
}

export const TransactionsPageView = ({
  transactions,
  isLocked,
  isLoading,
  isError,
  onRetry,
  insertEnabled,
  accounts = [],
  categories = [],
  vendors = [],
  filters,
  onFiltersChange,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  isFetchingMore,
  hasNextPage,
  onLoadMore,
}: TransactionsPageViewProps) => {
  const { t } = useTranslation();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const [batchMode, setBatchMode] = useState(false);
  const [modalState, setModalState] = useState<{
    open: boolean;
    transaction: TransactionResponse | null;
  }>({
    open: false,
    transaction: null,
  });
  const [mobileFilterDrawer, { open: openMobileFilter, close: closeMobileFilter }] =
    useDisclosure(false);

  const createVendorMutation = useCreateVendor();

  const openAdd = () => setModalState({ open: true, transaction: null });
  const openEdit = (tx: TransactionResponse) => setModalState({ open: true, transaction: tx });
  const closeModal = () => setModalState({ open: false, transaction: null });

  const handleSaveEdit = async (data: EditFormValues) => {
    let vendorId: string | undefined;
    if (data.categoryType !== 'Transfer' && data.vendorName?.trim()) {
      const existing = vendors.find((v) => v.name.toLowerCase() === data.vendorName.toLowerCase());
      if (existing) {
        vendorId = existing.id;
      } else {
        const created = await createVendorMutation.mutateAsync({ name: data.vendorName.trim() });
        vendorId = created.id;
      }
    }

    const payload: TransactionRequest = {
      description: data.description,
      amount: convertDisplayToCents(data.amount),
      occurredAt: formatDateForApi(data.occurredAt!),
      categoryId: data.categoryId,
      fromAccountId: data.fromAccountId,
      toAccountId: data.categoryType === 'Transfer' ? data.toAccountId : undefined,
      vendorId,
    };

    await updateTransaction(modalState.transaction!.id, payload);
  };

  const headerActions = (
    <Group gap="xs">
      {insertEnabled && (
        <Button size="sm" onClick={openAdd} variant="filled">
          {t('transactions.tableView.addTransaction')}
        </Button>
      )}
      {!isMobile && (
        <Button
          size="sm"
          variant={batchMode ? 'filled' : 'subtle'}
          onClick={() => setBatchMode((v) => !v)}
        >
          {batchMode ? t('states.done') : t('transactions.tableView.batchEntry')}
        </Button>
      )}
      {isMobile && (
        <ActionIcon variant="subtle" onClick={openMobileFilter}>
          {/* Filter icon */}
        </ActionIcon>
      )}
    </Group>
  );

  return (
    <StateRenderer
      variant="page"
      isLocked={isLocked}
      lockMessage={t('states.locked.message.periodRequired')}
      lockAction={{ label: t('states.locked.configure'), to: '/periods' }}
      hasError={isError}
      errorMessage={t('transactions.tableView.error.load')}
      onRetry={onRetry}
      isLoading={isLoading}
      loadingSkeleton={<TransactionListSkeleton count={8} />}
      isEmpty={!transactions || transactions.length === 0}
      emptyItemsLabel={t('states.contract.items.transactions')}
      emptyMessage={t('states.empty.transactions.message')}
      emptyAction={
        insertEnabled && isMobile
          ? { label: t('states.empty.transactions.addTransaction'), onClick: openAdd }
          : undefined
      }
    >
      <Stack gap="md">
        <PageHeader
          title={t('transactions.container.title')}
          subtitle={t('transactions.container.subtitle')}
          actions={headerActions}
        />

        {!isMobile && (
          <TransactionFilters
            filters={filters}
            onChange={onFiltersChange}
            accounts={accounts}
            categories={categories}
            vendors={vendors}
          />
        )}

        {isMobile ? (
          <>
            <Stack gap="xs">
              {transactions?.map((tx) => (
                <MobileTransactionCard key={tx.id} transaction={tx} />
              ))}
            </Stack>

            <Drawer
              opened={mobileFilterDrawer}
              onClose={closeMobileFilter}
              title={t('transactions.filters.title')}
              position="bottom"
              size="60%"
            >
              <TransactionFilters
                filters={filters}
                onChange={onFiltersChange}
                accounts={accounts}
                categories={categories}
                vendors={vendors}
              />
            </Drawer>

            <Affix position={{ bottom: 80, right: 20 }}>
              <Transition transition="slide-up" mounted={insertEnabled}>
                {(styles) => (
                  <ActionIcon
                    color="blue"
                    radius="xl"
                    size={56}
                    style={styles}
                    onClick={openAdd}
                    variant="filled"
                  >
                    <IconPlus size={24} />
                  </ActionIcon>
                )}
              </Transition>
            </Affix>
          </>
        ) : (
          <TransactionsLedger
            transactions={transactions ?? []}
            batchMode={batchMode}
            accounts={accounts}
            categories={categories}
            vendors={vendors}
            onSaveBatch={createTransaction as (payload: TransactionRequest) => Promise<void>}
            onEdit={openEdit}
            onDelete={deleteTransaction as (id: string) => Promise<void>}
            isFetchingMore={isFetchingMore}
            hasNextPage={hasNextPage}
            onLoadMore={onLoadMore}
          />
        )}
      </Stack>

      <TransactionModal
        opened={modalState.open}
        onClose={closeModal}
        transaction={modalState.transaction}
        accounts={accounts}
        categories={categories}
        vendors={vendors}
        onSave={handleSaveEdit}
      />
    </StateRenderer>
  );
};
