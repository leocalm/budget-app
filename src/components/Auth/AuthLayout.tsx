import { Outlet } from 'react-router-dom';
import { Box, Center, Container } from '@mantine/core';
import { Logo } from '@/components/Layout/Logo';

export function AuthLayout() {
  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Container size={420} my={40}>
        <Center mb={30}>
          <Logo />
        </Center>
        <Outlet />
      </Container>
    </Box>
  );
}
