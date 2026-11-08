import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as money from '@/lib/api/moneyProfile';
import * as tx from '@/lib/api/transactions';
import { S6Snapshot } from '@/pages/S6Snapshot';
import { S12Account } from '@/pages/S12Account';
import { renderWithRouter, setOnline } from './helpers';
import { thando } from './fixtures';

vi.mock('@/lib/api/moneyProfile');
vi.mock('@/lib/api/transactions');
vi.mock('@/lib/api/auth');

describe('Phase 5 additions to S6 and S12', () => {
  beforeEach(() => {
    setOnline(true);
    vi.mocked(money.getMoneyProfile).mockResolvedValue(thando);
    vi.mocked(tx.deleteAllTransactions).mockReset().mockResolvedValue({ ok: true });
  });

  it('T-S6-2 the Flag card appears with open flags and opens S8 on Flagged', async () => {
    vi.mocked(tx.getOpenFlagCount).mockResolvedValue(3);
    render(renderWithRouter(<S6Snapshot />, { path: '/snapshot' }));
    fireEvent.click(await screen.findByRole('button', { name: '3 transactions need checking' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/transactions?filter=flagged');
  });

  it('T-S6-2 there is no Flag card without open flags', async () => {
    vi.mocked(tx.getOpenFlagCount).mockResolvedValue(0);
    render(renderWithRouter(<S6Snapshot />, { path: '/snapshot' }));
    await screen.findByText('36%');
    expect(screen.queryByText(/need checking/)).not.toBeInTheDocument();
  });

  it('T-S12-2 the row is hidden with 0 transactions', async () => {
    vi.mocked(tx.getTransactionCount).mockResolvedValue(0);
    render(renderWithRouter(<S12Account />, { path: '/account' }));
    await waitFor(() => expect(tx.getTransactionCount).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: 'Delete all transactions' })).not.toBeInTheDocument();
  });

  it('T-S12-2 M8 states the count and Delete shows the Toast', async () => {
    vi.mocked(tx.getTransactionCount).mockResolvedValue(62);
    render(renderWithRouter(<S12Account />, { path: '/account' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Delete all transactions' }));
    expect(screen.getByText("This deletes all 62 transactions and their flags. You can't undo this.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(await screen.findByText('All transactions deleted.')).toBeInTheDocument();
    expect(tx.deleteAllTransactions).toHaveBeenCalled();
  });
});
