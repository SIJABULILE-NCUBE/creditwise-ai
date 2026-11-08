import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as api from '@/lib/api/moneyProfile';
import { M2Expense } from '@/modals/M2Expense';
import { setOnline } from './helpers';
import { thando } from './fixtures';

vi.mock('@/lib/api/moneyProfile');

describe('M2 Expense', () => {
  beforeEach(() => {
    setOnline(true);
    vi.mocked(api.saveExpense).mockReset().mockResolvedValue({ ok: true });
    vi.mocked(api.deleteExpense).mockReset().mockResolvedValue({ ok: true });
  });

  it('T-M2-1 adds an expense', async () => {
    const onSaved = vi.fn();
    render(<M2Expense isOpen onClose={vi.fn()} onSaved={onSaved} />);
    expect(screen.getByText('Add an expense')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Rent' } });
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Housing' } });
    fireEvent.change(screen.getByLabelText('Monthly amount'), { target: { value: '4800' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save expense' }));
    await waitFor(() => expect(onSaved).toHaveBeenCalledWith('Expense saved'));
    expect(api.saveExpense).toHaveBeenCalledWith({ name: 'Rent', category: 'Housing', monthly_amount: 4800 }, undefined);
  });

  it('T-M2-1 edits an expense', async () => {
    const onSaved = vi.fn();
    render(<M2Expense isOpen onClose={vi.fn()} onSaved={onSaved} expense={thando.expenses[0]} />);
    expect(screen.getByText('Edit expense')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save expense' }));
    await waitFor(() => expect(onSaved).toHaveBeenCalledWith('Expense saved'));
    expect(api.saveExpense).toHaveBeenCalledWith({ name: 'Rent', category: 'Housing', monthly_amount: 4800 }, 'e1');
  });

  it('T-M2-2 deleting through M8 removes it and reports the toast', async () => {
    const onSaved = vi.fn();
    render(<M2Expense isOpen onClose={vi.fn()} onSaved={onSaved} expense={thando.expenses[4]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(screen.getByText('Delete Gym?')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Delete' }).at(-1) as HTMLElement);
    await waitFor(() => expect(onSaved).toHaveBeenCalledWith('Expense deleted'));
    expect(api.deleteExpense).toHaveBeenCalledWith('e5');
  });
});
