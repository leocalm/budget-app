import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Stack, Text } from '@mantine/core';
import { SubscriptionDetail } from '@/components/v2/Subscriptions';

export function SubscriptionDetailV2Page() {
  const { t } = useTranslation('v2');
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
        <Text c="dimmed" fz="sm">
          {t('subscriptions.notFound')}
        </Text>
      </Stack>
    );
  }

  return <SubscriptionDetail subscriptionId={id} />;
}
