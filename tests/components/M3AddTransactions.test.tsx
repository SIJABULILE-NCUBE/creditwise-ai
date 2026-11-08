import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as api from '@/lib/api/transactions';
import { M3AddTransactions } from '@/modals/M3AddTransactions';
import { todaySast } from '@/lib/dates';
import { setOnline } from './helpers';

vi.mock('@/lib/api/transactions');

const onSaved = vi.fn();
const openSheet = () => render(<M3AddTransactions isOpen onClose={vi.fn()} onSaved={onSaved} />);
const choose = (name: string, content = 'date,description,amount\n') => fireEvent.change(screen.getByLabelText('Choose file'), { target: { files: [new File([content], name)] } });

describe('M3 Add Transactions', () => {
  beforeEach(() => {
    onSaved.mockReset();
    setOnline(true);
    vi.mocked(api.importCsv).mockReset();
    vi.mocked(api.addTransaction).mockReset();
  });

  it('T-US7-1 uploads a CSV and reports the result toast', async () => {
    vi.mocked(api.importCsv).mockResolvedValue({ ok: true, added: 62, skipped: 0, needChecking: 3 });
    openSheet();
    expect(screen.getByRole('button', { name: 'Upload' })).toBeDisabled();
    choose('thando-oct.csv');
    expect(screen.getByText(/thando-oct\.csv/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));
    await waitFor(() => expect(onSaved).toHaveBeenCalledWith('62 transactions added, 0 skipped. 3 need checking.'));
  });

  it('T-US7-2 a wrong template shows the message and stays open', async () => {
    const message = "This file doesn't match the CreditWise template. Download the template and try again.";
    vi.mocked(api.importCsv).mockResolvedValue({ ok: false, error: message });
    openSheet();
    choose('bad-header.csv');
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));
    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(onSaved).not.toHaveBeenCalled();
  });

  it('T-EDGE-7 an .xlsx file shows the message and nothing is uploaded', () => {
    openSheet();
    choose('sample.xlsx');
    expect(screen.getByText('Please choose a .csv file. In Excel, use Save As and choose CSV.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload' })).toBeDisabled();
    expect(api.importCsv).not.toHaveBeenCalled();
  });

  it('T-M3-1 a file over 1 MB is refused before upload', () => {
    openSheet();
    choose('big.csv', 'x'.repeat(1024 * 1024 + 1));
    expect(screen.getByText('This file is bigger than 1 MB or has more than 500 rows. Split it into smaller files.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload' })).toBeDisabled();
  });

  it('T-US7-4 Add one saves today’s Taxi fare as money out', async () => {
    vi.mocked(api.addTransaction).mockResolvedValue({ ok: true });
    openSheet();
    fireEvent.click(screen.getByRole('button', { name: 'Add one' }));
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Taxi fare' } });
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '45' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add transaction' }));
    await waitFor(() => expect(onSaved).toHaveBeenCalledWith('Transaction added'));
    expect(api.addTransaction).toHaveBeenCalledWith({ date: todaySast(), description: 'Taxi fare', amount: 45, direction: 'out' });
  });

  it('T-M3-2 Offline disables Upload and Add transaction', () => {
    setOnline(false);
    openSheet();
    choose('thando-oct.csv');
    expect(screen.getByRole('button', { name: 'Upload' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Add one' }));
    expect(screen.getByRole('button', { name: 'Add transaction' })).toBeDisabled();
    setOnline(true);
  });
});
