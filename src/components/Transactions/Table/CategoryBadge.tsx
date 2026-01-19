import React from 'react';
import { Box, Text } from '@mantine/core';
import { CategoryResponse } from '@/types/category';
import { getIcon } from '@/utils/IconMap';

export interface CategoryBadgeProps {
  category: CategoryResponse;
}

// Check if string is an emoji (starts with emoji unicode range)
const isEmoji = (str: string): boolean => {
  if (!str) {
    return false;
  }
  const emojiRegex = /^[\u{1F300}-\u{1F9FF}]|^[\u{2600}-\u{26FF}]|^[\u{2700}-\u{27BF}]/u;
  return emojiRegex.test(str);
};

export const CategoryBadge = ({ category }: CategoryBadgeProps) => {
  // Generate background and border colors from category color (10% opacity bg, 20% opacity border)
  const baseColor = category.color || '#8892a6';

  // Render icon - either emoji or Tabler icon
  const renderIcon = () => {
    if (!category.icon) {
      return null;
    }
    if (isEmoji(category.icon)) {
      return <span>{category.icon}</span>;
    }
    return getIcon(category.icon, 16);
  };

  return (
    <Box
      component="span"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 14px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: 600,
        width: 'fit-content',
        backgroundColor: `${baseColor}1a`, // 10% opacity
        border: `1px solid ${baseColor}33`, // 20% opacity
        color: baseColor,
      }}
    >
      {renderIcon()}
      <Text
        component="span"
        size="sm"
        fw={600}
        style={{
          color: 'inherit',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '120px',
        }}
      >
        {category.name}
      </Text>
    </Box>
  );
};
