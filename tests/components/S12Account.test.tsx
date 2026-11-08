import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as auth from '@/lib/api/auth';
import { S12Account } from '@/pages/S12Account';
import { renderWithRouter, setOnline } from './helpers';

vi.mock('@/lib/api/auth');

describe('S12 Account', () => {
  beforeEach(() => {
    setOnline(true);
    vi.mocked(auth.logOut).mockReset();
    vi.mocked(auth.requestPasswordReset).mockReset();
  });

  it('T-S12-1 shows the avatar, name, email, rows, Delete account and the London line', () => {
    render(renderWithRouter(<S12Account />, { path: '/account' }));
    expect(screen.getByRole('img', { name: 'Account' })).toHaveTextContent('T');
    expect(screen.getByText('Thando')).toBeInTheDocument();
    expect(screen.getByText('thando.nkosi@example.com')).toBeInTheDocument();
    for (const name of ['Change password', 'Privacy Notice', 'Log out', 'Delete account']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
    expect(screen.getByText('CreditWise AI v1.0. Your data is stored in London, United Kingdom.')).toBeInTheDocument();
  });

  it('T-S12-1 Change password sends the reset email and shows the Toast', async () => {
    vi.mocked(auth.requestPasswordReset).mockResolvedValue(true);
    render(renderWithRouter(<S12Account />, { path: '/account' }));
    fireEvent.click(screen.getByRole('button', { name: 'Change password' }));
    expect(await screen.findByText("We've sent a reset link to your email.")).toBeInTheDocument();
    expect(auth.requestPasswordReset).toHaveBeenCalledWith('thando.nkosi@example.com');
  });

  it('T-US3-1 Log out goes to S1', async () => {
    vi.mocked(auth.logOut).mockResolvedValue(undefined);
    render(renderWithRouter(<S12Account />, { path: '/account' }));
    fireEvent.click(screen.getByRole('button', { name: 'Log out' }));
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/'));
    expect(auth.logOut).toHaveBeenCalled();
  });

  it('T-S12-3 Offline disables every row except Privacy Notice and Log out', () => {
    setOnline(false);
    render(renderWithRouter(<S12Account />, { path: '/account' }));
    expect(screen.getByRole('button', { name: 'Change password' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Delete account' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Privacy Notice' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Log out' })).toBeEnabled();
    setOnline(true);
  });
});
