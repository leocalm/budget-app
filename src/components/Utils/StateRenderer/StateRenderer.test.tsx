import { describe, expect, it, vi } from 'vitest';
import { render, screen, userEvent } from '@/test-utils';
import { StateRenderer } from './StateRenderer';

describe('StateRenderer', () => {
  it('renders children when state is active', () => {
    render(
      <StateRenderer data-testid="state-renderer">
        <div>Active content</div>
      </StateRenderer>
    );

    expect(screen.getByText('Active content')).toBeInTheDocument();
    expect(screen.queryByTestId('state-renderer')).not.toBeInTheDocument();
  });

  it('applies precedence and renders locked over all other states', async () => {
    const user = userEvent.setup();
    const onLockAction = vi.fn();

    render(
      <StateRenderer
        isLocked
        hasError
        isLoading
        isEmpty
        lockMessage="Lock message"
        lockAction={{ label: 'Configure now', onClick: onLockAction }}
        errorMessage="Error message"
        emptyMessage="Empty message"
        data-testid="state-renderer"
      >
        <div>Active content</div>
      </StateRenderer>
    );

    expect(screen.getByText('Lock message')).toBeInTheDocument();
    expect(screen.queryByText('Error message')).not.toBeInTheDocument();
    expect(screen.queryByText('Empty message')).not.toBeInTheDocument();
    expect(screen.queryByText('Active content')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Configure now' }));
    expect(onLockAction).toHaveBeenCalledTimes(1);
  });

  it('renders error over loading and empty and triggers retry', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(
      <StateRenderer
        hasError
        isLoading
        isEmpty
        errorMessage="Could not load"
        onRetry={onRetry}
        emptyMessage="Empty message"
      >
        <div>Active content</div>
      </StateRenderer>
    );

    expect(screen.getByText('Could not load')).toBeInTheDocument();
    expect(screen.queryByText('Empty message')).not.toBeInTheDocument();
    expect(screen.queryByText('Active content')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders loading over empty', () => {
    render(
      <StateRenderer isLoading isEmpty emptyMessage="Empty message" data-testid="state-renderer">
        <div>Active content</div>
      </StateRenderer>
    );

    expect(screen.getByTestId('state-renderer')).toBeInTheDocument();
    expect(screen.queryByText('Empty message')).not.toBeInTheDocument();
    expect(screen.queryByText('Active content')).not.toBeInTheDocument();
  });

  it('renders empty state and handles empty action', async () => {
    const user = userEvent.setup();
    const onEmptyAction = vi.fn();

    render(
      <StateRenderer
        isEmpty
        emptyTitle="Nothing here"
        emptyMessage="Add your first item"
        emptyAction={{ label: 'Create item', onClick: onEmptyAction }}
      >
        <div>Active content</div>
      </StateRenderer>
    );

    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(screen.getByText('Add your first item')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Create item' }));
    expect(onEmptyAction).toHaveBeenCalledTimes(1);
  });
});
