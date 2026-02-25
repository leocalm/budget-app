import type { Meta, StoryObj } from '@storybook/react';
import { initialVendors, mockAccounts, mockCategories } from '@/mocks/budgetData';
import { createStoryDecorator } from '@/stories/storyUtils';
import { TransactionFormProvider, useTransactionForm } from './TransactionFormContext';
import { TransactionFormFields } from './TransactionFormFields';

const meta: Meta<typeof TransactionFormFields> = {
  title: 'Components/Transactions/TransactionFormFields',
  component: TransactionFormFields,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof TransactionFormFields>;

const accountsByName = new Map(mockAccounts.map((a) => [a.name, a]));
const categoriesByName = new Map(mockCategories.map((c) => [c.name, c]));
const vendorsByName = new Map(initialVendors.map((v) => [v.name, v]));

function FormWrapper() {
  const form = useTransactionForm({
    initialValues: {
      description: '',
      amount: 0,
      occurredAt: new Date().toISOString().slice(0, 10),
      fromAccountName: null,
      toAccountName: null,
      categoryName: null,
      vendorName: '',
    },
  });

  return (
    <TransactionFormProvider form={form}>
      <TransactionFormFields
        accounts={mockAccounts}
        categories={mockCategories}
        vendors={initialVendors}
        accountsByName={accountsByName}
        categoriesByName={categoriesByName}
        vendorsByName={vendorsByName}
      />
    </TransactionFormProvider>
  );
}

export const Default: Story = {
  render: () => <FormWrapper />,
};
