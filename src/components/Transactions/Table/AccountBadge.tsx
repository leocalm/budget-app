import React from 'react';
import { Box, Text } from '@mantine/core';
import { AccountResponse } from '@/types/account';
import { getIcon } from '@/utils/IconMap';

export interface AccountBadgeProps {
  account: AccountResponse;
}

// Check if string is an emoji (starts with emoji unicode range)
const isEmoji = (str: string): boolean => {
  if (!str) {
    return false;
  }
  const emojiRegex = /^[\u{1F300}-\u{1F9FF}]|^[\u{2600}-\u{26FF}]|^[\u{2700}-\u{27BF}]/u;
  return emojiRegex.test(str);
};

export const AccountBadge = ({ account }: AccountBadgeProps) => {
  // Render icon - either emoji or Tabler icon
  const renderIcon = () => {
    if (!account.icon) {
      return null;
    }
    if (isEmoji(account.icon)) {
      return <span>{account.icon}</span>;
    }
    return getIcon(account.icon, 16);
  };

  return (
    <Box
      component="span"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 14px',
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        fontSize: '13px',
        fontFamily: "'JetBrains Mono', monospace",
        color: '#8892a6',
        fontWeight: 500,
      }}
    >
      {renderIcon()}
      <Text
        component="span"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '13px',
          fontWeight: 500,
          color: '#8892a6',
          whiteSpace: 'nowrap',
        }}
      >
        {account.name}
      </Text>
    </Box>
  );
};
