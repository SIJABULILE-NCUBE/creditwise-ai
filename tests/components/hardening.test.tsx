import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router';
import * as auth from '@/lib/api/auth';
import * as money from '@/lib/api/moneyProfile';
import * as tx from '@/lib/api/transactions';
import App from '@/App';
import { TabLayout } from '@/components/TabLayout';
import { AuthContext } from '@/lib/authContext';
import { LAST_ACTIVITY_KEY, LOGIN_AT_KEY, INACTIVITY_LIMIT_MS } from '@/lib/session';
import { S8Transactions } from '@/pages/S8Transactions';
import { setOnline, thandoAuth } from './helpers';
import { thando } from './fixtures';
import { electricity, gym, page, salary, techStore } from './transactionFixtures';

vi.mock('@/lib/api/auth');
vi.mock('@/lib/api/moneyProfile');
vi.mock('@/lib/api/transactions');

describe('Edge cases', () => {
  beforeEach(() => {
    localStorage.clear();
    setOnline(true);
    vi.mocked(money.getMoneyProfile).mockResolvedValue(thando);
    vi.mocked(money.saveDebt).mockReset();
  });
  afterEach(() => vi.useRealTimers());

  it('T-EDGE-5 logged out after 30 minutes while typing in M1: nothing saved, then S6 after log-in', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
    type Listener = Parameters<typeof auth.onAuthChange>[0];
    let listener: Listener = () => {};
    const session = { userId: 'u1', email: 'thando.nkosi@example.com' };
    vi.mocked(auth.getSession).mockResolvedValue(session);
    vi.mocked(auth.getAccount).mockResolvedValue({ firstName: 'Thando', email: session.email, completed: true, setupStep: 3 });
    vi.mocked(auth.onAuthChange).mockImplementation((fn) => {
      listener = fn;
      return () => {};
    });
    vi.mocked(auth.logOut).mockResolvedValue(undefined);

    render(
      <MemoryRouter initialEntries={['/my-money']}>
        <App />
      </MemoryRouter>,
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Add debt' }));
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Half typed' } });

    const stale = String(Date.now() - INACTIVITY_LIMIT_MS - 1000);
    localStorage.setItem(LOGIN_AT_KEY, stale);
    localStorage.setItem(LAST_ACTIVITY_KEY, stale);
    act(() => {
      vi.advanceTimersByTime(30_000);
    });

    expect(await screen.findByText('You were logged out to keep your money details safe. Log in again.')).toBeInTheDocument();
    expect(money.saveDebt).not.toHaveBeenCalled();
    expect(screen.queryByText('Add a debt')).not.toBeInTheDocument();

    act(() => listener('SIGNED_IN', session));
    await waitFor(() => expect(screen.getByRole('link', { name: 'Snapshot' })).toHaveAttribute('aria-current', 'page'));
  });

  it('T-EDGE-4 after the daily cleanup a flagged old transaction is gone and the badge drops', async () => {
    vi.mocked(tx.listTransactions).mockResolvedValue(page([techStore, electricity, gym, salary]));
    vi.mocked(tx.getOpenFlagCount).mockResolvedValue(3);
    const view = () => (
      <AuthContext.Provider value={thandoAuth}>
        <MemoryRouter initialEntries={['/transactions']}>
          <Routes>
            <Route element={<TabLayout />}>
              <Route path="/transactions" element={<S8Transactions />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );
    const first = render(view());
    await screen.findByText('FITZONE GYM DEBIT');
    await waitFor(() => expect(screen.getByTestId('tab-badge')).toHaveTextContent('3'));
    first.unmount();

    vi.mocked(tx.listTransactions).mockResolvedValue(page([techStore, electricity, salary], { flaggedCount: 2 }));
    vi.mocked(tx.getOpenFlagCount).mockResolvedValue(2);
    render(view());
    await screen.findByText('ONLINE TECH STORE');
    expect(screen.queryByText('FITZONE GYM DEBIT')).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('tab-badge')).toHaveTextContent('2'));
  });

  it('T-NFR-7 on desktop S8 shows the transactions as a table', async () => {
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: query.includes('1024'), addEventListener: () => {}, removeEventListener: () => {} }));
    vi.mocked(tx.listTransactions).mockResolvedValue(page([techStore, salary]));
    render(
      <AuthContext.Provider value={thandoAuth}>
        <MemoryRouter>
          <S8Transactions />
        </MemoryRouter>
      </AuthContext.Provider>,
    );
    for (const name of ['Date', 'Description', 'Amount', 'Flag']) {
      expect(await screen.findByRole('columnheader', { name })).toBeInTheDocument();
    }
    expect(screen.getByRole('button', { name: 'ONLINE TECH STORE' })).toBeInTheDocument();
    expect(screen.getByText('SALARY ACME MEDIA').closest('button')).toBeNull();
    vi.unstubAllGlobals();
  });
});
