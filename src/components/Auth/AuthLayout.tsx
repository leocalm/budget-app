import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mantine/core';

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
        <Outlet />
      </Container>
    </Box>
  );
}
