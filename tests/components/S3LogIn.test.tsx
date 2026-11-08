import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as auth from '@/lib/api/auth';
import { S3LogIn } from '@/pages/S3LogIn';
import { renderWithRouter, thandoAuth, setOnline } from './helpers';

vi.mock('@/lib/api/auth');

const loggedOutAuth = { ...thandoAuth, session: null, account: null };

async function logIn() {
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'thando.nkosi@example.com' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'creditwise1' } });
  fireEvent.click(screen.getByRole('button', { name: 'Log in' }));
}

describe('S3 Log In', () => {
  beforeEach(() => {
    setOnline(true);
    vi.mocked(auth.logIn).mockReset();
    vi.mocked(auth.resendVerification).mockReset();
  });
  afterEach(() => vi.useRealTimers());

  it('T-US2-1 logs in and hands off to the redirect rules', async () => {
    vi.mocked(auth.logIn).mockResolvedValue({ ok: true });
    render(renderWithRouter(<S3LogIn />, { path: '/log-in', auth: loggedOutAuth }));
    await logIn();
    await waitFor(() => expect(auth.logIn).toHaveBeenCalledWith('thando.nkosi@example.com', 'creditwise1'));
  });

  it('T-US2-2 shows the unverified message and a Resend email link', async () => {
    vi.mocked(auth.logIn).mockResolvedValue({ ok: false, kind: 'unverified' });
    render(renderWithRouter(<S3LogIn />, { path: '/log-in', auth: loggedOutAuth }));
    await logIn();
    expect(await screen.findByText('Please verify your email first.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Resend email' })).toBeInTheDocument();
  });

  it('T-AUTH-2 shows the rate-limit message and disables Log in; wrong details have their own message', async () => {
    vi.mocked(auth.logIn).mockResolvedValueOnce({ ok: false, kind: 'wrong' });
    render(renderWithRouter(<S3LogIn />, { path: '/log-in', auth: loggedOutAuth }));
    await logIn();
    expect(await screen.findByText('Email or password is incorrect.')).toBeInTheDocument();
    vi.mocked(auth.logIn).mockResolvedValueOnce({ ok: false, kind: 'locked' });
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByText('Too many attempts. Wait 5 minutes and try again.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log in' })).toBeDisabled();
  });

  it('T-AUTH-3 Resend email sends again, shows the Toast and is disabled for 60 seconds', async () => {
    vi.mocked(auth.logIn).mockResolvedValue({ ok: false, kind: 'unverified' });
    vi.mocked(auth.resendVerification).mockResolvedValue(true);
    render(renderWithRouter(<S3LogIn />, { path: '/log-in', auth: loggedOutAuth }));
    await logIn();
    const resend = await screen.findByRole('button', { name: 'Resend email' });
    vi.useFakeTimers();
    fireEvent.click(resend);
    await act(async () => {
      await Promise.resolve();
    });
    expect(auth.resendVerification).toHaveBeenCalledWith('thando.nkosi@example.com');
    expect(screen.getByText('Verification email sent.')).toBeInTheDocument();
    expect(resend).toBeDisabled();
    act(() => {
      vi.advanceTimersByTime(59_000);
    });
    expect(resend).toBeDisabled();
    act(() => {
      vi.advanceTimersByTime(1_000);
    });
    expect(resend).toBeEnabled();
  });

  it.each([
    ['verify', 'Check your email and tap the link to verify your account.'],
    ['passwordChanged', 'Password changed. Log in with your new password.'],
    ['loggedOut', 'You were logged out to keep your money details safe. Log in again.'],
  ])('T-S3-1 shows the %s banner', (banner, text) => {
    render(renderWithRouter(<S3LogIn />, { path: '/log-in', initialEntry: { pathname: '/log-in', state: { banner } }, auth: loggedOutAuth }));
    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it('T-S3-2 Offline disables Log in', () => {
    setOnline(false);
    render(renderWithRouter(<S3LogIn />, { path: '/log-in', auth: loggedOutAuth }));
    expect(screen.getByRole('button', { name: 'Log in' })).toBeDisabled();
    setOnline(true);
  });
});
