import { useParams } from 'react-router-dom';
import { Stack, Text } from '@mantine/core';
import { SubscriptionDetail } from '@/components/v2/Subscriptions';

export function SubscriptionDetailV2Page() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
        <Text c="dimmed" fz="sm">
          Subscription not found.
        </Text>
      </Stack>
    );
  }

  return <SubscriptionDetail subscriptionId={id} />;
}
