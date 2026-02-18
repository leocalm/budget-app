import React from 'react';
import { Box, UnstyledButton, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

export interface ActionButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
}

const actionBtnStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  color: 'var(--text-tertiary)',
  fontSize: '14px',
};

export const ActionButtons = ({ onEdit, onDelete }: ActionButtonsProps) => {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  return (
    <Box
      className="transaction-actions"
      style={{
        display: 'flex',
        gap: '8px',
        opacity: isMobile ? 1 : 0, // Always visible on mobile
        transition: 'opacity 0.2s ease',
      }}
    >
      <UnstyledButton
        style={actionBtnStyle}
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        title="Edit"
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--color-accent-primary-soft)';
          e.currentTarget.style.borderColor = 'var(--accent-primary)';
          e.currentTarget.style.color = 'var(--accent-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--bg-elevated)';
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
          e.currentTarget.style.color = 'var(--text-tertiary)';
        }}
      >
        <span>✏️</span>
      </UnstyledButton>
      <UnstyledButton
        style={actionBtnStyle}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        title="Delete"
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--color-accent-secondary-soft)';
          e.currentTarget.style.borderColor = 'var(--accent-secondary)';
          e.currentTarget.style.color = 'var(--accent-secondary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--bg-elevated)';
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
          e.currentTarget.style.color = 'var(--text-tertiary)';
        }}
      >
        <span>🗑️</span>
      </UnstyledButton>
    </Box>
  );
};
