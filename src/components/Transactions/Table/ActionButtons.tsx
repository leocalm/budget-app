import React from 'react';
import { Box, UnstyledButton } from '@mantine/core';

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
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  color: '#5a6272',
  fontSize: '14px',
};

export const ActionButtons = ({ onEdit, onDelete }: ActionButtonsProps) => {
  return (
    <Box
      className="transaction-actions"
      style={{
        display: 'flex',
        gap: '8px',
        opacity: 0,
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
          e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)';
          e.currentTarget.style.borderColor = '#00d4ff';
          e.currentTarget.style.color = '#00d4ff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
          e.currentTarget.style.color = '#5a6272';
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
          e.currentTarget.style.background = 'rgba(255, 107, 157, 0.1)';
          e.currentTarget.style.borderColor = '#ff6b9d';
          e.currentTarget.style.color = '#ff6b9d';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
          e.currentTarget.style.color = '#5a6272';
        }}
      >
        <span>🗑️</span>
      </UnstyledButton>
    </Box>
  );
};
