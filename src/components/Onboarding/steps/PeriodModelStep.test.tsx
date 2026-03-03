import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { fetchPeriodModel, updatePeriodModel } from '@/api/settings';
import { PeriodModelStep } from './PeriodModelStep';

vi.mock('@/api/settings', () => ({
  fetchPeriodModel: vi.fn(),
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
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchPeriodModel).mockResolvedValue({
      periodMode: 'automatic',
      periodSchedule: null,
    } as any);
  });

  it('renders without showing advanced fields by default', () => {
    renderStep();
    expect(screen.queryByText(/start day/i)).not.toBeInTheDocument();
  });

  it('shows advanced fields when Customize is toggled', () => {
    renderStep();
    fireEvent.click(screen.getByRole('switch', { name: /customize/i }));
    expect(screen.getByText(/start day/i)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /increase day/i })).toHaveLength(3);
    expect(screen.getAllByRole('button', { name: /decrease day/i })).toHaveLength(3);
  });

  it('calls updatePeriodModel and onComplete on Continue', async () => {
    vi.mocked(updatePeriodModel).mockResolvedValue({} as any);
    const onComplete = vi.fn();
    renderStep(onComplete);
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    await waitFor(() => expect(onComplete).toHaveBeenCalled());
    expect(updatePeriodModel).toHaveBeenCalledWith(expect.objectContaining({ mode: 'automatic' }));
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
