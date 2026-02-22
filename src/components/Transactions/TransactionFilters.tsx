import React from 'react';
import { IconFilter } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Group,
  MultiSelect,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import type { TransactionFilterParams } from '@/api/transaction';
import { AccountResponse } from '@/types/account';
import { CategoryResponse } from '@/types/category';
import { Vendor } from '@/types/vendor';

interface TransactionFiltersProps {
  filters: TransactionFilterParams;
  onChange: (filters: TransactionFilterParams) => void;
  accounts: AccountResponse[];
  categories: CategoryResponse[];
  vendors: Vendor[];
}

const DIRECTIONS = [
  { label: 'All', value: 'all' },
  { label: 'In', value: 'Incoming' },
  { label: 'Out', value: 'Outgoing' },
  { label: 'Transfer', value: 'Transfer' },
];

const isEmpty = (f: TransactionFilterParams) =>
  (!f.direction || f.direction === 'all') &&
  !f.accountIds?.length &&
  !f.categoryIds?.length &&
  !f.vendorIds?.length &&
  !f.dateFrom &&
  !f.dateTo;

export const TransactionFilters = ({
  filters,
  onChange,
  accounts,
  categories,
  vendors,
}: TransactionFiltersProps) => {
  const { t } = useTranslation();

  const set = (patch: Partial<TransactionFilterParams>) => onChange({ ...filters, ...patch });

  return (
    <Stack gap="sm">
      <Group align="flex-end" gap="md" wrap="wrap">
        <div>
          <Text size="xs" c="dimmed" mb={4}>
            {t('transactions.filters.direction')}
          </Text>
          <SegmentedControl
            size="xs"
            data={DIRECTIONS}
            value={filters.direction ?? 'all'}
            onChange={(val) => set({ direction: val as TransactionFilterParams['direction'] })}
          />
        </div>

        <MultiSelect
          label={t('transactions.filters.accounts')}
          data={accounts.map((a) => ({ value: a.id, label: a.name }))}
          value={filters.accountIds ?? []}
          onChange={(val) => set({ accountIds: val })}
          placeholder={t('transactions.filters.allAccounts')}
          searchable
          size="xs"
          w={200}
          clearable
        />

        <MultiSelect
          label={t('transactions.filters.categories')}
          data={categories.map((c) => ({ value: c.id, label: `${c.icon} ${c.name}` }))}
          value={filters.categoryIds ?? []}
          onChange={(val) => set({ categoryIds: val })}
          placeholder={t('transactions.filters.allCategories')}
          searchable
          size="xs"
          w={200}
          clearable
        />

        <MultiSelect
          label={t('transactions.filters.vendors')}
          data={vendors.map((v) => ({ value: v.id, label: v.name }))}
          value={filters.vendorIds ?? []}
          onChange={(val) => set({ vendorIds: val })}
          placeholder={t('transactions.filters.allVendors')}
          searchable
          size="xs"
          w={160}
          clearable
        />

        <TextInput
          label={t('transactions.filters.dateFrom')}
          placeholder="YYYY-MM-DD"
          size="xs"
          w={130}
          value={filters.dateFrom ?? ''}
          onChange={(e) => set({ dateFrom: e.currentTarget.value || null })}
        />

        <TextInput
          label={t('transactions.filters.dateTo')}
          placeholder="YYYY-MM-DD"
          size="xs"
          w={130}
          value={filters.dateTo ?? ''}
          onChange={(e) => set({ dateTo: e.currentTarget.value || null })}
        />

        {!isEmpty(filters) && (
          <Button
            size="xs"
            variant="subtle"
            color="gray"
            leftSection={<IconFilter size={14} />}
            onClick={() => onChange({ direction: 'all' })}
            style={{ alignSelf: 'flex-end' }}
          >
            {t('transactions.filters.clearAll')}
          </Button>
        )}
      </Group>
    </Stack>
  );
};
