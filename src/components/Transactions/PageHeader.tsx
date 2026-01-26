import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Text, Title } from '@mantine/core';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const PageHeader = ({ title, subtitle, actions }: PageHeaderProps) => {
  return (
    <Box
      style={{
        marginBottom: '48px',
      }}
    >
      <Box
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '24px',
        }}
        className="header-top"
      >
        <Box>
          <Title
            order={1}
            style={{
              fontSize: '32px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              marginBottom: '8px',
              color: '#ffffff',
            }}
          >
            {title}
          </Title>
          {subtitle && (
            <Text
              style={{
                fontSize: '15px',
                color: '#8892a6',
              }}
            >
              {subtitle}
            </Text>
          )}
        </Box>
        {actions && (
          <Box
            style={{
              display: 'flex',
              gap: '16px',
            }}
          >
            {actions}
          </Box>
        )}
      </Box>
    </Box>
  );
};

// Export button component for use in header
export const ExportButton = ({ onClick }: { onClick?: () => void }) => {
  const { t } = useTranslation();
  return (
    <Button
      variant="default"
      onClick={onClick}
      leftSection={<span>📊</span>}
      styles={{
        root: {
          padding: '12px 24px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: 600,
          background: '#151b26',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: '#00d4ff',
            background: '#1e2433',
          },
        },
      }}
    >
      {t('transactions.pageHeader.export')}
    </Button>
  );
};
