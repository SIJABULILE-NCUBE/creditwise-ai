import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as api from '@/lib/api/guides';
import { M6Guide } from '@/modals/M6Guide';
import { setOnline } from './helpers';
import { vehicleGuide } from './guideFixtures';

vi.mock('@/lib/api/guides');

const payslips = 'I have my 3 latest payslips';
const open = () => render(<M6Guide slug="vehicle-finance" title="Vehicle finance" onClose={vi.fn()} />);

describe('M6 Guide', () => {
  beforeEach(() => {
    setOnline(true);
    vi.mocked(api.getGuide).mockReset().mockResolvedValue(vehicleGuide);
    vi.mocked(api.setTick).mockReset().mockResolvedValue({ ok: true });
  });

  it('T-US11-1 shows the sections and checklist', async () => {
    open();
    expect(await screen.findByRole('heading', { name: 'How it works' })).toBeInTheDocument();
    expect(screen.getByText('Vehicle finance lets you buy a car.')).toBeInTheDocument();
    expect(screen.getByLabelText(payslips)).toBeInTheDocument();
    expect(screen.getByText('Not started')).toBeInTheDocument();
  });

  it('T-US11-2 ticking saves and updates the progress at once', async () => {
    open();
    fireEvent.click(await screen.findByLabelText(payslips));
    expect(screen.getByText('1 of 6 done')).toBeInTheDocument();
    expect(screen.getByLabelText(payslips)).toBeChecked();
    await waitFor(() => expect(api.setTick).toHaveBeenCalledWith('i0', true));
  });

  it('T-US11-3 Offline: ticking does nothing and the banner shows', async () => {
    open();
    const box = await screen.findByLabelText(payslips);
    setOnline(false);
    await waitFor(() => expect(box).toBeDisabled());
    await userEvent.click(box);
    expect(box).not.toBeChecked();
    expect(api.setTick).not.toHaveBeenCalled();
    expect(screen.getByText("You're offline. Changes won't be saved.")).toBeInTheDocument();
    setOnline(true);
  });

  it('T-M6-3 closing waits for a tick that is still saving', async () => {
    let finish: (v: { ok: true }) => void = () => {};
    vi.mocked(api.setTick).mockReturnValue(new Promise((r) => (finish = r)));
    const onClose = vi.fn();
    render(<M6Guide slug="vehicle-finance" title="Vehicle finance" onClose={onClose} />);
    fireEvent.click(await screen.findByLabelText(payslips));
    fireEvent.click(screen.getAllByRole('button', { name: 'Close' }).at(-1) as HTMLElement);
    await Promise.resolve();
    expect(onClose).not.toHaveBeenCalled();
    finish({ ok: true });
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('T-M6-1 a failed save puts the tick back and shows the Toast', async () => {
    vi.mocked(api.setTick).mockResolvedValue({ ok: false, error: 'x' });
    open();
    const box = await screen.findByLabelText(payslips);
    fireEvent.click(box);
    expect(await screen.findByText("We couldn't save that tick. Try again.")).toBeInTheDocument();
    expect(box).not.toBeChecked();
    expect(screen.getByText('Not started')).toBeInTheDocument();
  });

  it('T-M6-2 shows placeholders while loading and the load error', async () => {
    vi.mocked(api.getGuide).mockResolvedValue(null);
    open();
    expect(screen.getByTestId('guide-loading')).toBeInTheDocument();
    expect(await screen.findByText("We couldn't load the guides. Try again.")).toBeInTheDocument();
  });

  it('T-S10-4 a guide loaded in this visit still opens when the server cannot be reached', async () => {
    const cache = new Map([['vehicle-finance', vehicleGuide]]);
    vi.mocked(api.getGuide).mockResolvedValue(null);
    setOnline(false);
    render(<M6Guide slug="vehicle-finance" title="Vehicle finance" onClose={vi.fn()} cache={cache} />);
    expect(await screen.findByText('Vehicle finance lets you buy a car.')).toBeInTheDocument();
    setOnline(true);
  });
});
