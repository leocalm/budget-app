import { Component, ReactNode } from 'react';
import { ErrorState } from '../Utils';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary component that catches JavaScript errors anywhere in the child
 * component tree and displays a fallback UI using the ErrorState component.
 */
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

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          variant="fullPage"
          code={500}
          icon="💥"
          title="Something went wrong"
          message={
            this.state.error?.message ||
            "We're experiencing technical difficulties. Our team has been notified and is working on a fix."
          }
          primaryAction={{
            label: 'Refresh Page',
            icon: <span>🔄</span>,
            onClick: this.handleRefresh,
          }}
          secondaryAction={{
            label: 'Try Again',
            icon: <span>↩️</span>,
            onClick: this.handleReset,
          }}
          errorDetails={
            process.env.NODE_ENV === 'development' && this.state.error
              ? {
                  code: this.state.error.name,
                  timestamp: new Date().toISOString(),
                }
              : undefined
          }
          data-testid="error-boundary"
        />
      );
    }

    return this.props.children;
  }
}
