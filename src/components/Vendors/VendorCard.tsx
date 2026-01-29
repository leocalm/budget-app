import React, { useState } from 'react';
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

  const formatDate = (dateString?: string) => {
    if (!dateString) {
      return 'Never';
    }
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    }
    if (diffDays === 1) {
      return 'Yesterday';
    }
    if (diffDays < 7) {
      return `${diffDays}d ago`;
    }
    if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)}w ago`;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
          {vendor.transactionCount} transaction{vendor.transactionCount !== 1 ? 's' : ''}
        </Text>
      </Box>

      {/* Stats */}
      <div className={styles.vendorStats}>
        <Stack gap={4}>
          <Text className={styles.statLabel}>Transactions</Text>
          <Text className={styles.statValue}>{vendor.transactionCount}</Text>
        </Stack>
        <Stack gap={4}>
          <Text className={styles.statLabel}>Last Used</Text>
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
            📊 Transactions
          </Button>
          <Menu opened={menuOpened} onChange={setMenuOpened} position="bottom-end" withinPortal>
            <Menu.Target>
              <Button variant="light" size="sm" style={{ flex: 1, minHeight: '44px' }}>
                ⋯ More
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<span>✏️</span>} onClick={handleEdit}>
                Edit Vendor
              </Menu.Item>
              <Menu.Item leftSection={<span>🗑️</span>} color="red" onClick={handleDelete}>
                Delete Vendor
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      ) : (
        <Button variant="light" fullWidth mt="md" size="sm" onClick={handleViewTransactions}>
          View Transactions
        </Button>
      )}
    </Paper>
  );
}
