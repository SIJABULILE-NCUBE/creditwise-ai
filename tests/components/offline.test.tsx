import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { M1Debt } from '@/modals/M1Debt';
import { M2Expense } from '@/modals/M2Expense';
import { M3AddTransactions } from '@/modals/M3AddTransactions';
import { M4FlagDetails } from '@/modals/M4FlagDetails';
import { M5WhatIf } from '@/modals/M5WhatIf';
import { M6Guide } from '@/modals/M6Guide';
import { M8ConfirmDelete } from '@/modals/M8ConfirmDelete';
import { M9PrivacyNotice } from '@/modals/M9PrivacyNotice';
import { renderWithRouter, setOnline } from './helpers';
import { thando } from './fixtures';
import { gym } from './transactionFixtures';
import { mockLoadedData, mockSetUpData, SCREENS } from './screenList';

vi.mock('@/lib/api/auth');
vi.mock('@/lib/api/moneyProfile');
vi.mock('@/lib/api/transactions');
vi.mock('@/lib/api/ask');
vi.mock('@/lib/api/guides');

const OFFLINE = "You're offline. Changes won't be saved.";

describe('T-NFR-1 offline', () => {
  beforeEach(() => {
    mockLoadedData();
    setOnline(false);
  });
  afterEach(() => setOnline(true));

  it.each(SCREENS)('T-NFR-1 $name shows the banner and disables saving', async (screenCase) => {
    if (screenCase.setUp) mockSetUpData();
    render(renderWithRouter(screenCase.ui, { path: screenCase.path, auth: screenCase.auth }));
    await screen.findAllByText(screenCase.ready);
    expect(screen.getAllByText(OFFLINE).length).toBeGreaterThan(0);
    for (const name of screenCase.disabledOffline) {
      await waitFor(() => expect(screen.getByRole('button', { name })).toBeDisabled());
    }
  });

  it('T-NFR-1 S9 input is disabled', async () => {
    const s9 = SCREENS.find((s) => s.name === 'S9')!;
    render(renderWithRouter(s9.ui, { path: s9.path }));
    expect(await screen.findByLabelText('Your question')).toBeDisabled();
  });

  it('T-NFR-1 M1 and M2 cannot save or delete', () => {
    render(<M1Debt isOpen onClose={vi.fn()} onSaved={vi.fn()} debt={thando.debts[0]} />);
    expect(screen.getByRole('button', { name: 'Save debt' })).toBeDisabled();
    render(<M2Expense isOpen onClose={vi.fn()} onSaved={vi.fn()} expense={thando.expenses[0]} />);
    expect(screen.getByRole('button', { name: 'Save expense' })).toBeDisabled();
    expect(screen.getAllByText(OFFLINE)).toHaveLength(2);
  });

  it('T-NFR-1 M3 cannot upload or add', () => {
    render(<M3AddTransactions isOpen onClose={vi.fn()} onSaved={vi.fn()} />);
    expect(screen.getByText(OFFLINE)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload' })).toBeDisabled();
  });

  it('T-NFR-1 M4 cannot change a flag', () => {
    render(<M4FlagDetails transaction={gym} onClose={vi.fn()} onChanged={vi.fn()} />);
    expect(screen.getByText(OFFLINE)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Looks fine' })).toBeDisabled();
  });

  it('T-NFR-1 M6 cannot tick', async () => {
    render(<M6Guide slug="vehicle-finance" title="Vehicle finance" onClose={vi.fn()} />);
    expect(await screen.findByLabelText('I have my 3 latest payslips')).toBeDisabled();
    expect(screen.getByText(OFFLINE)).toBeInTheDocument();
  });

  it('T-NFR-1 M8 cannot delete', () => {
    render(<M8ConfirmDelete isOpen title="Delete Gym?" body="Body" onConfirm={vi.fn()} onDone={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
  });

  it('T-NFR-1 M5 still works', () => {
    render(<M5WhatIf data={thando} onClose={vi.fn()} />);
    fireEvent.click(screen.getByLabelText(/Clothing store card/));
    expect(screen.getByText('36% → 31%')).toBeInTheDocument();
  });

  it('T-NFR-1 M9 still works', () => {
    render(<M9PrivacyNotice isOpen onClose={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'What we collect' })).toBeInTheDocument();
  });
});
