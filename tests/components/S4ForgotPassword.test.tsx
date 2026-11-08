import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as auth from '@/lib/api/auth';
import { S4ForgotPassword } from '@/pages/S4ForgotPassword';
import { renderWithRouter, setOnline } from './helpers';

vi.mock('@/lib/api/auth');

describe('S4 Forgot Password', () => {
  beforeEach(() => {
    setOnline(true);
    vi.mocked(auth.requestPasswordReset).mockReset();
  });

  it('T-US2-3 always shows the same confirmation after sending', async () => {
    vi.mocked(auth.requestPasswordReset).mockResolvedValue(true);
    render(renderWithRouter(<S4ForgotPassword />, { path: '/forgot-password' }));
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'nobody@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send link' }));
    expect(await screen.findByText("If an account exists for this email, we've sent a reset link.")).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to log in' })).toHaveAttribute('href', '/log-in');
  });

  it('T-S4-1 shows the server error', async () => {
    vi.mocked(auth.requestPasswordReset).mockResolvedValue(false);
    render(renderWithRouter(<S4ForgotPassword />, { path: '/forgot-password' }));
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'nobody@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send link' }));
    expect(await screen.findByText('Something went wrong. Try again.')).toBeInTheDocument();
  });

  it('T-S4-2 Offline disables Send link', () => {
    setOnline(false);
    render(renderWithRouter(<S4ForgotPassword />, { path: '/forgot-password' }));
    expect(screen.getByRole('button', { name: 'Send link' })).toBeDisabled();
    setOnline(true);
  });
});
