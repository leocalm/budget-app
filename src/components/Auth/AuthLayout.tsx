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
        justifyContent: 'flex-start',
        paddingTop: 'max(40px, calc((100vh - 700px) / 2))',
      }}
    >
      <Container size={420} mb={40}>
        <Outlet />
      </Container>
    </Box>
  );
}
