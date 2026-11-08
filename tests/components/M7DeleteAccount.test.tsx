import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as auth from '@/lib/api/auth';
import { S12Account } from '@/pages/S12Account';
import { renderWithRouter, setOnline } from './helpers';

vi.mock('@/lib/api/transactions');
vi.mock('@/lib/api/auth');

function openModal() {
  render(renderWithRouter(<S12Account />, { path: '/account' }));
  fireEvent.click(screen.getByRole('button', { name: 'Delete account' }));
}

describe('M7 Delete Account', () => {
  beforeEach(() => {
    setOnline(true);
    vi.mocked(auth.deleteAccount).mockReset();
  });

  it('T-US3-2 typing DELETE deletes the account and goes to S1', async () => {
    vi.mocked(auth.deleteAccount).mockResolvedValue(true);
    openModal();
    fireEvent.change(screen.getByLabelText('Type DELETE to confirm'), { target: { value: 'DELETE' } });
    fireEvent.click(screen.getByRole('button', { name: 'Delete my account' }));
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/'));
    expect(auth.deleteAccount).toHaveBeenCalled();
  });

  it.each(['delete', 'Delete', 'DELETE ', 'DEL'])('T-US3-3 "%s" keeps the button disabled', (value) => {
    openModal();
    fireEvent.change(screen.getByLabelText('Type DELETE to confirm'), { target: { value } });
    expect(screen.getByRole('button', { name: 'Delete my account' })).toBeDisabled();
  });

  it('T-M7-1 shows the error and Cancel closes', async () => {
    vi.mocked(auth.deleteAccount).mockResolvedValue(false);
    openModal();
    fireEvent.change(screen.getByLabelText('Type DELETE to confirm'), { target: { value: 'DELETE' } });
    fireEvent.click(screen.getByRole('button', { name: 'Delete my account' }));
    expect(await screen.findByText("We couldn't delete your account. Try again.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByText('Delete your account?')).not.toBeInTheDocument();
  });
});
