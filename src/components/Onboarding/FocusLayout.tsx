import { ReactNode } from 'react';
import { Box, Container, Text } from '@mantine/core';

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
        <Text fw={700} size="xl" mb="xl" style={{ fontFamily: 'Sora, sans-serif' }}>
          PiggyPulse
        </Text>
        {children}
      </Container>
    </Box>
  );
}
