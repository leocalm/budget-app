import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { render } from '@/test-utils';
import { FormOverlay } from './FormOverlay';

describe('FormOverlay', () => {
  it('closes immediately when there are no unsaved changes', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <MantineProvider>
        <FormOverlay opened onClose={onClose} title="Edit vendor" isDirty={false}>
          {(requestClose) => (
            <button type="button" onClick={requestClose}>
              Close overlay
            </button>
          )}
        </FormOverlay>
      </MantineProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Close overlay' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows discard confirmation when form is dirty', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <MantineProvider>
        <FormOverlay opened onClose={onClose} title="Edit vendor" isDirty>
          {(requestClose) => (
            <button type="button" onClick={requestClose}>
              Close overlay
            </button>
          )}
        </FormOverlay>
      </MantineProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Close overlay' }));

    expect(await screen.findByText('Discard changes?')).toBeInTheDocument();
    expect(screen.getByText("Your edits won't be saved.")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();

    await user.click(await screen.findByRole('button', { name: 'Discard' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
