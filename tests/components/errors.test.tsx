import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import * as auth from '@/lib/api/auth';
import { callApi } from '@/lib/api/http';
import { notifySessionExpired } from '@/lib/session';
import App from '@/App';
import { setOnline } from './helpers';

vi.mock('@/lib/supabase', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: { access_token: 'token' } } }) } },
}));
vi.mock('@/lib/api/auth');
vi.mock('@/lib/api/moneyProfile');
vi.mock('@/lib/api/transactions');

const respond = (status: number, body: unknown) => vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status })));

describe('T-NFR-2 errors reach users as PRD messages', () => {
  beforeEach(() => setOnline(true));
  afterEach(() => vi.unstubAllGlobals());

  it('T-NFR-2 a raw server error becomes the general message', async () => {
    respond(500, { error: 'relation "users" does not exist' });
    expect(await callApi('/api/x', { method: 'POST' })).toEqual({ ok: false, status: 500, error: 'Something went wrong. Try again.' });
  });

  it('T-NFR-2 a 403 says not allowed', async () => {
    respond(403, { error: 'forbidden' });
    expect(await callApi('/api/x', { method: 'POST' })).toEqual({ ok: false, status: 403, error: "You can't do that." });
  });

  it('T-NFR-2 no connection becomes the general message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    expect(await callApi('/api/x', { method: 'POST' })).toEqual({ ok: false, status: 0, error: 'Something went wrong. Try again.' });
  });

  it('T-NFR-2 a 401 from the API signs the user out to S3 with the banner', async () => {
    localStorage.clear();
    const session = { userId: 'u1', email: 'thando.nkosi@example.com' };
    vi.mocked(auth.getSession).mockResolvedValue(session);
    vi.mocked(auth.getAccount).mockResolvedValue({ firstName: 'Thando', email: session.email, completed: true, setupStep: 3 });
    vi.mocked(auth.onAuthChange).mockReturnValue(() => {});
    vi.mocked(auth.logOut).mockResolvedValue(undefined);
    render(
      <MemoryRouter initialEntries={['/account']}>
        <App />
      </MemoryRouter>,
    );
    await screen.findByText('Thando');
    act(() => notifySessionExpired());
    expect(await screen.findByText('You were logged out to keep your money details safe. Log in again.')).toBeInTheDocument();
    await waitFor(() => expect(auth.logOut).toHaveBeenCalled());
  });

  it('T-NFR-2 callApi reports a 401 as an expired session', async () => {
    const listener = vi.fn();
    window.addEventListener('creditwise:session-expired', listener);
    respond(401, { error: 'x' });
    const result = await callApi('/api/x', { method: 'POST' });
    expect(result).toEqual({ ok: false, status: 401, error: 'You were logged out to keep your money details safe. Log in again.' });
    expect(listener).toHaveBeenCalled();
    window.removeEventListener('creditwise:session-expired', listener);
  });
});
