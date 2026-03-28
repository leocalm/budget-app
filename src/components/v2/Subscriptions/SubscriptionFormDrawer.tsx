import { useEffect, useState } from 'react';
import { Button, Drawer, Group, NumberInput, Select, Stack, Text, TextInput } from '@mantine/core';
import type { components } from '@/api/v2';
import { useCategoriesOptions } from '@/hooks/v2/useCategories';
import {
  useCreateSubscription,
  useSubscription,
  useUpdateSubscription,
} from '@/hooks/v2/useSubscriptions';
import { useVendorsOptions } from '@/hooks/v2/useVendors';
import { toast } from '@/lib/toast';

type BillingCycle = components['schemas']['BillingCycle'];

const CYCLE_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

interface SubscriptionFormDrawerProps {
  opened: boolean;
  onClose: () => void;
  editSubscriptionId?: string | null;
}

export function SubscriptionFormDrawer({
  opened,
  onClose,
  editSubscriptionId,
}: SubscriptionFormDrawerProps) {
  const isEdit = !!editSubscriptionId;
  const { data: editData } = useSubscription(editSubscriptionId ?? '');
  const createMutation = useCreateSubscription();
  const updateMutation = useUpdateSubscription();
  const { data: categories } = useCategoriesOptions();
  const { data: vendors } = useVendorsOptions();

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [billingAmount, setBillingAmount] = useState<number | string>('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [billingDay, setBillingDay] = useState<number | string>(1);
  const [nextChargeDate, setNextChargeDate] = useState(
    () => new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    if (isEdit && editData) {
      setName(editData.name);
      setCategoryId(editData.categoryId);
      setVendorId(editData.vendorId ?? null);
      setBillingAmount(editData.billingAmount / 100);
      setBillingCycle(editData.billingCycle);
      setBillingDay(editData.billingDay);
      setNextChargeDate(editData.nextChargeDate);
    }
  }, [isEdit, editData]);

  const categoryOptions = (categories ?? []).map((c) => ({
    value: c.id,
    label: `${c.icon} ${c.name}`,
  }));
  const vendorOptions = (vendors ?? []).map((v) => ({ value: v.id, label: v.name }));

  const handleSubmit = async () => {
    if (!name.trim() || !categoryId || !billingAmount) {
      return;
    }

    const body: components['schemas']['CreateSubscriptionRequest'] = {
      name: name.trim(),
      categoryId,
      vendorId: vendorId || undefined,
      billingAmount: Math.round(Number(billingAmount) * 100),
      billingCycle,
      billingDay: Number(billingDay),
      nextChargeDate,
    };

    try {
      if (isEdit && editSubscriptionId) {
        await updateMutation.mutateAsync({ id: editSubscriptionId, body });
        toast.success({ message: 'Subscription updated' });
      } else {
        await createMutation.mutateAsync(body);
        toast.success({ message: 'Subscription created' });
      }
      onClose();
    } catch {
      toast.error({ message: `Failed to ${isEdit ? 'update' : 'create'} subscription` });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isValid = name.trim().length >= 1 && categoryId && Number(billingAmount) > 0;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={isEdit ? 'Edit Subscription' : 'Add Subscription'}
      position="right"
      size="md"
      styles={{
        body: { backgroundColor: 'var(--v2-bg)' },
        header: { backgroundColor: 'var(--v2-bg)' },
      }}
    >
      <Stack gap="md">
        <TextInput
          label="Subscription Name"
          placeholder="e.g. Netflix"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
        />

        <Select
          label="Category"
          description="Link to a category with subscription behavior"
          data={categoryOptions}
          value={categoryId}
          onChange={setCategoryId}
          searchable
          required
        />

        <Select
          label="Vendor"
          data={vendorOptions}
          value={vendorId}
          onChange={setVendorId}
          searchable
          clearable
        />

        <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
          Billing
        </Text>

        <Group grow>
          <NumberInput
            label="Amount"
            value={billingAmount}
            onChange={setBillingAmount}
            decimalScale={2}
            fixedDecimalScale
            min={0.01}
            required
          />
          <Select
            label="Cycle"
            data={CYCLE_OPTIONS}
            value={billingCycle}
            onChange={(v) => setBillingCycle((v as BillingCycle) ?? 'monthly')}
            required
          />
        </Group>

        <NumberInput
          label="Billing Day"
          description="Day of month (1-31)"
          value={billingDay}
          onChange={setBillingDay}
          min={1}
          max={31}
          required
        />

        <TextInput
          label="Next Expected Charge"
          type="date"
          value={nextChargeDate}
          onChange={(e) => setNextChargeDate(e.currentTarget.value)}
          required
        />

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={isSubmitting} disabled={!isValid}>
            {isEdit ? 'Save Changes' : 'Create Subscription'}
          </Button>
        </Group>
      </Stack>
    </Drawer>
  );
}
