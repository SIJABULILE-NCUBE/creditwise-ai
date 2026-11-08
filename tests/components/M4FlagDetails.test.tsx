import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as api from '@/lib/api/transactions';
import { M4FlagDetails } from '@/modals/M4FlagDetails';
import { TabLayout } from '@/components/TabLayout';
import { S8Transactions } from '@/pages/S8Transactions';
import { MemoryRouter, Route, Routes } from 'react-router';
import { AuthContext } from '@/lib/authContext';
import { setOnline, thandoAuth } from './helpers';
import { flagged, gym, page } from './transactionFixtures';

vi.mock('@/lib/api/transactions');

const onChanged = vi.fn();
const sheet = (transaction = gym) => render(<M4FlagDetails transaction={transaction} onClose={vi.fn()} onChanged={onChanged} />);

describe('M4 Flag Details', () => {
  beforeEach(() => {
    onChanged.mockReset();
    setOnline(true);
    vi.mocked(api.setFlagStatus).mockReset().mockResolvedValue({ ok: true });
    vi.mocked(api.getEarlierPayments).mockReset().mockResolvedValue([{ id: 'g1', date: '2026-10-01', description: 'FITZONE GYM DEBIT', amount: -399 }]);
  });

  it('T-M4-1 shows the summary, explanation and status', async () => {
    sheet();
    expect(screen.getByText('FITZONE GYM DEBIT · 2 Oct 2026 · -R399.00')).toBeInTheDocument();
    expect(await screen.findByText(/We found 2 payments of R399\.00 to FITZONE GYM DEBIT within 3 days \(1 Oct 2026 and 2 Oct 2026\)/)).toBeInTheDocument();
    expect(screen.getByText('Status: Open')).toBeInTheDocument();
  });

  it('T-US8-2 "I\'ll query it" marks it querying and reports the Toast', async () => {
    sheet();
    fireEvent.click(screen.getByRole('button', { name: "I'll query it" }));
    await waitFor(() => expect(onChanged).toHaveBeenCalledWith('Marked as querying. Contact your bank to ask about it.'));
    expect(api.setFlagStatus).toHaveBeenCalledWith('t3', 'querying');
  });

  it('T-US8-2 the tab badge drops by 1 after a status change', async () => {
    vi.mocked(api.listTransactions).mockResolvedValue(page(flagged));
    vi.mocked(api.getOpenFlagCount).mockReset().mockResolvedValueOnce(3).mockResolvedValue(2);
    render(
      <AuthContext.Provider value={thandoAuth}>
        <MemoryRouter initialEntries={['/transactions']}>
          <Routes>
            <Route element={<TabLayout />}>
              <Route path="/transactions" element={<S8Transactions />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    );
    await waitFor(() => expect(screen.getByTestId('tab-badge')).toHaveTextContent('3'));
    fireEvent.click(await screen.findByRole('button', { name: /FITZONE GYM DEBIT/ }));
    fireEvent.click(await screen.findByRole('button', { name: "I'll query it" }));
    await waitFor(() => expect(screen.getByTestId('tab-badge')).toHaveTextContent('2'));
    expect(screen.getByText('Marked as querying. Contact your bank to ask about it.')).toBeInTheDocument();
  });

  it('T-US8-3 Looks fine, Undo and Sorted follow the allowed paths', async () => {
    sheet();
    fireEvent.click(screen.getByRole('button', { name: 'Looks fine' }));
    await waitFor(() => expect(onChanged).toHaveBeenCalledWith('Marked as fine.'));
    expect(api.setFlagStatus).toHaveBeenCalledWith('t3', 'dismissed');

    sheet({ ...gym, flag_status: 'dismissed' });
    expect(screen.getByText('Status: Dismissed')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    await waitFor(() => expect(onChanged).toHaveBeenCalledWith('Flag reopened.'));

    sheet({ ...gym, flag_status: 'querying' });
    fireEvent.click(screen.getByRole('button', { name: 'Sorted' }));
    await waitFor(() => expect(onChanged).toHaveBeenCalledWith('Marked as sorted.'));
  });

  it('T-US8-3 a resolved flag shows the date and no buttons', () => {
    sheet({ ...gym, flag_status: 'resolved', flag_status_changed_at: '2026-10-30T10:00:00Z' });
    expect(screen.getByText('Status: Sorted on 30 Oct 2026')).toBeInTheDocument();
    for (const name of ["I'll query it", 'Looks fine', 'Sorted', 'Undo']) {
      expect(screen.queryByRole('button', { name })).not.toBeInTheDocument();
    }
  });

  it('T-M4-2 shows the update error; Offline disables the buttons', async () => {
    vi.mocked(api.setFlagStatus).mockResolvedValue({ ok: false, error: "We couldn't update this flag. Try again." });
    sheet();
    fireEvent.click(screen.getByRole('button', { name: 'Looks fine' }));
    expect(await screen.findByText("We couldn't update this flag. Try again.")).toBeInTheDocument();
    setOnline(false);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Looks fine' })).toBeDisabled());
    setOnline(true);
  });
});
