import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import {
  ActionIcon,
  Alert,
  Anchor,
  Badge,
  Button,
  Menu,
  Skeleton,
  Stack,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import { useDeleteSubscription, useSubscription } from '@/hooks/v2/useSubscriptions';
import { toast } from '@/lib/toast';
import { CancelSubscriptionModal } from './CancelSubscriptionModal';
import { SubscriptionFormDrawer } from './SubscriptionFormDrawer';
import { CYCLE_LABELS, ordinal } from './subscriptionUtils';
import classes from './Subscriptions.module.css';

interface SubscriptionDetailProps {
  subscriptionId: string;
}

export function SubscriptionDetail({ subscriptionId }: SubscriptionDetailProps) {
  const { t } = useTranslation('v2');
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useSubscription(subscriptionId);
  const deleteMutation = useDeleteSubscription();
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [cancelOpened, { open: openCancel, close: closeCancel }] = useDisclosure(false);

  if (isLoading) {
    return (
      <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
        <Skeleton width={100} height={14} />
        <Skeleton width={200} height={28} />
        <Skeleton height={200} radius="lg" />
        <div className={classes.metricsGrid}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={classes.metricBox}>
              <Skeleton width={50} height={10} mb={4} />
              <Skeleton width={80} height={24} />
            </div>
          ))}
        </div>
      </Stack>
    );
  }

  if (isError || !data) {
    return (
      <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
        <Anchor component={Link} to="/subscriptions" fz="sm" c="var(--v2-primary)">
          {t('subscriptions.breadcrumb')}
        </Anchor>
        <div className={classes.centeredState}>
          <Text fz="sm" c="dimmed">
            {isError ? t('common.somethingWentWrong') : t('subscriptions.notFound')}
          </Text>
          {isError && (
            <Button size="xs" variant="light" onClick={() => refetch()}>
              {t('common.retry')}
            </Button>
          )}
        </div>
      </Stack>
    );
  }

  const sub = data;
  const isCancelled = sub.status === 'cancelled';
  const billingHistory = sub.billingHistory ?? [];
  const allTimeTotal = billingHistory.reduce((sum, e) => sum + e.amount, 0);
  const thisYear = billingHistory
    .filter((e) => e.date.startsWith(String(new Date().getFullYear())))
    .reduce((sum, e) => sum + e.amount, 0);
  const postCancellationEvents = billingHistory.filter((e) => e.postCancellation);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(subscriptionId);
      toast.success({ message: t('subscriptions.deleted') });
      navigate('/subscriptions');
    } catch {
      toast.error({ message: t('subscriptions.deleteFailed') });
    }
  };

  return (
    <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
      <div className={classes.detailHeader}>
        <div>
          <Anchor component={Link} to="/subscriptions" fz="sm" c="var(--v2-primary)">
            {t('subscriptions.breadcrumb')}
          </Anchor>
          <Text fz={24} fw={700} ff="var(--mantine-font-family-headings)" mt={4}>
            {sub.name}
          </Text>
          <Badge
            size="sm"
            variant="light"
            color={isCancelled ? 'gray' : 'var(--v2-primary)'}
            mt={4}
          >
            {sub.status}
          </Badge>
        </div>

        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="lg"
              aria-label={`Actions for ${sub.name}`}
            >
              <Text fz="xl" lh={1}>
                ⋮
              </Text>
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item onClick={openEdit}>{t('common.edit')}</Menu.Item>
            {!isCancelled && (
              <Menu.Item color="orange" onClick={openCancel}>
                {t('common.cancel')}
              </Menu.Item>
            )}
            <Menu.Item color="red" onClick={handleDelete}>
              {t('common.delete')}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>

      {/* Post-cancellation alert */}
      {postCancellationEvents.length > 0 && (
        <Alert variant="light" color="red" title={t('subscriptions.unexpectedCharge')}>
          {t('subscriptions.unexpectedChargeDesc', { count: postCancellationEvents.length })}
        </Alert>
      )}

      {/* Details card */}
      <div className={classes.detailCard}>
        <div className={classes.detailRow}>
          <Text fz="sm" c="dimmed">
            {t('subscriptions.amount')}
          </Text>
          <Text fz="sm" ff="var(--mantine-font-family-monospace)">
            <CurrencyValue cents={sub.billingAmount} />
            {CYCLE_LABELS[sub.billingCycle]}
          </Text>
        </div>
        <div className={classes.detailRow}>
          <Text fz="sm" c="dimmed">
            {t('subscriptions.billingDay')}
          </Text>
          <Text fz="sm">
            {ordinal(sub.billingDay)} of each{' '}
            {sub.billingCycle === 'yearly'
              ? 'year'
              : sub.billingCycle === 'quarterly'
                ? 'quarter'
                : 'month'}
          </Text>
        </div>
        <div className={classes.detailRow}>
          <Text fz="sm" c="dimmed">
            {t('subscriptions.nextChargeDate')}
          </Text>
          <Text fz="sm" ff="var(--mantine-font-family-monospace)">
            {new Date(`${sub.nextChargeDate}T00:00:00`).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </div>
        <div className={classes.detailRow}>
          <Text fz="sm" c="dimmed">
            {t('subscriptions.status')}
          </Text>
          <Text fz="sm" c={isCancelled ? 'dimmed' : 'var(--v2-primary)'}>
            {sub.status}
          </Text>
        </div>
      </div>

      {/* Summary stats */}
      <div className={classes.metricsGrid}>
        <div className={classes.metricBox}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb={4}>
            {t('subscriptions.thisYear')}
          </Text>
          <Text fz="lg" fw={600} ff="var(--mantine-font-family-monospace)">
            <CurrencyValue cents={thisYear} />
          </Text>
        </div>
        <div className={classes.metricBox}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb={4}>
            {t('subscriptions.allTime')}
          </Text>
          <Text fz="lg" fw={600} ff="var(--mantine-font-family-monospace)">
            <CurrencyValue cents={allTimeTotal} />
          </Text>
        </div>
        <div className={classes.metricBox}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb={4}>
            {t('subscriptions.activeSince')}
          </Text>
          <Text fz="lg" fw={600}>
            {new Date(sub.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        </div>
      </div>

      {/* Billing history */}
      {billingHistory.length > 0 && (
        <div className={classes.detailCard}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb="sm">
            {t('subscriptions.billingHistory')}
          </Text>
          {billingHistory.map((event) => (
            <div key={event.id} className={classes.billingRow}>
              <div>
                <Text fz="sm">
                  {new Date(`${event.date}T00:00:00`).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
                {event.postCancellation && (
                  <Text fz="xs" c="var(--v2-destructive)">
                    {t('subscriptions.postCancellation')}
                  </Text>
                )}
                {event.detected && (
                  <Text fz="xs" c="dimmed">
                    {t('subscriptions.autoDetected')}
                  </Text>
                )}
              </div>
              <Text fz="sm" fw={600} ff="var(--mantine-font-family-monospace)">
                <CurrencyValue cents={event.amount} />
              </Text>
            </div>
          ))}
        </div>
      )}

      <SubscriptionFormDrawer
        key={subscriptionId}
        opened={editOpened}
        onClose={closeEdit}
        editSubscriptionId={subscriptionId}
      />
      {sub && (
        <CancelSubscriptionModal opened={cancelOpened} onClose={closeCancel} subscription={sub} />
      )}
    </Stack>
  );
}
