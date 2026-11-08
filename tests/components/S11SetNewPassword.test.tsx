import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as auth from '@/lib/api/auth';
import { S11SetNewPassword } from '@/pages/S11SetNewPassword';
import { renderWithRouter, thandoAuth, setOnline } from './helpers';

vi.mock('@/lib/api/auth');

const recoveryAuth = { ...thandoAuth, recovery: true };

function fill(password: string, confirm: string) {
  fireEvent.change(screen.getByLabelText('New password'), { target: { value: password } });
  fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: confirm } });
}

describe('S11 Set New Password', () => {
  beforeEach(() => {
    setOnline(true);
    vi.mocked(auth.setNewPassword).mockReset();
  });

  it('T-US2-3 saves a valid password and goes to S3', async () => {
    vi.mocked(auth.setNewPassword).mockResolvedValue({ ok: true });
    render(renderWithRouter(<S11SetNewPassword />, { path: '/set-new-password', auth: recoveryAuth }));
    fill('creditwise2', 'creditwise2');
    fireEvent.click(screen.getByRole('button', { name: 'Save password' }));
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/log-in'));
    expect(auth.setNewPassword).toHaveBeenCalledWith('creditwise2');
  });

  it('T-US2-4 without a recovery session shows the expired state with Send a new link', () => {
    render(renderWithRouter(<S11SetNewPassword />, { path: '/set-new-password', auth: { ...thandoAuth, recovery: false } }));
    expect(screen.getByText('This link has expired. Ask for a new one.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Send a new link' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/forgot-password');
  });

  it('T-US2-4 mismatched passwords show the message', () => {
    render(renderWithRouter(<S11SetNewPassword />, { path: '/set-new-password', auth: recoveryAuth }));
    fill('creditwise2', 'creditwise3');
    fireEvent.blur(screen.getByLabelText('Confirm new password'));
    expect(screen.getByText("The passwords don't match.")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save password' })).toBeDisabled();
  });

  it('T-US2-4 a link that turns out to be expired on save shows the expired state', async () => {
    vi.mocked(auth.setNewPassword).mockResolvedValue({ ok: false, kind: 'expired' });
    render(renderWithRouter(<S11SetNewPassword />, { path: '/set-new-password', auth: recoveryAuth }));
    fill('creditwise2', 'creditwise2');
    fireEvent.click(screen.getByRole('button', { name: 'Save password' }));
    expect(await screen.findByText('This link has expired. Ask for a new one.')).toBeInTheDocument();
  });
});
