import { Component, ReactNode } from 'react';
import { Button, Container, Text, Title } from '@mantine/core';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error): void {
    // Allowed for production debugging of unexpected crashes.
    // eslint-disable-next-line no-console -- intentional error reporting in boundary
    console.error('ErrorBoundary caught an error', error);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container size="sm" py="xl">
          <Title order={2}>Something went wrong</Title>
          <Text c="dimmed" mt="md">
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <Button mt="xl" onClick={this.handleReset}>
            Try Again
          </Button>
        </Container>
      );
    }

    return this.props.children;
  }
}
