import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as api from '@/lib/api/moneyProfile';
import { S7MyMoney } from '@/pages/S7MyMoney';
import { renderWithRouter, setOnline } from './helpers';
import { ayanda, thando } from './fixtures';

vi.mock('@/lib/api/moneyProfile');

const open = () => render(renderWithRouter(<S7MyMoney />, { path: '/my-money' }));

describe('S7 My Money', () => {
  beforeEach(() => {
    setOnline(true);
    vi.mocked(api.getMoneyProfile).mockReset().mockResolvedValue(thando);
    vi.mocked(api.saveDebt).mockReset().mockResolvedValue({ ok: true });
    vi.mocked(api.saveIncome).mockReset().mockResolvedValue({ ok: true });
  });

  it('T-US5-1 editing a debt saves it, closes M1, shows the Toast and uses the new total', async () => {
    open();
    fireEvent.click(await screen.findByRole('button', { name: /Clothing store card/ }));
    const updated = { ...thando, debts: thando.debts.map((d) => (d.id === 'd4' ? { ...d, monthly_repayment: 1500 } : d)) };
    vi.mocked(api.getMoneyProfile).mockResolvedValue(updated);
    fireEvent.change(screen.getByLabelText('Monthly repayment'), { target: { value: '1500' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save debt' }));
    expect(await screen.findByText('Debt saved')).toBeInTheDocument();
    expect(api.saveDebt).toHaveBeenCalledWith({ name: 'Clothing store card', type: 'Store account', monthly_repayment: 1500, balance_owing: 6400 }, 'd4');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(await screen.findByText('R9,300.00 a month')).toBeInTheDocument();
  });

  it('T-US5-3 at the limits Add is disabled with the exact message', async () => {
    const debts = Array.from({ length: 15 }, (_, i) => ({ ...thando.debts[0], id: `d${i}` }));
    const expenses = Array.from({ length: 20 }, (_, i) => ({ ...thando.expenses[0], id: `e${i}` }));
    vi.mocked(api.getMoneyProfile).mockResolvedValue({ ...thando, debts, expenses });
    open();
    expect(await screen.findByRole('button', { name: 'Add debt' })).toBeDisabled();
    expect(screen.getByText("You've reached the limit of 15 debts.")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add expense' })).toBeDisabled();
    expect(screen.getByText("You've reached the limit of 20 expenses.")).toBeInTheDocument();
  });

  it('T-S7-1 income edit mode saves and shows the Toast; Cancel restores', async () => {
    open();
    fireEvent.click(await screen.findByRole('button', { name: 'Edit' }));
    const gross = screen.getByLabelText('Monthly income before deductions (gross)');
    fireEvent.change(gross, { target: { value: '26000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save income' }));
    expect(await screen.findByText('Income saved')).toBeInTheDocument();
    expect(api.saveIncome).toHaveBeenCalledWith(26000, 19800);
    fireEvent.click(await screen.findByRole('button', { name: 'Edit' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('button', { name: 'Save income' })).not.toBeInTheDocument();
  });

  it('T-S7-1 shows the empty messages and sorts rows highest first', async () => {
    vi.mocked(api.getMoneyProfile).mockResolvedValue({ ...ayanda, expenses: [] });
    const { unmount } = open() as ReturnType<typeof render>;
    expect(await screen.findByText('No debts added. Your DTI is 0%.')).toBeInTheDocument();
    expect(screen.getByText('Add at least 1 expense so your Money left is correct.')).toBeInTheDocument();
    unmount();
    vi.mocked(api.getMoneyProfile).mockResolvedValue({ ...thando, debts: [...thando.debts].reverse() });
    open();
    const card = (await screen.findByRole('heading', { name: 'Debts' })).closest('[data-testid="debts-card"]') as HTMLElement;
    const names = within(card).getAllByRole('button').map((b) => b.textContent ?? '');
    expect(names[0]).toContain('Personal loan');
    expect(names[3]).toContain('Clothing store card');
  });

  it('T-S7-2 shows the load error with Try again, and Offline disables editing', async () => {
    vi.mocked(api.getMoneyProfile).mockResolvedValueOnce(null);
    open();
    expect(await screen.findByText("We couldn't load your money details. Try again.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await screen.findByRole('heading', { name: 'Debts' });
    setOnline(false);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Edit' })).toBeDisabled());
    expect(screen.getByRole('button', { name: 'Add debt' })).toBeDisabled();
    setOnline(true);
  });
});
