import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as api from '@/lib/api/guides';
import { S10GetReady } from '@/pages/S10GetReady';
import { renderWithRouter, setOnline } from './helpers';
import { guideList, vehicleGuide } from './guideFixtures';

vi.mock('@/lib/api/guides');

const open = () => render(renderWithRouter(<S10GetReady />, { path: '/get-ready' }));

describe('S10 Get Ready', () => {
  beforeEach(() => {
    setOnline(true);
    vi.mocked(api.listGuides).mockReset().mockResolvedValue(guideList);
    vi.mocked(api.getGuide).mockReset().mockResolvedValue(vehicleGuide);
  });

  it('T-S10-1 shows 3 cards with summaries and progress, and the credit report note', async () => {
    open();
    expect(await screen.findByText('Instalments, balloon payments and what dealers check.')).toBeInTheDocument();
    expect(screen.getByText('How personal loans work and what they really cost.')).toBeInTheDocument();
    expect(screen.getByText('Limits, interest-free days and minimum payments.')).toBeInTheDocument();
    expect(screen.getByText('2 of 6 done')).toBeInTheDocument();
    expect(screen.getAllByText('Not started')).toHaveLength(2);
    expect(screen.getByText('You can get your credit report free once a year from each credit bureau.')).toBeInTheDocument();
    expect(screen.getByText('Short guides on the most common types of credit, with a checklist of what to have ready before you apply.')).toBeInTheDocument();
  });

  it('T-US11-1 tapping a card opens M6 with its sections and 6 items', async () => {
    open();
    fireEvent.click(await screen.findByRole('button', { name: /Vehicle finance/ }));
    for (const heading of ['How it works', 'Words to know', 'What lenders check', 'Before you apply']) {
      expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument();
    }
    expect(screen.getAllByRole('checkbox')).toHaveLength(6);
    expect(api.getGuide).toHaveBeenCalledWith('vehicle-finance');
  });

  it('T-S10-2 Loading shows placeholders; a load error shows Try again', async () => {
    vi.mocked(api.listGuides).mockResolvedValueOnce(null);
    open();
    expect(screen.getByTestId('guides-loading')).toBeInTheDocument();
    expect(await screen.findByText("We couldn't load the guides. Try again.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('2 of 6 done')).toBeInTheDocument();
  });

  it('T-S10-3 progress is refreshed after closing M6', async () => {
    open();
    fireEvent.click(await screen.findByRole('button', { name: /Vehicle finance/ }));
    await screen.findByRole('heading', { name: 'Before you apply' });
    vi.mocked(api.listGuides).mockResolvedValue([{ ...guideList[0], done: 3 }, guideList[1], guideList[2]]);
    fireEvent.click(screen.getAllByRole('button', { name: 'Close' }).at(-1) as HTMLElement);
    expect(await screen.findByText('3 of 6 done')).toBeInTheDocument();
  });
});
