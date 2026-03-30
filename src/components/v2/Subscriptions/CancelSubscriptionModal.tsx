import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import type { components } from '@/api/v2';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import { useCancelSubscription } from '@/hooks/v2/useSubscriptions';
import { toast } from '@/lib/toast';
import { CYCLE_LABELS } from './subscriptionUtils';

type SubscriptionResponse = components['schemas']['SubscriptionResponse'];

interface CancelSubscriptionModalProps {
  opened: boolean;
  onClose: () => void;
  subscription: SubscriptionResponse;
}

export function CancelSubscriptionModal({
  opened,
  onClose,
  subscription,
}: CancelSubscriptionModalProps) {
  const { t } = useTranslation('v2');
  const cancelMutation = useCancelSubscription();
  const [cancellationDate, setCancellationDate] = useState(
    () => new Date().toISOString().split('T')[0]
  );

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync(subscription.id);
      toast.success({ message: t('subscriptions.cancel.success', { name: subscription.name }) });
      onClose();
    } catch {
      toast.error({ message: t('subscriptions.cancel.failed') });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('subscriptions.cancel.title')}
      styles={{
        body: { backgroundColor: 'var(--v2-bg)' },
        header: { backgroundColor: 'var(--v2-bg)' },
      }}
    >
      <Stack gap="md">
        <Text fz="sm" c="dimmed">
          {t('subscriptions.cancel.description', { name: subscription.name })}
        </Text>

        <Stack gap="xs">
          <Text fz="xs" c="dimmed">
            {t('subscriptions.cancel.subscription', { name: subscription.name })}
          </Text>
          <Text fz="xs" c="dimmed">
            {t('subscriptions.cancel.amount')} <CurrencyValue cents={subscription.billingAmount} />
            {CYCLE_LABELS[subscription.billingCycle]}
          </Text>
        </Stack>

        <Alert variant="light" color="orange">
          {t('subscriptions.cancel.warning')}
        </Alert>

        <TextInput
          label={t('subscriptions.cancel.cancellationDate')}
          description={t('subscriptions.cancel.cancellationDateDesc')}
          type="date"
          value={cancellationDate}
          onChange={(e) => setCancellationDate(e.currentTarget.value)}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose} disabled={cancelMutation.isPending}>
            {t('subscriptions.cancel.keepActive')}
          </Button>
          <Button color="orange" onClick={handleCancel} loading={cancelMutation.isPending}>
            {t('subscriptions.cancel.confirmCancel')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
