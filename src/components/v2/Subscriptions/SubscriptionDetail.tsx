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
import classes from './Subscriptions.module.css';

const CYCLE_LABELS: Record<string, string> = {
  monthly: '/mo',
  quarterly: '/qtr',
  yearly: '/yr',
};

interface SubscriptionDetailProps {
  subscriptionId: string;
}

export function SubscriptionDetail({ subscriptionId }: SubscriptionDetailProps) {
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
        <Anchor component={Link} to="/v2/subscriptions" fz="sm" c="var(--v2-primary)">
          ← Subscriptions
        </Anchor>
        <div className={classes.centeredState}>
          <Text fz="sm" c="dimmed">
            {isError ? 'Something went wrong.' : 'Subscription not found.'}
          </Text>
          {isError && (
            <Button size="xs" variant="light" onClick={() => refetch()}>
              Retry
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
      toast.success({ message: 'Subscription deleted' });
      navigate('/v2/subscriptions');
    } catch {
      toast.error({ message: 'Failed to delete subscription' });
    }
  };

  return (
    <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
      <div className={classes.detailHeader}>
        <div>
          <Anchor component={Link} to="/v2/subscriptions" fz="sm" c="var(--v2-primary)">
            ← Subscriptions
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
            <Menu.Item onClick={openEdit}>Edit</Menu.Item>
            {!isCancelled && (
              <Menu.Item color="orange" onClick={openCancel}>
                Cancel
              </Menu.Item>
            )}
            <Menu.Item color="red" onClick={handleDelete}>
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>

      {/* Post-cancellation alert */}
      {postCancellationEvents.length > 0 && (
        <Alert variant="light" color="red" title="Unexpected charge after cancellation">
          {postCancellationEvents.length} charge(s) recorded after this subscription was cancelled.
          Review the billing history below.
        </Alert>
      )}

      {/* Details card */}
      <div className={classes.detailCard}>
        <div className={classes.detailRow}>
          <Text fz="sm" c="dimmed">
            Amount
          </Text>
          <Text fz="sm" ff="var(--mantine-font-family-monospace)">
            <CurrencyValue cents={sub.billingAmount} />
            {CYCLE_LABELS[sub.billingCycle]}
          </Text>
        </div>
        <div className={classes.detailRow}>
          <Text fz="sm" c="dimmed">
            Billing day
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
            Next charge
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
            Status
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
            This Year
          </Text>
          <Text fz="lg" fw={600} ff="var(--mantine-font-family-monospace)">
            <CurrencyValue cents={thisYear} />
          </Text>
        </div>
        <div className={classes.metricBox}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb={4}>
            All-time
          </Text>
          <Text fz="lg" fw={600} ff="var(--mantine-font-family-monospace)">
            <CurrencyValue cents={allTimeTotal} />
          </Text>
        </div>
        <div className={classes.metricBox}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb={4}>
            Active Since
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
            Billing History
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
                    Post-cancellation
                  </Text>
                )}
                {event.detected && (
                  <Text fz="xs" c="dimmed">
                    Auto-detected
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

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
