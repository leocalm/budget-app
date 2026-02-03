import React from 'react';
import { ActionIcon, Box, Group, Paper, Stack, Text } from '@mantine/core';
import { CategoryResponse } from '@/types/category';
import { formatCurrencyValue } from '@/utils/currency';
import styles from './Categories.module.css';

interface CategoryCardProps {
  category: CategoryResponse;
  monthlySpent: number;
  transactionCount: number;
  trend?: {
    direction: 'up' | 'down';
    percentage: number;
  };
  onEdit: (category: CategoryResponse) => void;
  onDelete: (id: string) => void;
  onClick?: (category: CategoryResponse) => void;
}

// Category type meta info for icons and labels
const CATEGORY_TYPE_META: Record<string, { icon: string; label: string }> = {
  Outgoing: { icon: '💸', label: 'Outgoing' },
  Incoming: { icon: '💵', label: 'Incoming' },
  Transfer: { icon: '🔄', label: 'Transfer' },
};

// Define background colors with alpha for each category type
const getCategoryBackground = (color: string) => {
  // Convert hex to rgba with 10% opacity
  return `${color}1A`;
};

export function CategoryCard({
  category,
  monthlySpent,
  transactionCount,
  trend,
  onEdit,
  onDelete,
  onClick,
}: CategoryCardProps) {
  const typeMeta = CATEGORY_TYPE_META[category.categoryType] || {
    icon: '💸',
    label: category.categoryType,
  };

  const handleCardClick = () => {
    onClick?.(category);
  };

  const categoryColor = category.color || '#00d4ff';
  const categoryBg = getCategoryBackground(categoryColor);

  return (
    <Paper
      className={styles.categoryCard}
      style={
        { '--category-color': categoryColor, '--category-bg': categoryBg } as React.CSSProperties
      }
      radius="lg"
      withBorder
      p="lg"
      onClick={handleCardClick}
    >
      {/* Header */}
      <Group justify="space-between" align="flex-start" mb="lg">
        <Box
          className={styles.categoryIconWrapper}
          style={{ '--category-bg': categoryBg } as React.CSSProperties}
        >
          {category.icon}
        </Box>
        <Group gap="xs" className={styles.categoryActions}>
          <ActionIcon
            variant="subtle"
            color="gray"
            title="Edit"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(category);
            }}
          >
            <span>✏️</span>
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="gray"
            title="Delete"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(category.id);
            }}
          >
            <span>🗑️</span>
          </ActionIcon>
        </Group>
      </Group>

      {/* Category Info */}
      <Box mb="md">
        <Text size="lg" fw={700} mb={4}>
          {category.name}
        </Text>
        <span className={styles.categoryType}>
          {typeMeta.icon} {typeMeta.label}
        </span>
      </Box>

      {/* Stats */}
      <div className={styles.categoryStats}>
        <Stack gap={4}>
          <Text className={styles.statLabel}>This Month</Text>
          <Text className={styles.statValue}>€ {formatCurrencyValue(monthlySpent)}</Text>
          {trend && (
            <Text
              className={`${styles.trend} ${trend.direction === 'up' ? styles.trendUp : styles.trendDown}`}
            >
              {trend.direction === 'up' ? '↑' : '↓'} {trend.percentage}%
            </Text>
          )}
        </Stack>
        <Stack gap={4}>
          <Text className={styles.statLabel}>Transactions</Text>
          <Text className={styles.statValue}>{transactionCount}</Text>
        </Stack>
      </div>
    </Paper>
  );
}
