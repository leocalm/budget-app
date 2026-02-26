import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { AuthCard, AuthMessage } from './AuthCard';

const wrap = (ui: ReactNode) =>
  render(
    <MantineProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </MantineProvider>
  );

describe('AuthCard', () => {
  it('renders children', () => {
    wrap(
      <AuthCard>
        <p>form content</p>
      </AuthCard>
    );
    expect(screen.getByText('form content')).toBeInTheDocument();
  });

  it('renders tagline when provided', () => {
    wrap(
      <AuthCard tagline="Clarity begins with structure.">
        <p>x</p>
      </AuthCard>
    );
    expect(screen.getByText('Clarity begins with structure.')).toBeInTheDocument();
  });

  it('does not render tagline when omitted', () => {
    wrap(
      <AuthCard>
        <p>x</p>
      </AuthCard>
    );
    expect(screen.queryByText('Clarity begins with structure.')).not.toBeInTheDocument();
  });
});

describe('AuthMessage', () => {
  it('renders message text', () => {
    wrap(<AuthMessage message="Something went wrong." />);
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
  });

  it('has role="status"', () => {
    wrap(<AuthMessage message="Error." />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders nothing when message is null', () => {
    wrap(<AuthMessage message={null} />);
    // Should not render a status element when message is null
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
