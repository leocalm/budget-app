import { useState } from 'react';
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
  const cancelMutation = useCancelSubscription();
  const [cancellationDate, setCancellationDate] = useState(
    () => new Date().toISOString().split('T')[0]
  );

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync(subscription.id);
      toast.success({ message: `${subscription.name} marked as cancelled` });
      onClose();
    } catch {
      toast.error({ message: 'Failed to cancel subscription' });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Cancel Subscription"
      styles={{
        body: { backgroundColor: 'var(--v2-bg)' },
        header: { backgroundColor: 'var(--v2-bg)' },
      }}
    >
      <Stack gap="md">
        <Text fz="sm" c="dimmed">
          Mark &ldquo;{subscription.name}&rdquo; as cancelled in PiggyPulse.
        </Text>

        <Stack gap="xs">
          <Text fz="xs" c="dimmed">
            Subscription: {subscription.name}
          </Text>
          <Text fz="xs" c="dimmed">
            Amount: <CurrencyValue cents={subscription.billingAmount} />
            {CYCLE_LABELS[subscription.billingCycle]}
          </Text>
        </Stack>

        <Alert variant="light" color="orange">
          This only marks the subscription as cancelled in PiggyPulse. You still need to cancel it
          directly with the provider. If a charge arrives after cancellation, PiggyPulse will flag
          it for your attention.
        </Alert>

        <TextInput
          label="Cancellation date"
          description="When you cancelled (or plan to cancel) with the provider"
          type="date"
          value={cancellationDate}
          onChange={(e) => setCancellationDate(e.currentTarget.value)}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose} disabled={cancelMutation.isPending}>
            Keep Active
          </Button>
          <Button color="orange" onClick={handleCancel} loading={cancelMutation.isPending}>
            Cancel Subscription
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
