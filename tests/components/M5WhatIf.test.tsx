import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as api from '@/lib/api/moneyProfile';
import { M5WhatIf } from '@/modals/M5WhatIf';
import { setOnline } from './helpers';
import { thando } from './fixtures';

vi.mock('@/lib/api/moneyProfile');

const onClose = vi.fn();
const open = () => render(<M5WhatIf data={thando} onClose={onClose} />);
const CHANGED = 'Your debts changed. Close and open What if again.';

describe('M5 What If', () => {
  beforeEach(() => {
    onClose.mockReset();
    setOnline(true);
    vi.mocked(api.getMoneyProfile).mockReset().mockResolvedValue(thando);
    for (const write of [api.saveIncome, api.saveSetup, api.saveDebt, api.deleteDebt, api.saveExpense, api.deleteExpense]) vi.mocked(write).mockReset();
  });

  it('T-US12-1 before any tick the After column asks for one', () => {
    open();
    expect(screen.getByText('Tick a debt to see the change.')).toBeInTheDocument();
    expect(screen.getByText('R1,200.00 a month')).toBeInTheDocument();
  });

  it('T-US12-1 ticking the 2 store accounts shows the before and after figures', () => {
    open();
    fireEvent.click(screen.getByLabelText(/Clothing store card/));
    fireEvent.click(screen.getByLabelText(/Furniture store account/));
    for (const text of ['36% → 26%', 'Amber → Green', 'R1,702.00 → R4,202.00', 'R1,000.00 → R3,500.00']) {
      expect(screen.getByText(text)).toBeInTheDocument();
    }
    expect(screen.getByText('Green: healthy')).toBeInTheDocument();
    expect(screen.queryByText('Tick a debt to see the change.')).not.toBeInTheDocument();
  });

  it('T-US12-2 closing writes nothing', async () => {
    open();
    fireEvent.click(screen.getByLabelText(/Clothing store card/));
    await waitFor(() => expect(api.getMoneyProfile).toHaveBeenCalled());
    fireEvent.click(screen.getAllByRole('button', { name: 'Close' }).at(-1) as HTMLElement);
    expect(onClose).toHaveBeenCalledWith(false);
    for (const write of [api.saveIncome, api.saveSetup, api.saveDebt, api.deleteDebt, api.saveExpense, api.deleteExpense]) expect(write).not.toHaveBeenCalled();
  });

  it('T-EDGE-2 when debts changed elsewhere the next tick shows the message, then the next tap closes', async () => {
    vi.mocked(api.getMoneyProfile).mockResolvedValue({ ...thando, debts: thando.debts.slice(1) });
    open();
    fireEvent.click(screen.getByLabelText(/Clothing store card/));
    expect(await screen.findByText(CHANGED)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/Furniture store account/));
    expect(onClose).toHaveBeenCalledWith(true);
  });

  it('T-M5-1 works offline without re-reading the debts', () => {
    setOnline(false);
    open();
    expect(screen.getByText("You're offline. Changes won't be saved.")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/Clothing store card/));
    expect(screen.getByText('36% → 31%')).toBeInTheDocument();
    expect(api.getMoneyProfile).not.toHaveBeenCalled();
    setOnline(true);
  });
});
