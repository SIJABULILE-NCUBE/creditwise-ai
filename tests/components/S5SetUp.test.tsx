import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as api from '@/lib/api/moneyProfile';
import { S5SetUp } from '@/pages/S5SetUp';
import { takeFlash } from '@/lib/flash';
import { renderWithRouter, setOnline, thandoAuth } from './helpers';
import { newUser, thando } from './fixtures';

vi.mock('@/lib/api/moneyProfile');
vi.mock('@/lib/api/auth');

const atStep = (setupStep: number, overrides = {}) => ({ ...newUser, profile: { ...newUser.profile, grossIncome: 25000, netIncome: 19800, setupStep }, ...overrides });
const open = () => render(renderWithRouter(<S5SetUp />, { path: '/set-up', auth: { ...thandoAuth, refreshAccount: vi.fn().mockResolvedValue(undefined) } }));

describe('S5 Set Up', () => {
  beforeEach(() => {
    setOnline(true);
    vi.mocked(api.saveIncome).mockReset().mockResolvedValue({ ok: true });
    vi.mocked(api.saveSetup).mockReset().mockResolvedValue({ ok: true });
  });

  it('T-US4-1 saves income and moves to step 2', async () => {
    vi.mocked(api.getMoneyProfile).mockResolvedValue(newUser);
    open();
    fireEvent.change(await screen.findByLabelText('Monthly income before deductions (gross)'), { target: { value: '25000' } });
    fireEvent.change(screen.getByLabelText('Monthly take-home pay (net)'), { target: { value: '19800' } });
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByText('Step 2 of 3')).toBeInTheDocument();
    expect(api.saveIncome).toHaveBeenCalledWith(25000, 19800);
    expect(api.saveSetup).toHaveBeenCalledWith({ setupStep: 2 });
  });

  it('T-US4-2 net above gross shows the message on blur and disables Next', async () => {
    vi.mocked(api.getMoneyProfile).mockResolvedValue(newUser);
    open();
    fireEvent.change(await screen.findByLabelText('Monthly income before deductions (gross)'), { target: { value: '10000' } });
    const net = screen.getByLabelText('Monthly take-home pay (net)');
    fireEvent.change(net, { target: { value: '12000' } });
    fireEvent.blur(net);
    expect(await screen.findByText("Take-home pay can't be more than your income before deductions.")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('T-US4-3 See my snapshot completes the profile and goes to S6 with the Toast waiting', async () => {
    vi.mocked(api.getMoneyProfile).mockResolvedValue({ ...thando, profile: { ...thando.profile, setupStep: 3, completedAt: null } });
    open();
    fireEvent.click(await screen.findByRole('button', { name: 'See my snapshot' }));
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/snapshot'));
    expect(api.saveSetup).toHaveBeenCalledWith({ setupStep: 3, hasNoDebts: false, complete: true });
    expect(takeFlash()).toBe('Your Snapshot is ready.');
  });

  it('T-US4-3 ticking the no-debts box also allows completion', async () => {
    vi.mocked(api.getMoneyProfile).mockResolvedValue(atStep(3, { expenses: thando.expenses }));
    open();
    fireEvent.click(await screen.findByLabelText("I don't have any debts"));
    fireEvent.click(screen.getByRole('button', { name: 'See my snapshot' }));
    await waitFor(() => expect(api.saveSetup).toHaveBeenCalledWith({ setupStep: 3, hasNoDebts: true, complete: true }));
  });

  it('T-US4-4 no debts and box unticked keeps the button disabled with the hint', async () => {
    vi.mocked(api.getMoneyProfile).mockResolvedValue(atStep(3, { expenses: thando.expenses }));
    open();
    expect(await screen.findByRole('button', { name: 'See my snapshot' })).toBeDisabled();
    expect(screen.getByText("Add a debt or tick 'I don't have any debts'.")).toBeInTheDocument();
    expect(screen.getByText('No debts added yet.')).toBeInTheDocument();
  });

  it('T-S5-1 step 2 is empty until an expense exists; Next is disabled', async () => {
    vi.mocked(api.getMoneyProfile).mockResolvedValue(atStep(2));
    open();
    expect(await screen.findByText('No expenses added yet.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('T-S5-2 a failed save shows the error and keeps the values', async () => {
    vi.mocked(api.getMoneyProfile).mockResolvedValue(newUser);
    vi.mocked(api.saveIncome).mockResolvedValue({ ok: false, error: "We couldn't save that. Try again." });
    open();
    const gross = await screen.findByLabelText('Monthly income before deductions (gross)');
    fireEvent.change(gross, { target: { value: '25000' } });
    fireEvent.change(screen.getByLabelText('Monthly take-home pay (net)'), { target: { value: '19800' } });
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByText("We couldn't save that. Try again.")).toBeInTheDocument();
    expect(gross).toHaveValue('25000');
  });
});
