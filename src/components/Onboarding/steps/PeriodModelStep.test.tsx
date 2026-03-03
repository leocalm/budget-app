import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { updatePeriodModel } from '@/api/settings';
import { PeriodModelStep } from './PeriodModelStep';

vi.mock('@/api/settings', () => ({
  updatePeriodModel: vi.fn(),
}));

function renderStep(onComplete = vi.fn()) {
  return render(
    <MantineProvider>
      <PeriodModelStep onComplete={onComplete} />
    </MantineProvider>
  );
}

describe('PeriodModelStep', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders without showing advanced fields by default', () => {
    renderStep();
    expect(screen.queryByLabelText(/start day/i)).not.toBeInTheDocument();
  });

  it('shows advanced fields when Customize is toggled', () => {
    renderStep();
    fireEvent.click(screen.getByRole('switch', { name: /customize/i }));
    expect(screen.getByLabelText(/start day/i)).toBeInTheDocument();
  });

  it('calls updatePeriodModel and onComplete on Continue', async () => {
    vi.mocked(updatePeriodModel).mockResolvedValue({} as any);
    const onComplete = vi.fn();
    renderStep(onComplete);
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    await waitFor(() => expect(onComplete).toHaveBeenCalled());
    expect(updatePeriodModel).toHaveBeenCalledWith(
      expect.objectContaining({ periodMode: 'automatic' })
    );
  });

  it('Continue button shows loading state during API call', async () => {
    vi.mocked(updatePeriodModel).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );
    renderStep();
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled();
  });
});
