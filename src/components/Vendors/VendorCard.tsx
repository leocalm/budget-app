import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Group, Paper, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { VendorWithStats } from '@/types/vendor';

interface VendorCardProps {
  vendor: VendorWithStats;
  onEdit: (vendor: VendorWithStats) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onViewTransactions: (id: string) => void;
}

export function VendorCard({
  vendor,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
  onViewTransactions: _onViewTransactions,
}: VendorCardProps) {
  const isMobile = useMediaQuery('(max-width: 48em)');
  const { t } = useTranslation();

  const canDelete = vendor.transactionCount === 0 && !vendor.archived;

  const actions = (
    <Group gap="xs" wrap="nowrap">
      <Button size="xs" variant="default" onClick={() => onEdit(vendor)}>
        {t('vendors.card.edit')}
      </Button>
      {vendor.archived ? (
        <Button size="xs" variant="default" onClick={() => onRestore(vendor.id!)}>
          {t('vendors.card.restore')}
        </Button>
      ) : (
        <Button size="xs" variant="default" onClick={() => onArchive(vendor.id!)}>
          {t('vendors.card.archive')}
        </Button>
      )}
      {canDelete && (
        <Button size="xs" variant="default" color="red" onClick={() => onDelete(vendor.id!)}>
          {t('vendors.card.delete')}
        </Button>
      )}
    </Group>
  );

  if (isMobile) {
    return (
      <Paper withBorder radius="md" p="sm">
        <Group justify="space-between" align="flex-start" mb={4}>
          <Text fw={600} size="sm">
            {vendor.name}
          </Text>
          <Text size="xs" c="dimmed">
            {t('vendors.card.transactionCount', { count: vendor.transactionCount })}
          </Text>
        </Group>
        {vendor.description && (
          <Text size="xs" c="dimmed" lineClamp={2} mb={8}>
            {vendor.description}
          </Text>
        )}
        {actions}
      </Paper>
    );
  }

  // Desktop: row layout
  return (
    <Paper
      withBorder={false}
      px="md"
      py="sm"
      style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
    >
      <Group justify="space-between" align="center" wrap="nowrap">
        <Box style={{ flex: '1 1 0', minWidth: 0 }}>
          <Text fw={600} size="sm" truncate>
            {vendor.name}
          </Text>
          {vendor.description && (
            <Text size="xs" c="dimmed" truncate>
              {vendor.description}
            </Text>
          )}
        </Box>
        <Text size="xs" c="dimmed" w={60} ta="right">
          {t('vendors.card.transactionCount', { count: vendor.transactionCount })}
        </Text>
        {actions}
      </Group>
    </Paper>
  );
}
