import React from 'react';
import { Box, Text, Title } from '@mantine/core';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const PageHeader = ({ title, subtitle, actions }: PageHeaderProps) => {
  return (
    <Box
      style={{
        marginBottom: 'var(--spacing-2xl)',
      }}
    >
      <Box
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 'var(--spacing-l)',
          flexWrap: 'wrap',
          gap: 'var(--spacing-xl)',
        }}
        className="header-top"
      >
        <Box>
          <Title
            order={1}
            style={{
              fontSize: 'var(--type-reflective-hero-size)',
              fontWeight: 'var(--type-reflective-hero-weight)',
              letterSpacing: '-0.02em',
              marginBottom: 'var(--spacing-s)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-title)',
            }}
          >
            {title}
          </Title>
          {subtitle && (
            <Text
              style={{
                fontSize: 'var(--type-diagnostic-name-size)',
                color: 'var(--text-secondary)',
              }}
            >
              {subtitle}
            </Text>
          )}
        </Box>
        <Box
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--spacing-l)',
            justifyContent: 'flex-end',
            marginLeft: 'auto',
          }}
        >
          {actions}
        </Box>
      </Box>
    </Box>
  );
};
