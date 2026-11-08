import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import * as auth from '@/lib/api/auth';
import App from '@/App';
import { INACTIVITY_LIMIT_MS, ABSOLUTE_LIMIT_MS, LOGIN_AT_KEY, LAST_ACTIVITY_KEY } from '@/lib/session';
import { setOnline } from './helpers';

vi.mock('@/lib/api/transactions');
vi.mock('@/lib/api/auth');

type Listener = Parameters<typeof auth.onAuthChange>[0];
let authListener: Listener;

const session = { userId: 'u1', email: 'thando.nkosi@example.com' };
const complete = { firstName: 'Thando', email: session.email, completed: true, setupStep: 3 };
const incomplete = { ...complete, completed: false, setupStep: 2 };

function renderAt(entry: string) {
  render(
    <MemoryRouter initialEntries={[entry]}>
      <App />
    </MemoryRouter>,
  );
}

function setUp(s: typeof session | null, account: typeof complete | null) {
  vi.mocked(auth.getSession).mockResolvedValue(s);
  vi.mocked(auth.getAccount).mockResolvedValue(account);
}

describe('App navigation', () => {
  beforeEach(() => {
    localStorage.clear();
    setOnline(true);
    vi.mocked(auth.logOut).mockReset().mockResolvedValue(undefined);
    vi.mocked(auth.onAuthChange).mockReset().mockImplementation((fn) => {
      authListener = fn;
      return () => {};
    });
  });

  it('T-NAV-1 a logged-out visitor opening a protected route goes to S1', async () => {
    setUp(null, null);
    renderAt('/snapshot');
    expect(await screen.findByRole('heading', { name: 'See your money the way a lender does.' })).toBeInTheDocument();
  });

  it('T-NAV-1 a user with an incomplete profile always goes to S5', async () => {
    setUp(session, incomplete);
    renderAt('/snapshot');
    expect(await screen.findByRole('heading', { name: 'Set up your money profile' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Main' })).not.toBeInTheDocument();
  });

  it('T-NAV-1 a user with a complete profile opening S3 goes to S6 with the tab bar', async () => {
    setUp(session, complete);
    renderAt('/log-in');
    expect(await screen.findByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Snapshot' })).toHaveAttribute('aria-current', 'page');
  });

  it('T-NAV-1 a user with a complete profile cannot open S5', async () => {
    setUp(session, complete);
    renderAt('/set-up');
    expect(await screen.findByRole('navigation', { name: 'Main' })).toBeInTheDocument();
  });

  it('T-NAV-2 /log-in?verified=1 shows the verified banner', async () => {
    setUp(null, null);
    renderAt('/log-in?verified=1');
    expect(await screen.findByText('Your email is verified. Log in to continue.')).toBeInTheDocument();
  });

  it('T-NAV-3 a PASSWORD_RECOVERY session stays on S11', async () => {
    setUp(session, complete);
    renderAt('/set-new-password');
    await waitFor(() => expect(auth.onAuthChange).toHaveBeenCalled());
    act(() => authListener('PASSWORD_RECOVERY', session));
    expect(await screen.findByRole('heading', { name: 'Choose a new password' })).toBeInTheDocument();
    expect(screen.getByLabelText('New password')).toBeInTheDocument();
  });

  it('T-AUTH-4 30 minutes of inactivity signs out and shows the S3 banner', async () => {
    const now = Date.now();
    localStorage.setItem(LOGIN_AT_KEY, String(now - INACTIVITY_LIMIT_MS - 1000));
    localStorage.setItem(LAST_ACTIVITY_KEY, String(now - INACTIVITY_LIMIT_MS - 1000));
    setUp(session, complete);
    renderAt('/snapshot');
    expect(await screen.findByText('You were logged out to keep your money details safe. Log in again.')).toBeInTheDocument();
    expect(auth.logOut).toHaveBeenCalled();
  });

  it('T-AUTH-4 7 days after log-in signs out even when recently active', async () => {
    const now = Date.now();
    localStorage.setItem(LOGIN_AT_KEY, String(now - ABSOLUTE_LIMIT_MS - 1000));
    localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
    setUp(session, complete);
    renderAt('/snapshot');
    expect(await screen.findByText('You were logged out to keep your money details safe. Log in again.')).toBeInTheDocument();
  });
});
