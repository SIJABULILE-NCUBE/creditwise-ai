import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as api from '@/lib/api/moneyProfile';
import { M1Debt } from '@/modals/M1Debt';
import { setOnline } from './helpers';
import { thando } from './fixtures';

vi.mock('@/lib/api/moneyProfile');

const clothing = thando.debts[3];

function openConfirm(onSaved = vi.fn()) {
  render(<M1Debt isOpen onClose={vi.fn()} onSaved={onSaved} debt={clothing} />);
  fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
  return onSaved;
}

describe('M8 Confirm Delete', () => {
  beforeEach(() => {
    setOnline(true);
    vi.mocked(api.deleteDebt).mockReset();
  });

  it('T-US5-2 confirms, deletes and reports Debt deleted', async () => {
    vi.mocked(api.deleteDebt).mockResolvedValue({ ok: true });
    const onSaved = openConfirm();
    expect(screen.getByText('Delete Clothing store card?')).toBeInTheDocument();
    expect(screen.getByText('Your Snapshot will update straight away.')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Delete' }).at(-1) as HTMLElement);
    await waitFor(() => expect(onSaved).toHaveBeenCalledWith('Debt deleted'));
    expect(api.deleteDebt).toHaveBeenCalledWith('d4');
  });

  it('T-M8-1 Cancel closes only M8; a failure shows the exact error', async () => {
    vi.mocked(api.deleteDebt).mockResolvedValue({ ok: false, error: "We couldn't delete that. Try again." });
    openConfirm();
    fireEvent.click(screen.getAllByRole('button', { name: 'Delete' }).at(-1) as HTMLElement);
    expect(await screen.findByText("We couldn't delete that. Try again.")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Cancel' }).at(-1) as HTMLElement);
    expect(screen.queryByText('Delete Clothing store card?')).not.toBeInTheDocument();
    expect(screen.getByText('Edit debt')).toBeInTheDocument();
  });
});
