import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as api from '@/lib/api/moneyProfile';
import { S6Snapshot } from '@/pages/S6Snapshot';
import { renderWithRouter, setOnline } from './helpers';
import { ayanda, sibusiso, thando } from './fixtures';

vi.mock('@/lib/api/transactions');
vi.mock('@/lib/api/moneyProfile');

const open = () => render(renderWithRouter(<S6Snapshot />, { path: '/snapshot' }));

describe('S6 Snapshot', () => {
  beforeEach(() => {
    setOnline(true);
    vi.mocked(api.getMoneyProfile).mockReset();
  });

  it('T-US6-1 shows Thando’s figures, scale, sentence and bar', async () => {
    vi.mocked(api.getMoneyProfile).mockResolvedValue(thando);
    open();
    expect(await screen.findByText('36%')).toBeInTheDocument();
    expect(screen.getByText('Hi Thando')).toBeInTheDocument();
    expect(screen.getByText('Updated 27 Oct 2026, 14:05')).toBeInTheDocument();
    expect(screen.getByText('Amber: getting stretched')).toBeInTheDocument();
    expect(screen.getByText('R1,702.00', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText('R1,000.00', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText('Your DTI is 36%, in the amber band')).toBeInTheDocument();
    expect(screen.getByText('R9,000.00 of your R25,000.00 monthly income goes to debt repayments.')).toBeInTheDocument();
    expect(screen.getByText("Bands are CreditWise's guide for learning, not a lender's rule.")).toBeInTheDocument();
    expect(screen.getByText('Expenses R9,098.00 (46%)')).toBeInTheDocument();
    expect(screen.getByText('Debt repayments R9,000.00 (45%)')).toBeInTheDocument();
    expect(screen.getByText('Money left R1,702.00 (9%)')).toBeInTheDocument();
  });

  it('T-US6-2 shows negative Money left, no Room and the overspend line', async () => {
    vi.mocked(api.getMoneyProfile).mockResolvedValue(sibusiso);
    open();
    const left = await screen.findByText('-R3,100.00');
    expect(left.className).toContain('text-appError');
    expect(screen.getByText("You're spending more than you take home.")).toBeInTheDocument();
    expect(screen.getByText('You have no Room before the Red band.')).toBeInTheDocument();
    expect(screen.getByText('Over by R3,100.00 each month')).toBeInTheDocument();
    expect(screen.queryByText(/^Money left R/)).not.toBeInTheDocument();
  });

  it('T-US6-3 a server error shows the message and Try again, with no numbers', async () => {
    vi.mocked(api.getMoneyProfile).mockResolvedValueOnce(null);
    open();
    expect(await screen.findByText("We couldn't load your Snapshot. Try again.")).toBeInTheDocument();
    expect(screen.queryByText('36%')).not.toBeInTheDocument();
    vi.mocked(api.getMoneyProfile).mockResolvedValueOnce(thando);
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('36%')).toBeInTheDocument();
  });

  it('T-S6-1 Ayanda shows 0% Green; Loading shows placeholders; Offline disables Ask', async () => {
    let resolve: (value: typeof ayanda) => void = () => {};
    vi.mocked(api.getMoneyProfile).mockReturnValue(new Promise((r) => (resolve = r)));
    open();
    expect(screen.getByTestId('snapshot-loading')).toBeInTheDocument();
    resolve(ayanda);
    expect(await screen.findByText('0%')).toBeInTheDocument();
    expect(screen.getByText('Green: healthy')).toBeInTheDocument();
    setOnline(false);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Ask about my Snapshot' })).toBeDisabled());
    expect(screen.getByText('0%')).toBeInTheDocument();
    setOnline(true);
  });

  it('T-EDGE-1 lower gross income moves the band to Red the next time S6 loads', async () => {
    vi.mocked(api.getMoneyProfile).mockResolvedValue({ ...thando, profile: { ...thando.profile, grossIncome: 20000 } });
    open();
    expect(await screen.findByText('Red: lenders may decline')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('T-EDGE-6 gross income of R1.00 shows 999%+', async () => {
    vi.mocked(api.getMoneyProfile).mockResolvedValue({ ...thando, profile: { ...thando.profile, grossIncome: 1, netIncome: 1 } });
    open();
    expect(await screen.findByText('999%+')).toBeInTheDocument();
  });
});
