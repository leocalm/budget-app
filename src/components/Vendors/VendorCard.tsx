import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionIcon, Box, Button, Group, Menu, Paper, Stack, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { VendorWithStats } from '@/types/vendor';
import styles from './Vendors.module.css';

interface VendorCardProps {
  vendor: VendorWithStats;
  onEdit: (vendor: VendorWithStats) => void;
  onDelete: (id: string) => void;
  onViewTransactions: (id: string) => void;
}

export function VendorCard({ vendor, onEdit, onDelete, onViewTransactions }: VendorCardProps) {
  const isMobile = useMediaQuery('(max-width: 48em)');
  const [menuOpened, setMenuOpened] = useState(false);
  const { t, i18n } = useTranslation();

  const formatDate = (dateString?: string) => {
    if (!dateString) {
      return t('vendors.times.never');
    }
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return t('vendors.times.today');
    }
    if (diffDays === 1) {
      return t('vendors.times.yesterday');
    }
    if (diffDays < 7) {
      return t('vendors.times.daysAgo', { count: diffDays });
    }
    if (diffDays < 30) {
      return t('vendors.times.weeksAgo', { count: Math.floor(diffDays / 7) });
    }
    const locale = i18n.language || 'en-US';
    return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpened(false);
    onEdit(vendor);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpened(false);
    onDelete(vendor.id!);
  };

  const handleViewTransactions = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewTransactions(vendor.id!);
  };

  return (
    <Paper className={styles.vendorCard} radius="lg" withBorder p="lg">
      {/* Header */}
      <Group justify="space-between" align="flex-start" mb="lg">
        <Box className={styles.vendorIconWrapper}>
          <span className={styles.vendorIcon}>🏪</span>
        </Box>

        {/* Desktop: Show action icons on hover */}
        {!isMobile && (
          <Group gap="xs" className={styles.vendorActionsDesktop}>
            <ActionIcon variant="subtle" color="gray" title="Edit" size="sm" onClick={handleEdit}>
              <span>✏️</span>
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              color="gray"
              title="Delete"
              size="sm"
              onClick={handleDelete}
            >
              <span>🗑️</span>
            </ActionIcon>
          </Group>
        )}
      </Group>

      {/* Vendor Info */}
      <Box mb="md">
        <Text size="lg" fw={700} mb={4}>
          {vendor.name}
        </Text>
        <Text size="xs" c="dimmed">
          {t('vendors.card.transactionCount', { count: vendor.transactionCount })}
        </Text>
      </Box>

      {/* Stats */}
      <div className={styles.vendorStats}>
        <Stack gap={4}>
          <Text className={styles.statLabel}>{t('vendors.card.stats.transactions')}</Text>
          <Text className={styles.statValue}>{vendor.transactionCount}</Text>
        </Stack>
        <Stack gap={4}>
          <Text className={styles.statLabel}>{t('vendors.card.stats.lastUsed')}</Text>
          <Text className={styles.statValue} style={{ fontSize: '14px' }}>
            {formatDate(vendor.lastUsedAt)}
          </Text>
        </Stack>
      </div>

      {/* Actions - Mobile: View Transactions + More menu | Desktop: View Transactions full width */}
      {isMobile ? (
        <Group gap="xs" mt="md" className={styles.vendorActionsMobile}>
          <Button
            variant="light"
            size="sm"
            style={{ flex: 1, minHeight: '44px' }}
            onClick={handleViewTransactions}
          >
            <span style={{ marginRight: 4 }}>📊</span>
            {t('vendors.viewTransactions')}
          </Button>
          <Menu opened={menuOpened} onChange={setMenuOpened} position="bottom-end" withinPortal>
            <Menu.Target>
              <Button variant="light" size="sm" style={{ flex: 1, minHeight: '44px' }}>
                ⋯ {t('vendors.card.actions.more')}
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<span>✏️</span>} onClick={handleEdit}>
                {t('vendors.card.actions.edit')}
              </Menu.Item>
              <Menu.Item leftSection={<span>🗑️</span>} color="red" onClick={handleDelete}>
                {t('vendors.card.actions.delete')}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      ) : (
        <Button variant="light" fullWidth mt="md" size="sm" onClick={handleViewTransactions}>
          {t('vendors.viewTransactions')}
        </Button>
      )}
    </Paper>
  );
}
