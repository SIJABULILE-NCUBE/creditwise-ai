import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as api from '@/lib/api/transactions';
import { S8Transactions } from '@/pages/S8Transactions';
import { renderWithRouter, setOnline } from './helpers';
import { allRows, flagged, page } from './transactionFixtures';

vi.mock('@/lib/api/transactions');

const open = (initialEntry = '/transactions') => render(renderWithRouter(<S8Transactions />, { path: '/transactions', initialEntry }));

describe('S8 Transactions', () => {
  beforeEach(() => {
    setOnline(true);
    vi.mocked(api.listTransactions).mockReset().mockImplementation(async (filter) => page(filter === 'flagged' ? flagged : allRows));
  });

  it('T-US8-1 the Flagged filter shows exactly the 3 flagged rows with their reasons', async () => {
    open();
    fireEvent.click(await screen.findByRole('button', { name: 'Flagged (3)' }));
    await waitFor(() => expect(screen.queryByText('SALARY ACME MEDIA')).not.toBeInTheDocument());
    expect(screen.getAllByTestId('flag-pill')).toHaveLength(3);
    expect(screen.getByText('-R399.00')).toBeInTheDocument();
    expect(screen.getByText('Possible double charge')).toBeInTheDocument();
    expect(screen.getByText('Higher than usual')).toBeInTheDocument();
    expect(screen.getByText('New payee')).toBeInTheDocument();
  });

  it('T-S6-2 opening with ?filter=flagged starts on the Flagged filter', async () => {
    open('/transactions?filter=flagged');
    await screen.findByText('FITZONE GYM DEBIT');
    expect(api.listTransactions).toHaveBeenCalledWith('flagged', 0);
  });

  it('T-US8-4 shows the empty state and opens M3', async () => {
    vi.mocked(api.listTransactions).mockResolvedValue(page([], { flaggedCount: 0 }));
    open();
    expect(await screen.findByText('No transactions yet. Upload your bank activity to check for double charges and unusual amounts.')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Add transactions' }).at(-1) as HTMLElement);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('T-US8-4 Flagged with no flags shows its own message', async () => {
    vi.mocked(api.listTransactions).mockImplementation(async (filter) => page(filter === 'flagged' ? [] : allRows, { flaggedCount: 0 }));
    open();
    fireEvent.click(await screen.findByRole('button', { name: 'Flagged (0)' }));
    expect(await screen.findByText("Nothing to check right now. We'll flag anything unusual when you add transactions.")).toBeInTheDocument();
  });

  it('T-S8-1 groups rows under date headings, newest first', async () => {
    open();
    const headings = await screen.findAllByRole('heading', { level: 2 });
    expect(headings.map((h) => h.textContent)).toEqual(['21 Oct 2026', '18 Oct 2026', '2 Oct 2026', '25 Sep 2026']);
  });

  it('T-S8-2 Show more loads the next page', async () => {
    vi.mocked(api.listTransactions).mockResolvedValueOnce(page(flagged, { hasMore: true }));
    open();
    fireEvent.click(await screen.findByRole('button', { name: 'Show more' }));
    await waitFor(() => expect(api.listTransactions).toHaveBeenCalledWith('all', 1));
  });

  it('T-S8-3 shows the load error with Try again; Offline disables Add transactions', async () => {
    vi.mocked(api.listTransactions).mockResolvedValueOnce(null);
    open();
    expect(await screen.findByText("We couldn't load your transactions. Try again.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await screen.findByText('FITZONE GYM DEBIT');
    setOnline(false);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Add transactions' })).toBeDisabled());
    expect(screen.getByRole('button', { name: /FITZONE GYM DEBIT/ })).toBeDisabled();
    setOnline(true);
  });
});
