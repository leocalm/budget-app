import { ReactNode } from 'react';
import { Box, Container } from '@mantine/core';
import { Logo } from '@/components/Layout/Logo';

interface FocusLayoutProps {
  children: ReactNode;
}

export function FocusLayout({ children }: FocusLayoutProps) {
  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 'clamp(16px, 4vw, 48px)',
        paddingBottom: 48,
      }}
    >
      <Container size={600} w="100%" px={{ base: 'md', sm: 'xl' }}>
        <Box mb="xl">
          <Logo />
        </Box>
        {children}
      </Container>
    </Box>
  );
}
