import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Autocomplete,
  Box,
  Group,
  NumberInput,
  Select,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { UI } from '@/constants';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { useAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';
import { useCreateTransactionFromRequest } from '@/hooks/useTransactions';
import { useCreateVendor, useVendors } from '@/hooks/useVendors';
import { TransactionRequest } from '@/types/transaction';
import { convertDisplayToCents } from '@/utils/currency';
import { formatDateForApi } from '@/utils/date';
import { getIcon, iconMap } from '@/utils/IconMap';
import styles from './QuickAddTransaction.module.css';

interface QuickAddTransactionProps {
  onSuccess?: () => void;
  defaultDate?: Date;
}

interface FormValues {
  description: string;
  amount: number | '';
  occurredAt: Date | null;
  categoryId: string;
  fromAccountId: string;
  toAccountId: string;
  vendorName: string;
}

const inputClassNames = { input: styles.input };

const renderAccountIcon = (icon?: string) => {
  if (icon && iconMap[icon]) {
    return getIcon(icon, 16);
  }

  if (icon) {
    return <span aria-hidden>{icon}</span>;
  }

  return getIcon('wallet', 16);
};

export const QuickAddTransaction = ({
  onSuccess,
  defaultDate = new Date(),
}: QuickAddTransactionProps) => {
  const { t } = useTranslation();

  const descriptionRef = useRef<HTMLInputElement>(null);

  const { selectedPeriodId } = useBudgetPeriodSelection();

  // Data fetching
  const { data: accounts = [] } = useAccounts(selectedPeriodId);
  const { data: categories = [] } = useCategories(selectedPeriodId);
  const { data: vendors = [] } = useVendors(selectedPeriodId);

  // Mutations
  const { mutate: createTransaction, isPending } = useCreateTransactionFromRequest();
  const createVendor = useCreateVendor();

  const [categoryType, setCategoryType] = useState('Outgoing');

  // Form state
  const form = useForm<FormValues>({
    initialValues: {
      description: '',
      amount: '',
      occurredAt: defaultDate,
      categoryId: '',
      fromAccountId: '',
      toAccountId: '',
      vendorName: '',
    },
    validate: {
      description: (value) => {
        if (!value || value.trim().length === 0) {
          return t('transactions.quickAddTransaction.error.description.required');
        }
        if (value.length > UI.DESCRIPTION_MAX_LENGTH) {
          return t('transactions.quickAddTransaction.error.description.maxLength');
        }
        return null;
      },
      amount: (value) => {
        if (value === '') {
          return t('transactions.quickAddTransaction.error.amount.required');
        }
        if (value <= 0) {
          return t('transactions.quickAddTransaction.error.amount.greaterThanZero');
        }
        return null;
      },
      occurredAt: (value) =>
        !value ? t('transactions.quickAddTransaction.error.occurredAt.required') : null,
      fromAccountId: (value) =>
        !value ? t('transactions.quickAddTransaction.error.fromAccount.required') : null,
      categoryId: (value) =>
        !value ? t('transactions.quickAddTransaction.error.category.required') : null,
      toAccountId: (value, values) => {
        const category = categories.find((c) => c.id === values.categoryId);
        if (category?.categoryType === 'Transfer' && !value) {
          return t('transactions.quickAddTransaction.error.toAccount.required');
        }
        return null;
      },
    },
  });

  // Handle form submission
  const handleSubmit = form.onSubmit(async (values) => {
    let vendorId: string | undefined = undefined;
    if (values.vendorName.trim()) {
      const existingVendor = vendors.find(
        (v) => v.name.toLowerCase() === values.vendorName.toLowerCase()
      );
      if (existingVendor) {
        vendorId = existingVendor?.id;
      } else {
        const newVendor = await createVendor.mutateAsync({
          name: values.vendorName.trim(),
        });
        vendorId = newVendor.id;
      }
    }

    const transactionData: TransactionRequest = {
      description: values.description.trim(),
      amount: convertDisplayToCents(Number(values.amount)),
      occurredAt: formatDateForApi(values.occurredAt!),
      categoryId: values.categoryId,
      fromAccountId: values.fromAccountId,
      toAccountId: categoryType === 'Transfer' ? values.toAccountId : undefined,
      vendorId,
    };

    createTransaction(transactionData, {
      onSuccess: () => {
        notifications.show({
          title: t('common.success'),
          message: t('transactions.quickAddTransaction.success'),
          color: 'green',
        });
        form.reset();
        setTimeout(() => descriptionRef.current?.focus(), 100);
        onSuccess?.();
      },
      onError: (error: Error) => {
        notifications.show({
          title: t('common.error'),
          message: error.message || t('transactions.quickAddTransaction.error.create'),
          color: 'red',
        });
      },
    });
  });

  // Handle suggestion click
  const handleSuggestionClick = (vendor: string) => {
    form.setFieldValue('vendorName', vendor);
    setTimeout(() => descriptionRef.current?.focus(), 100);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      form.reset();
      descriptionRef.current?.focus();
    }
  };

  // Autofocus on mount
  useEffect(() => {
    descriptionRef.current?.focus();
  }, []);

  // Get recent vendors for suggestions
  const recentVendors = vendors.slice(0, UI.RECENT_VENDORS_LIMIT);

  const onCategoryChanged = (value: string | null) => {
    form.setFieldValue('categoryId', value || '');
    const category = categories.find((category) => category.id === value);
    if (category) {
      setCategoryType(category.categoryType);
    }
  };

  const renderAccountOption = ({ option }: { option: { value: string; label: string } }) => {
    const account = accounts.find((acc) => acc.id === option.value);

    return (
      <Group gap="xs" wrap="nowrap">
        {renderAccountIcon(account?.icon)}
        <span>{option.label}</span>
      </Group>
    );
  };

  return (
    <Box className={styles.container} onKeyDown={handleKeyDown}>
      {/* Header */}
      <Group justify="space-between" mb="md">
        <Group gap="sm">
          <Text className={styles.headerIcon}>⚡</Text>
          <Text fw={700} size="md" className={styles.headerTitle}>
            {t('transactions.quickAddTransaction.title')}
          </Text>
        </Group>
        <Text size="xs" className={styles.hint}>
          {t('transactions.quickAddTransaction.hint')}
        </Text>
      </Group>

      {/* Form */}
      <form onSubmit={handleSubmit} aria-label="Quick add transaction form">
        <Box className={styles.formGrid}>
          {/* Date */}
          <DateInput
            placeholder={t('transactions.quickAddTransaction.date.placeholder')}
            value={form.values.occurredAt}
            onChange={(value) => form.setFieldValue('occurredAt', value as Date | null)}
            error={form.errors.occurredAt}
            valueFormat="YYYY-MM-DD"
            classNames={inputClassNames}
          />

          {/* Description */}
          <TextInput
            ref={descriptionRef}
            placeholder={t('transactions.quickAddTransaction.description.placeholder')}
            value={form.values.description}
            onChange={(e) => form.setFieldValue('description', e.currentTarget.value)}
            error={form.errors.description}
            classNames={inputClassNames}
          />

          {/* Amount */}
          <NumberInput
            placeholder="0.00"
            value={form.values.amount}
            onChange={(value) => form.setFieldValue('amount', value === '' ? '' : Number(value))}
            error={form.errors.amount}
            decimalScale={2}
            fixedDecimalScale
            hideControls
            classNames={inputClassNames}
          />

          {/* From Account */}
          <Select
            placeholder={t('transactions.quickAddTransaction.fromAccount.placeholder')}
            value={form.values.fromAccountId}
            onChange={(value) => form.setFieldValue('fromAccountId', value || '')}
            data={accounts.map((acc) => ({
              value: acc.id,
              label: acc.name,
            }))}
            renderOption={renderAccountOption}
            error={form.errors.fromAccountId}
            searchable
            classNames={inputClassNames}
          />

          {/* To Account */}
          {categoryType === 'Transfer' && (
            <Select
              placeholder={t('transactions.quickAddTransaction.toAccount.placeholder')}
              value={form.values.toAccountId}
              onChange={(value) => form.setFieldValue('toAccountId', value || '')}
              data={accounts.map((acc) => ({
                value: acc.id,
                label: acc.name,
              }))}
              renderOption={renderAccountOption}
              error={form.errors.toAccountId}
              searchable
              classNames={inputClassNames}
            />
          )}

          {/* Category */}
          <Select
            placeholder={t('transactions.quickAddTransaction.category.placeholder')}
            value={form.values.categoryId}
            onChange={onCategoryChanged}
            data={categories.map((cat) => ({
              value: cat.id,
              label: `${cat.icon} ${cat.name}`,
            }))}
            error={form.errors.categoryId}
            searchable
            classNames={inputClassNames}
          />

          {/* Vendor */}
          {categoryType !== 'Transfer' && (
            <Autocomplete
              placeholder={t('transactions.quickAddTransaction.vendor.placeholder')}
              value={form.values.vendorName}
              data={(vendors || []).map((v) => v.name)}
              onChange={(value) => form.setFieldValue('vendorName', value)}
              classNames={inputClassNames}
            />
          )}

          {/* Submit Button */}
          <UnstyledButton
            type="submit"
            disabled={isPending}
            aria-label="plus"
            className={styles.submitButton}
          >
            <span>+</span>
          </UnstyledButton>
        </Box>
      </form>

      {/* Suggestion Chips */}
      {recentVendors.length > 0 && (
        <Box mt="md" pt="md" className={styles.suggestionSection}>
          <Group gap="sm" wrap="wrap">
            <Text size="xs" fw={600} tt="uppercase" className={styles.suggestionLabel}>
              {t('transactions.quickAddTransaction.recent')}:
            </Text>

            {recentVendors.map((vendor) => (
              <UnstyledButton
                key={vendor.id}
                onClick={() => handleSuggestionClick(vendor.name)}
                className={styles.suggestionChip}
              >
                {vendor.name}
              </UnstyledButton>
            ))}
          </Group>
        </Box>
      )}
    </Box>
  );
};
