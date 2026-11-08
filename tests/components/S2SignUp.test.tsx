import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as auth from '@/lib/api/auth';
import { S2SignUp } from '@/pages/S2SignUp';
import { renderWithRouter, setOnline } from './helpers';

vi.mock('@/lib/api/auth');

function fillForm() {
  fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Thando' } });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'Thando@Example.com' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'creditwise1' } });
  fireEvent.click(screen.getByLabelText('I am 18 or older'));
  fireEvent.click(screen.getByRole('checkbox', { name: /I agree to the/ }));
}

describe('S2 Sign Up', () => {
  beforeEach(() => {
    setOnline(true);
    vi.mocked(auth.signUp).mockReset();
  });

  it('T-US1-1 creates the account and goes to S3 with the verify banner', async () => {
    vi.mocked(auth.signUp).mockResolvedValue({ ok: true });
    render(renderWithRouter(<S2SignUp />, { path: '/sign-up' }));
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/log-in'));
    expect(auth.signUp).toHaveBeenCalledWith({ firstName: 'Thando', email: 'thando@example.com', password: 'creditwise1' });
  });

  it('T-US1-2 shows the already-registered message with a Log in link to S3', async () => {
    vi.mocked(auth.signUp).mockResolvedValue({ ok: false, kind: 'exists' });
    render(renderWithRouter(<S2SignUp />, { path: '/sign-up' }));
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    const alert = await screen.findByText('This email already has an account. Log in instead?');
    const link = within(alert.parentElement as HTMLElement).getByRole('link', { name: 'Log in' });
    expect(link).toHaveAttribute('href', '/log-in');
  });

  it('T-US1-3 keeps Create account disabled until valid, and shows the password error on blur', () => {
    render(renderWithRouter(<S2SignUp />, { path: '/sign-up' }));
    const button = screen.getByRole('button', { name: 'Create account' });
    expect(button).toBeDisabled();
    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Thando' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'thando@example.com' } });
    const password = screen.getByLabelText('Password');
    fireEvent.change(password, { target: { value: 'short1' } });
    fireEvent.blur(password);
    expect(screen.getByText('At least 10 characters, with a letter and a number.', { selector: '[role=alert] span' })).toBeInTheDocument();
    expect(password.className).toContain('border-appError');
    fireEvent.change(password, { target: { value: 'creditwise1' } });
    fireEvent.click(screen.getByLabelText('I am 18 or older'));
    expect(button).toBeDisabled();
    fireEvent.click(screen.getByRole('checkbox', { name: /I agree to the/ }));
    expect(button).toBeEnabled();
  });

  it('T-S2-1 shows the server error, keeps the values, and disables the button offline', async () => {
    vi.mocked(auth.signUp).mockResolvedValue({ ok: false, kind: 'server' });
    render(renderWithRouter(<S2SignUp />, { path: '/sign-up' }));
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByText('Something went wrong. Try again.')).toBeInTheDocument();
    expect(screen.getByLabelText('First name')).toHaveValue('Thando');
    setOnline(false);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Create account' })).toBeDisabled());
    expect(screen.getByText("You're offline. Changes won't be saved.")).toBeInTheDocument();
    setOnline(true);
  });
});
