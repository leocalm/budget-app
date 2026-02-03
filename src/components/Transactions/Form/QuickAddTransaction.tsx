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
import { useAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';
import { useCreateTransactionFromRequest } from '@/hooks/useTransactions';
import { useCreateVendor, useVendors } from '@/hooks/useVendors';
import { TransactionRequest } from '@/types/transaction';
import { convertDisplayToCents } from '@/utils/currency';

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

const inputStyles = {
  input: {
    padding: '12px 14px',
    background: '#1e2433',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '14px',
    fontFamily: "'Sora', sans-serif",
    transition: 'all 0.2s ease',
    '&:focus': {
      borderColor: '#00d4ff',
      boxShadow: '0 0 0 3px rgba(0, 212, 255, 0.1)',
      background: '#151b26',
    },
    '&::placeholder': {
      color: '#5a6272',
    },
  },
};

export const QuickAddTransaction = ({
  onSuccess,
  defaultDate = new Date(),
}: QuickAddTransactionProps) => {
  const { t } = useTranslation();

  const descriptionRef = useRef<HTMLInputElement>(null);

  // Data fetching
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const { data: vendors = [] } = useVendors();

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
      occurredAt: values.occurredAt!.toISOString().split('T')[0],
      categoryId: values.categoryId,
      fromAccountId: values.fromAccountId,
      toAccountId: values.toAccountId,
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
  const handleKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
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

  return (
    <Box
      style={{
        background: '#151b26',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px',
        boxShadow: '0 4px 16px rgba(0, 212, 255, 0.08)',
      }}
    >
      {/* Header */}
      <Group justify="space-between" mb="md">
        <Group gap="sm">
          <Text style={{ fontSize: '20px' }}>⚡</Text>
          <Text fw={700} size="md" style={{ color: '#ffffff' }}>
            {t('transactions.quickAddTransaction.title')}
          </Text>
        </Group>
        <Text
          size="xs"
          style={{
            color: '#5a6272',
            fontFamily: "'JetBrains Mono', monospace",
          }}
          className="quick-add-hint"
        >
          {t('transactions.quickAddTransaction.hint')}
        </Text>
      </Group>

      {/* Form */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: '140px 2fr 120px 1fr 1fr 1fr 48px',
            gap: '8px',
            alignItems: 'flex-start',
          }}
          className="form-row"
        >
          {/* Date */}
          <DateInput
            placeholder={t('transactions.quickAddTransaction.date.placeholder')}
            value={form.values.occurredAt}
            onChange={(value) => form.setFieldValue('occurredAt', value as Date | null)}
            error={form.errors.occurredAt}
            valueFormat="YYYY-MM-DD"
            styles={inputStyles}
          />

          {/* Description */}
          <TextInput
            ref={descriptionRef}
            placeholder={t('transactions.quickAddTransaction.description.placeholder')}
            value={form.values.description}
            onChange={(e) => form.setFieldValue('description', e.currentTarget.value)}
            error={form.errors.description}
            styles={inputStyles}
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
            styles={inputStyles}
          />

          {/* From Account */}
          <Select
            placeholder={t('transactions.quickAddTransaction.fromAccount.placeholder')}
            value={form.values.fromAccountId}
            onChange={(value) => form.setFieldValue('fromAccountId', value || '')}
            data={accounts.map((acc) => ({
              value: acc.id,
              label: `${acc.icon} ${acc.name}`,
            }))}
            error={form.errors.fromAccountId}
            searchable
            styles={inputStyles}
          />

          {/* To Account */}
          {categoryType === 'Transfer' && (
            <Select
              placeholder={t('transactions.quickAddTransaction.toAccount.placeholder')}
              value={form.values.toAccountId}
              onChange={(value) => form.setFieldValue('toAccountId', value || '')}
              data={accounts.map((acc) => ({
                value: acc.id,
                label: `${acc.icon} ${acc.name}`,
              }))}
              error={form.errors.toAccountId}
              searchable
              styles={inputStyles}
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
            styles={inputStyles}
          />

          {/* Vendor */}
          {categoryType !== 'Transfer' && (
            <Autocomplete
              placeholder={t('transactions.quickAddTransaction.vendor.placeholder')}
              value={form.values.vendorName}
              data={(vendors || []).map((v) => v.name)}
              onChange={(value) => form.setFieldValue('vendorName', value)}
              styles={inputStyles}
            />
          )}

          {/* Submit Button */}
          <UnstyledButton
            type="submit"
            disabled={isPending}
            aria-label="plus"
            style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #00d4ff 0%, #b47aff 100%)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '24px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 212, 255, 0.3)',
              opacity: isPending ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 212, 255, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 212, 255, 0.3)';
            }}
          >
            <span>+</span>
          </UnstyledButton>
        </Box>
      </form>

      {/* Suggestion Chips */}
      {recentVendors.length > 0 && (
        <Box mt="md" pt="md" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <Group gap="sm" wrap="wrap">
            <Text
              size="xs"
              fw={600}
              tt="uppercase"
              style={{
                color: '#5a6272',
                letterSpacing: '0.05em',
              }}
            >
              {t('transactions.quickAddTransaction.recent')}:
            </Text>

            {recentVendors.map((vendor) => (
              <UnstyledButton
                key={vendor.id}
                onClick={() => handleSuggestionClick(vendor.name)}
                style={{
                  padding: '6px 12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#8892a6',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)';
                  e.currentTarget.style.borderColor = '#00d4ff';
                  e.currentTarget.style.color = '#00d4ff';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.color = '#8892a6';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
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
