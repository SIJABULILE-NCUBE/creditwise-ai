import React, { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { MoneyField } from '../components/MoneyField';
import { OfflineBanner } from '../components/OfflineBanner';
import { TextField } from '../components/TextField';
import { addTransaction, importCsv } from '../lib/api/transactions';
import { todaySast } from '../lib/dates';
import { parseMoney } from '../lib/money';
import { importToast, validateManualTransaction } from '../lib/rules/transaction';
import { useOnline } from '../lib/useOnline';

const MAX_BYTES = 1024 * 1024;
const NOT_CSV = 'Please choose a .csv file. In Excel, use Save As and choose CSV.';
const TOO_BIG = 'This file is bigger than 1 MB or has more than 500 rows. Split it into smaller files.';

export interface M3AddTransactionsProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (toast: string) => void;
}

export const M3AddTransactions: React.FC<M3AddTransactionsProps> = ({ isOpen, onClose, onSaved }) => {
  const online = useOnline();
  const [tab, setTab] = useState<'upload' | 'one'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [date, setDate] = useState(todaySast());
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [direction, setDirection] = useState<'out' | 'in'>('out');
  const [fieldErrors, setFieldErrors] = useState<{ date?: string; description?: string; amount?: string }>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setTab('upload');
    setFile(null);
    setDate(todaySast());
    setDescription('');
    setAmount('');
    setDirection('out');
    setFieldErrors({});
    setError(null);
  }, [isOpen]);

  const chooseFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = event.target.files?.[0] ?? null;
    setError(null);
    setFile(null);
    if (!chosen) return;
    if (!chosen.name.toLowerCase().endsWith('.csv')) setError(NOT_CSV);
    else if (chosen.size > MAX_BYTES) setError(TOO_BIG);
    else setFile(chosen);
  };

  const upload = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    const result = await importCsv(file);
    setBusy(false);
    if (result.ok) onSaved(importToast(result));
    else setError(result.error);
  };

  const addOne = async () => {
    const parsed = parseMoney(amount);
    const errors = validateManualTransaction({ date, description, amount: parsed }, todaySast());
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0 || parsed === null) return;
    setBusy(true);
    setError(null);
    const result = await addTransaction({ date, description, amount: parsed, direction });
    setBusy(false);
    if (result.ok) onSaved('Transaction added');
    else setError(result.error);
  };

  const tabClass = (active: boolean) => `min-h-touch flex-1 rounded-button text-base ${active ? 'bg-primary text-white' : 'text-mainText'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} variant="bottomSheet" maxWidth="480" title="Add transactions">
      <OfflineBanner />
      <div className="space-y-4">
        <div className="flex gap-1 rounded-button border border-appBorder p-1">
          <button type="button" className={tabClass(tab === 'upload')} onClick={() => setTab('upload')}>
            Upload CSV
          </button>
          <button type="button" className={tabClass(tab === 'one')} onClick={() => setTab('one')}>
            Add one
          </button>
        </div>

        {tab === 'upload' ? (
          <>
            <p className="text-base text-mainText">1. Download the template. 2. Copy your bank activity into it: date, description and amount (minus for money out). 3. Save it as CSV and upload it here.</p>
            <a href="/creditwise-template.csv" download className="inline-flex min-h-touch items-center text-base text-primary underline">
              Download template
            </a>
            <div>
              <label className="inline-flex h-12 cursor-pointer items-center rounded-button border border-primary bg-surface px-5 text-base font-medium text-primary focus-within:ring-2 focus-within:ring-accent">
                Choose file
                <input type="file" accept=".csv" className="sr-only" onChange={chooseFile} />
              </label>
              <p className="mt-1 text-sm text-secondaryText">{file ? `${file.name} (${Math.max(1, Math.round(file.size / 1024))} KB)` : 'No file chosen'}</p>
            </div>
            <p className="text-sm text-secondaryText">Up to 500 rows and 1 MB. Only the last 90 days are kept.</p>
          </>
        ) : (
          <>
            <TextField label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} error={fieldErrors.date} />
            <TextField label="Description" placeholder="e.g. Taxi fare" value={description} onChange={(e) => setDescription(e.target.value)} error={fieldErrors.description} />
            <MoneyField label="Amount" placeholder="e.g. 45" value={amount} onChange={(e) => setAmount(e.target.value)} error={fieldErrors.amount} />
            <div className="flex gap-1 rounded-button border border-appBorder p-1" role="group" aria-label="Money in or out">
              <button type="button" aria-pressed={direction === 'out'} className={tabClass(direction === 'out')} onClick={() => setDirection('out')}>
                Money out
              </button>
              <button type="button" aria-pressed={direction === 'in'} className={tabClass(direction === 'in')} onClick={() => setDirection('in')}>
                Money in
              </button>
            </div>
          </>
        )}

        {busy && tab === 'upload' && <p className="text-sm text-secondaryText">Checking your file…</p>}
        {error && (
          <p role="alert" className="text-sm text-appError">
            {error}
          </p>
        )}

        {tab === 'upload' ? (
          <Button className="w-full" loading={busy} disabled={!file || !online} onClick={upload}>
            Upload
          </Button>
        ) : (
          <Button className="w-full" loading={busy} disabled={!online} onClick={addOne}>
            Add transaction
          </Button>
        )}
      </div>
    </Modal>
  );
};
