import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as api from '@/lib/api/moneyProfile';
import { M1Debt } from '@/modals/M1Debt';
import { setOnline } from './helpers';
import { thando } from './fixtures';

vi.mock('@/lib/api/moneyProfile');

describe('M1 Debt', () => {
  beforeEach(() => {
    setOnline(true);
    vi.mocked(api.saveDebt).mockReset();
  });

  it('T-US5-1 adds a debt and reports the saved toast', async () => {
    vi.mocked(api.saveDebt).mockResolvedValue({ ok: true });
    const onSaved = vi.fn();
    render(<M1Debt isOpen onClose={vi.fn()} onSaved={onSaved} />);
    expect(screen.getByText('Add a debt')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Store' } });
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'Store account' } });
    fireEvent.change(screen.getByLabelText('Monthly repayment'), { target: { value: '1200' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save debt' }));
    await waitFor(() => expect(onSaved).toHaveBeenCalledWith('Debt saved'));
    expect(api.saveDebt).toHaveBeenCalledWith({ name: 'Store', type: 'Store account', monthly_repayment: 1200, balance_owing: null }, undefined);
  });

  it('T-M1-1 refuses invalid fields with the exact messages and shows a save error', async () => {
    vi.mocked(api.saveDebt).mockResolvedValue({ ok: false, error: "We couldn't save that. Try again." });
    render(<M1Debt isOpen onClose={vi.fn()} onSaved={vi.fn()} debt={thando.debts[0]} />);
    expect(screen.getByText('Edit debt')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'A' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save debt' }));
    expect(await screen.findByText('Enter a name of 2 to 40 characters.')).toBeInTheDocument();
    expect(api.saveDebt).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Loan' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save debt' }));
    expect(await screen.findByText("We couldn't save that. Try again.")).toBeInTheDocument();
  });

  it('T-M1-2 Offline disables Save debt and Delete', () => {
    setOnline(false);
    render(<M1Debt isOpen onClose={vi.fn()} onSaved={vi.fn()} debt={thando.debts[0]} />);
    expect(screen.getByRole('button', { name: 'Save debt' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
    setOnline(true);
  });
});
