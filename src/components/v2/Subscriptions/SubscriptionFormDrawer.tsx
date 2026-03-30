import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('v2');
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

  const cycleOptions = [
    { value: 'monthly', label: t('subscriptions.form.cycles.monthly') },
    { value: 'quarterly', label: t('subscriptions.form.cycles.quarterly') },
    { value: 'yearly', label: t('subscriptions.form.cycles.yearly') },
  ];

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
        toast.success({ message: t('subscriptions.form.updated') });
      } else {
        await createMutation.mutateAsync(body);
        toast.success({ message: t('subscriptions.form.created') });
      }
      onClose();
    } catch {
      toast.error({
        message: t('subscriptions.form.error', { action: isEdit ? 'update' : 'create' }),
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isValid = name.trim().length >= 1 && categoryId && Number(billingAmount) > 0;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={isEdit ? t('subscriptions.form.editTitle') : t('subscriptions.form.createTitle')}
      position="right"
      size="md"
      styles={{
        body: { backgroundColor: 'var(--v2-bg)' },
        header: { backgroundColor: 'var(--v2-bg)' },
      }}
    >
      <Stack gap="md">
        <TextInput
          label={t('subscriptions.form.name')}
          placeholder={t('subscriptions.form.namePlaceholder')}
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
        />

        <Select
          label={t('subscriptions.form.category')}
          description={t('subscriptions.form.categoryDesc')}
          data={categoryOptions}
          value={categoryId}
          onChange={setCategoryId}
          searchable
          required
        />

        <Select
          label={t('subscriptions.form.vendor')}
          data={vendorOptions}
          value={vendorId}
          onChange={setVendorId}
          searchable
          clearable
        />

        <Text fz="xs" fw={600} tt="uppercase" c="dimmed">
          {t('subscriptions.form.billing')}
        </Text>

        <Group grow>
          <NumberInput
            label={t('subscriptions.form.amount')}
            value={billingAmount}
            onChange={setBillingAmount}
            decimalScale={2}
            fixedDecimalScale
            min={0.01}
            required
          />
          <Select
            label={t('subscriptions.form.cycle')}
            data={cycleOptions}
            value={billingCycle}
            onChange={(v) => setBillingCycle((v as BillingCycle) ?? 'monthly')}
            required
          />
        </Group>

        <NumberInput
          label={t('subscriptions.form.billingDay')}
          description={t('subscriptions.form.billingDayDesc')}
          value={billingDay}
          onChange={setBillingDay}
          min={1}
          max={31}
          required
        />

        <TextInput
          label={t('subscriptions.form.nextCharge')}
          type="date"
          value={nextChargeDate}
          onChange={(e) => setNextChargeDate(e.currentTarget.value)}
          required
        />

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} loading={isSubmitting} disabled={!isValid}>
            {isEdit ? t('common.saveChanges') : t('subscriptions.form.createButton')}
          </Button>
        </Group>
      </Stack>
    </Drawer>
  );
}
