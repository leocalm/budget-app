import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { createCategory, fetchCategoriesForManagement } from '@/api/category';
import { CategoriesStep } from './CategoriesStep';

vi.mock('@/api/category', () => ({
  createCategory: vi.fn(),
  fetchCategoriesForManagement: vi.fn(),
}));

function renderStep(ui: React.ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

describe('CategoriesStep', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchCategoriesForManagement).mockResolvedValue({
      incoming: [],
      outgoing: [],
      archived: [],
    } as any);
    vi.mocked(createCategory).mockResolvedValue({ id: '1' } as any);
  });

  it('renders three template options', () => {
    renderStep(<CategoriesStep onComplete={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByText(/essential 5/i)).toBeInTheDocument();
    expect(screen.getByText(/detailed 12/i)).toBeInTheDocument();
    expect(screen.getByText(/custom/i)).toBeInTheDocument();
  });

  it('pre-populates list when Essential 5 is selected', () => {
    renderStep(<CategoriesStep onComplete={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(screen.getByText(/essential 5/i));
    expect(screen.getByText('Income')).toBeInTheDocument();
    expect(screen.getByText('Housing')).toBeInTheDocument();
  });

  it('pre-populates 12 items when Detailed 12 is selected', () => {
    renderStep(<CategoriesStep onComplete={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(screen.getByText(/detailed 12/i));
    // Salary is one of the Detailed 12 categories
    expect(screen.getByText('Salary')).toBeInTheDocument();
  });

  it('Continue is disabled when category list is empty', () => {
    renderStep(<CategoriesStep onComplete={vi.fn()} onBack={vi.fn()} />);
    // Custom template = empty list by default
    expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled();
  });

  it('Continue is enabled after selecting Essential 5', () => {
    renderStep(<CategoriesStep onComplete={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(screen.getByText(/essential 5/i));
    expect(screen.getByRole('button', { name: /continue/i })).not.toBeDisabled();
  });

  it('calls createCategory for each category and onComplete on Continue', async () => {
    const onComplete = vi.fn();
    renderStep(<CategoriesStep onComplete={onComplete} onBack={vi.fn()} />);
    fireEvent.click(screen.getByText(/essential 5/i));
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    await waitFor(() => expect(onComplete).toHaveBeenCalled());
    expect(createCategory).toHaveBeenCalledTimes(5);
  });

  it('Back button calls onBack', () => {
    const onBack = vi.fn();
    renderStep(<CategoriesStep onComplete={vi.fn()} onBack={onBack} />);
    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(onBack).toHaveBeenCalled();
  });
});
