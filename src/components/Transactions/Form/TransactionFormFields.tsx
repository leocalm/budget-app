import React from 'react';
import {
  IconBriefcase,
  IconCalendar,
  IconCurrencyEuro,
  IconPlus,
  IconTag,
  IconTruckDelivery,
} from '@tabler/icons-react';
import {
  ActionIcon,
  Autocomplete,
  Grid,
  NumberInput,
  SegmentedControl,
  Select,
  Stack,
  TextInput,
  useMantineTheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { AccountResponse } from '@/types/account';
import { CategoryResponse } from '@/types/category';
import { Vendor } from '@/types/vendor';
import { useTransactionFormContext } from './TransactionFormContext';

interface TransactionFormFieldsProps {
  accounts: AccountResponse[] | undefined;
  categories: CategoryResponse[] | undefined;
  vendors: Vendor[] | undefined;
  accountsByName: Map<string, AccountResponse>;
  categoriesByName: Map<string, CategoryResponse>;
  vendorsByName: Map<string, Vendor>;
  size?: 'xs' | 'sm';
}

export const TransactionFormFields = ({
  accounts,
  categories,
  vendors,
  accountsByName,
  categoriesByName,
  vendorsByName,
  size = 'xs',
}: TransactionFormFieldsProps) => {
  const form = useTransactionFormContext();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const isTransfer = form.values.category?.categoryType === 'Transfer';

  const formatDateInput = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 4) {
      return digits;
    }
    if (digits.length <= 6) {
      return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    }
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  };

  return (
    <Stack gap="xs">
      <SegmentedControl
        size="xs"
        data={['Incoming', 'Outgoing', 'Transfer']}
        w={isMobile ? '100%' : 'fit-content'}
        {...form.getInputProps('category.categoryType')}
      />
      <Grid gutter="md" align="flex-end">
        <Grid.Col span={{ base: 12, md: 1.2 }}>
          <TextInput
            label="Date"
            placeholder="YYYY-MM-DD"
            leftSection={<IconCalendar size={14} />}
            {...form.getInputProps('occurredAt')}
            onChange={(e) => form.setFieldValue('occurredAt', formatDateInput(e.target.value))}
            size={size}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 2.3 }}>
          <TextInput
            label="Description"
            placeholder="Rent, Lunch, etc."
            leftSection={<IconTag size={14} />}
            {...form.getInputProps('description')}
            size={size}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: isTransfer ? 2 : 1.5 }}>
          <Select
            label="Account"
            data={(accounts || []).map((a) => a.name)}
            searchable
            placeholder="Select..."
            leftSection={<IconBriefcase size={14} />}
            size={size}
            {...form.getInputProps('fromAccountName')}
            onOptionSubmit={(val) => {
              form.setFieldValue('fromAccount', accountsByName.get(val));
            }}
          />
        </Grid.Col>

        {isTransfer ? (
          <Grid.Col span={{ base: 12, md: 2 }}>
            <Select
              label="To Account"
              data={(accounts || []).map((a) => a.name)}
              searchable
              placeholder="Select..."
              leftSection={<IconBriefcase size={14} />}
              size={size}
              {...form.getInputProps('toAccountName')}
              onOptionSubmit={(val) => {
                form.setFieldValue('toAccount', accountsByName.get(val));
              }}
            />
          </Grid.Col>
        ) : (
          <>
            <Grid.Col span={{ base: 12, md: 2 }}>
              <Select
                label="Category"
                data={(categories || []).map((c) => c.name)}
                searchable
                placeholder="Select..."
                leftSection={<IconBriefcase size={14} />}
                size={size}
                {...form.getInputProps('categoryName')}
                onOptionSubmit={(val) => {
                  form.setFieldValue('category', categoriesByName.get(val));
                }}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 1.5 }}>
              <Autocomplete
                label="Vendor"
                data={(vendors || []).map((v) => v.name)}
                {...form.getInputProps('vendorName')}
                onChange={(val) => {
                  form.setFieldValue('vendorName', val);
                  form.setFieldValue('vendor', vendorsByName.get(val));
                }}
                size={size}
                placeholder="Vendor"
                leftSection={<IconTruckDelivery size={14} />}
              />
            </Grid.Col>
          </>
        )}

        <Grid.Col span={{ base: 12, md: 1.2 }}>
          <NumberInput
            label="Amount"
            placeholder="0.00"
            decimalScale={2}
            fixedDecimalScale
            hideControls
            leftSection={<IconCurrencyEuro size={14} />}
            size={size}
            {...form.getInputProps('amount')}
          />
        </Grid.Col>

        {!isMobile && (
          <Grid.Col span="auto">
            <ActionIcon
              type="submit"
              size={30}
              radius="md"
              variant="gradient"
              gradient={{ from: 'cyan', to: 'blue', deg: 135 }}
              aria-label="Create Transaction"
            >
              <IconPlus size={18} />
            </ActionIcon>
          </Grid.Col>
        )}
      </Grid>
    </Stack>
  );
};
