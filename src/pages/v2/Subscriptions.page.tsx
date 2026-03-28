import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Skeleton, Stack, Text, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { components } from '@/api/v2';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import {
  CancelSubscriptionModal,
  SubscriptionFormDrawer,
  SubscriptionRow,
} from '@/components/v2/Subscriptions';
import classes from '@/components/v2/Subscriptions/Subscriptions.module.css';
import { useCategoriesOptions } from '@/hooks/v2/useCategories';
import {
  useDeleteSubscription,
  useSubscriptions,
  useUpcomingCharges,
} from '@/hooks/v2/useSubscriptions';
import { toast } from '@/lib/toast';

type SubscriptionResponse = components['schemas']['SubscriptionResponse'];

export function SubscriptionsV2Page() {
  const navigate = useNavigate();
  const { data: subsData, isLoading, isError, refetch } = useSubscriptions();
  const { data: upcomingData } = useUpcomingCharges(5);
  const { data: categories } = useCategoriesOptions();
  const deleteMutation = useDeleteSubscription();

  const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false);
  const [cancelOpened, { open: openCancel, close: closeCancel }] = useDisclosure(false);
  const [editSubId, setEditSubId] = useState<string | null>(null);
  const [cancelSub, setCancelSub] = useState<SubscriptionResponse | null>(null);
  const [showCancelled, setShowCancelled] = useState(false);

  const subscriptions = subsData ?? [];

  const categoryMap = useMemo(() => {
    const map = new Map<string, { icon: string; color: string }>();
    for (const c of categories ?? []) {
      map.set(c.id, { icon: c.icon, color: c.color });
    }
    return map;
  }, [categories]);

  const { activeSubs, pausedSubs, cancelledSubs } = useMemo(() => {
    const active: SubscriptionResponse[] = [];
    const paused: SubscriptionResponse[] = [];
    const cancelled: SubscriptionResponse[] = [];
    for (const sub of subscriptions) {
      if (sub.status === 'cancelled') {
        cancelled.push(sub);
      } else if (sub.status === 'paused') {
        paused.push(sub);
      } else {
        active.push(sub);
      }
    }
    return { activeSubs: active, pausedSubs: paused, cancelledSubs: cancelled };
  }, [subscriptions]);

  // Compute monthly and yearly totals from active subs only
  // Accumulate raw amounts first, then round once to avoid per-item drift
  const { monthlyCost, yearlyTotal } = useMemo(() => {
    let monthlyRaw = 0;
    let yearlyRaw = 0;
    for (const sub of activeSubs) {
      switch (sub.billingCycle) {
        case 'monthly':
          monthlyRaw += sub.billingAmount;
          yearlyRaw += sub.billingAmount * 12;
          break;
        case 'quarterly':
          monthlyRaw += sub.billingAmount / 3;
          yearlyRaw += sub.billingAmount * 4;
          break;
        case 'yearly':
          monthlyRaw += sub.billingAmount / 12;
          yearlyRaw += sub.billingAmount;
          break;
      }
    }
    return { monthlyCost: Math.round(monthlyRaw), yearlyTotal: Math.round(yearlyRaw) };
  }, [activeSubs]);

  const nextCharge = upcomingData?.[0];

  const handleCreate = () => {
    setEditSubId(null);
    openForm();
  };

  const handleEdit = (id: string) => {
    setEditSubId(id);
    openForm();
  };

  const handleCancel = (sub: SubscriptionResponse) => {
    setCancelSub(sub);
    openCancel();
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success({ message: 'Subscription deleted' });
    } catch {
      toast.error({ message: 'Failed to delete subscription' });
    }
  };

  if (isError) {
    return (
      <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
        <Text fz={28} fw={700} ff="var(--mantine-font-family-headings)">
          Subscriptions
        </Text>
        <div className={classes.centeredState}>
          <Text fz="sm" c="dimmed">
            Something went wrong loading your subscriptions.
          </Text>
          <Button size="xs" variant="light" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </Stack>
    );
  }

  if (isLoading) {
    return (
      <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
        <div className={classes.pageHeader}>
          <Skeleton width={180} height={28} />
          <Skeleton width={140} height={32} radius="md" />
        </div>
        <Skeleton height={60} radius="md" />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} height={54} radius="lg" />
        ))}
      </Stack>
    );
  }

  const hasSubscriptions = subscriptions.length > 0;

  return (
    <Stack gap="lg" p="md" style={{ background: 'var(--v2-bg)', minHeight: '100%' }}>
      {/* Header */}
      <div className={classes.pageHeader}>
        <div>
          <Text fz={28} fw={700} ff="var(--mantine-font-family-headings)">
            Subscriptions
          </Text>
          <Text c="dimmed" fz="sm">
            Track your recurring charges
          </Text>
        </div>
        <Button size="sm" onClick={handleCreate}>
          + Add Subscription
        </Button>
      </div>

      {/* Empty state */}
      {!hasSubscriptions && (
        <div className={classes.centeredState}>
          <Text fz={32}>🔄</Text>
          <Text fz={18} fw={700} ff="var(--mantine-font-family-headings)">
            No subscriptions yet
          </Text>
          <Text fz="sm" c="dimmed" ta="center">
            Create a category with &lsquo;Subscription&rsquo; behavior to start tracking recurring
            charges. You&apos;ll see billing dates, costs, and payment history.
          </Text>
          <Button size="sm" onClick={handleCreate}>
            + Add Your First Subscription
          </Button>
        </div>
      )}

      {hasSubscriptions && (
        <>
          {/* Stats */}
          <div className={classes.statsBar}>
            <div className={classes.statItem}>
              <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>
                Monthly Cost
              </Text>
              <Text fz="md" fw={600} ff="var(--mantine-font-family-monospace)">
                <CurrencyValue cents={monthlyCost} />
              </Text>
              <Text fz="xs" c="dimmed">
                {activeSubs.filter((s) => s.billingCycle === 'monthly').length} monthly
              </Text>
            </div>
            <div className={classes.statItem}>
              <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>
                Yearly Total
              </Text>
              <Text fz="md" fw={600} ff="var(--mantine-font-family-monospace)">
                <CurrencyValue cents={yearlyTotal} />
              </Text>
            </div>
            <div className={classes.statItem}>
              <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>
                Active
              </Text>
              <Text fz="md" fw={600} ff="var(--mantine-font-family-monospace)">
                {activeSubs.length}
              </Text>
            </div>
            <div className={classes.statItem}>
              <Text fz="xs" c="dimmed" tt="uppercase" fw={600}>
                Next Charge
              </Text>
              {nextCharge ? (
                <>
                  <Text fz="md" fw={600}>
                    {new Date(`${nextCharge.nextChargeDate}T00:00:00`).toLocaleDateString(
                      undefined,
                      { month: 'short', day: 'numeric' }
                    )}
                  </Text>
                  <Text fz="xs" c="dimmed">
                    {nextCharge.name} · <CurrencyValue cents={nextCharge.billingAmount} />
                  </Text>
                </>
              ) : (
                <Text fz="md" c="dimmed">
                  —
                </Text>
              )}
            </div>
          </div>

          {/* Upcoming charges */}
          {upcomingData && upcomingData.length > 0 && (
            <div className={classes.upcomingCard}>
              <Text fz="xs" fw={600} tt="uppercase" c="dimmed" mb="sm">
                Upcoming Charges
              </Text>
              {upcomingData.map((item, i) => {
                const date = new Date(`${item.nextChargeDate}T00:00:00`);
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                const days = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                const timeLabel =
                  days === 0
                    ? 'Today'
                    : days === 1
                      ? 'Tomorrow'
                      : days < 30
                        ? `In ${days} days`
                        : `In ${Math.round(days / 30)} months`;

                return (
                  <div key={item.subscriptionId + i} className={classes.upcomingRow}>
                    <Text
                      fz="xs"
                      c="dimmed"
                      ff="var(--mantine-font-family-monospace)"
                      style={{ width: 50 }}
                    >
                      {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </Text>
                    <span
                      className={classes.upcomingDot}
                      style={{
                        backgroundColor: days <= 3 ? 'var(--v2-primary)' : 'var(--v2-border)',
                      }}
                    />
                    <div className={classes.upcomingInfo}>
                      <Text fz="sm" fw={500} truncate>
                        {item.name}
                      </Text>
                      <Text fz="xs" c="dimmed">
                        {timeLabel}
                      </Text>
                    </div>
                    <div className={classes.upcomingAmount}>
                      <Text fz="sm" fw={600} ff="var(--mantine-font-family-monospace)">
                        <CurrencyValue cents={item.billingAmount} />
                      </Text>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Active subscriptions */}
          <Stack gap="sm">
            <Text fz="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.88px' }}>
              Active Subscriptions
            </Text>
            {activeSubs.map((sub) => {
              const cat = categoryMap.get(sub.categoryId);
              return (
                <SubscriptionRow
                  key={sub.id}
                  subscription={sub}
                  categoryIcon={cat?.icon}
                  categoryColor={cat?.color}
                  onView={(id) => navigate(`/v2/subscriptions/${id}`)}
                  onEdit={handleEdit}
                  onCancel={handleCancel}
                  onDelete={handleDelete}
                />
              );
            })}
          </Stack>

          {/* Paused */}
          {pausedSubs.length > 0 && (
            <Stack gap="sm">
              <Text fz="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.88px' }}>
                Paused
              </Text>
              {pausedSubs.map((sub) => {
                const cat = categoryMap.get(sub.categoryId);
                return (
                  <SubscriptionRow
                    key={sub.id}
                    subscription={sub}
                    categoryIcon={cat?.icon}
                    categoryColor={cat?.color}
                    onView={(id) => navigate(`/v2/subscriptions/${id}`)}
                    onEdit={handleEdit}
                    onCancel={handleCancel}
                    onDelete={handleDelete}
                  />
                );
              })}
            </Stack>
          )}

          {/* Cancelled */}
          {cancelledSubs.length > 0 && (
            <Stack gap="sm">
              <UnstyledButton onClick={() => setShowCancelled((v) => !v)}>
                <Text fz="sm" fw={600} c="dimmed">
                  {showCancelled ? '▾' : '▸'} Cancelled ({cancelledSubs.length})
                </Text>
              </UnstyledButton>
              {showCancelled &&
                cancelledSubs.map((sub) => {
                  const cat = categoryMap.get(sub.categoryId);
                  return (
                    <SubscriptionRow
                      key={sub.id}
                      subscription={sub}
                      categoryIcon={cat?.icon}
                      categoryColor={cat?.color}
                      onView={(id) => navigate(`/v2/subscriptions/${id}`)}
                      onEdit={handleEdit}
                      onCancel={handleCancel}
                      onDelete={handleDelete}
                    />
                  );
                })}
            </Stack>
          )}
        </>
      )}

      <SubscriptionFormDrawer
        key={editSubId ?? 'create'}
        opened={formOpened}
        onClose={closeForm}
        editSubscriptionId={editSubId}
      />
      {cancelSub && (
        <CancelSubscriptionModal
          opened={cancelOpened}
          onClose={closeCancel}
          subscription={cancelSub}
        />
      )}
    </Stack>
  );
}
