import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActionIcon,
  Affix,
  Box,
  Button,
  Drawer,
  Group,
  Stack,
  Transition,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { StateRenderer, TransactionListSkeleton } from '@/components/Utils';
import { AccountResponse } from '@/types/account';
import { CategoryResponse } from '@/types/category';
import { Transaction, TransactionResponse } from '@/types/transaction';
import { Vendor, VendorInput } from '@/types/vendor';
import { convertCentsToDisplay, convertDisplayToCents } from '@/utils/currency';
import {
  TransactionFormFields,
  TransactionFormProvider,
  TransactionFormValues,
  useTransactionForm,
} from '../Form';
import { MobileTransactionCard, TransactionList } from '../List';

export interface TransactionsTableViewProps {
  transactions: TransactionResponse[] | undefined;
  isLocked: boolean;
  isLoading: boolean | undefined;
  isError: boolean | undefined;
  onRetry: () => void;
  insertEnabled: boolean;

  accounts: AccountResponse[] | undefined;
  categories: CategoryResponse[] | undefined;
  vendors: Vendor[] | undefined;

  createTransaction: (payload: Transaction) => Promise<unknown>;
  deleteTransaction: (id: string) => Promise<unknown>;
  createVendor: (payload: VendorInput) => Promise<Vendor>;
}

export const TransactionsTableView = ({
  transactions,
  isLocked,
  isLoading,
  isError,
  onRetry,
  insertEnabled,
  accounts,
  categories,
  vendors,
  createTransaction,
  deleteTransaction,
  createVendor,
}: TransactionsTableViewProps) => {
  const { t } = useTranslation();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);

  const vendorsByName = useMemo(() => {
    return new Map((vendors || []).map((v) => [v.name, v]));
  }, [vendors]);

  const categoriesByName = useMemo(() => {
    return new Map((categories || []).map((c) => [c.name, c]));
  }, [categories]);

  const accountsByName = useMemo(() => {
    return new Map((accounts || []).map((a) => [a.name, a]));
  }, [accounts]);

  const form = useTransactionForm({
    initialValues: {
      description: '',
      amount: 0,
      occurredAt: '',

      fromAccountName: null,
      toAccountName: null,
      categoryName: null,
      vendorName: '',

      fromAccount: undefined,
      toAccount: undefined,
      category: undefined,
      vendor: undefined,
    },
  });

  useEffect(() => {
    const name = form.values.fromAccountName;
    form.setFieldValue('fromAccount', name ? accountsByName.get(name) : undefined);
  }, [form.values.fromAccountName, accountsByName]);

  useEffect(() => {
    const name = form.values.toAccountName;
    form.setFieldValue('toAccount', name ? accountsByName.get(name) : undefined);
  }, [form.values.toAccountName, accountsByName]);

  useEffect(() => {
    const name = form.values.categoryName;
    form.setFieldValue('category', name ? categoriesByName.get(name) : undefined);
  }, [form.values.categoryName, categoriesByName]);

  const resetForm = () => {
    form.setValues({
      description: '',
      amount: 0,
      occurredAt: '',

      fromAccountName: null,
      toAccountName: null,
      categoryName: null,
      vendorName: '',

      fromAccount: undefined,
      toAccount: undefined,
      category: undefined,
      vendor: undefined,
    });
  };

  const handleSubmit = async (values: TransactionFormValues) => {
    let vendor = values.vendor;

    if (!vendor && values.vendorName.trim()) {
      try {
        vendor = await createVendor({ name: values.vendorName.trim() });
      } catch {
        return;
      }
    }

    const payload: Transaction = {
      description: values.description,
      occurredAt: values.occurredAt,
      category: values.category,
      fromAccount: values.fromAccount,
      toAccount: values.toAccount,
      vendor: vendor || undefined,
      amount: convertDisplayToCents(values.amount),
    };

    try {
      await createTransaction(payload);
      form.reset();
      resetForm();
      closeDrawer();
    } catch {
      // keep silent like before (mutation errors likely handled elsewhere / via notifications)
    }
  };

  const handleEdit = (t: TransactionResponse) => {
    form.setValues({
      description: t.description,
      amount: convertCentsToDisplay(t.amount),
      occurredAt: t.occurredAt,
      fromAccountName: t.fromAccount.name,
      toAccountName: t.toAccount?.name ?? null,
      categoryName: t.category.name,
      vendorName: t.vendor?.name ?? '',
      fromAccount: t.fromAccount,
      toAccount: t.toAccount ?? undefined,
      category: t.category,
      vendor: t.vendor ?? undefined,
    });
    openDrawer();
  };

  return (
    <StateRenderer
      variant="page"
      isLocked={isLocked}
      lockMessage={t('states.locked.message.periodRequired')}
      lockAction={{ label: t('states.locked.configure'), to: '/periods' }}
      hasError={Boolean(isError)}
      errorMessage={t('transactions.tableView.error.load')}
      onRetry={onRetry}
      isLoading={Boolean(isLoading)}
      loadingSkeleton={
        <Group justify="center" py="xl" w="100%">
          <TransactionListSkeleton count={8} />
        </Group>
      }
      isEmpty={!transactions || transactions.length === 0}
      emptyItemsLabel={t('states.contract.items.transactions')}
      emptyMessage={t('states.empty.transactions.message')}
      emptyAction={
        insertEnabled && isMobile
          ? {
              label: t('states.empty.transactions.addTransaction'),
              onClick: openDrawer,
            }
          : undefined
      }
    >
      <Box>
        <TransactionFormProvider form={form}>
          <form key={form.key('root')} onSubmit={form.onSubmit(handleSubmit)}>
            {isMobile ? (
              <Stack gap="xs">
                {transactions?.map((t) => (
                  <MobileTransactionCard key={t.id} transaction={t} />
                ))}

                <Drawer
                  opened={drawerOpened}
                  onClose={closeDrawer}
                  title={t('transactions.tableView.addTransaction')}
                  position="bottom"
                  size="80%"
                  padding="md"
                >
                  <Stack gap="xl">
                    <TransactionFormFields
                      accounts={accounts}
                      categories={categories}
                      vendors={vendors}
                      accountsByName={accountsByName}
                      categoriesByName={categoriesByName}
                      vendorsByName={vendorsByName}
                      size="sm"
                    />
                    <Button type="submit" fullWidth leftSection={<span>➕</span>}>
                      {t('transactions.tableView.createTransaction')}
                    </Button>
                  </Stack>
                </Drawer>

                <Affix position={{ bottom: 80, right: 20 }}>
                  <Transition transition="slide-up" mounted={insertEnabled && !drawerOpened}>
                    {(transitionStyles) => (
                      <ActionIcon
                        color="blue"
                        radius="xl"
                        size={56}
                        style={transitionStyles}
                        onClick={openDrawer}
                        variant="filled"
                      >
                        <span style={{ fontSize: 28 }}>➕</span>
                      </ActionIcon>
                    )}
                  </Transition>
                </Affix>
              </Stack>
            ) : (
              <TransactionList
                transactions={transactions}
                deleteTransaction={deleteTransaction}
                editTransaction={handleEdit}
              />
            )}
          </form>
        </TransactionFormProvider>
      </Box>
    </StateRenderer>
  );
};
