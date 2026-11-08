import React, { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { MoneyField } from '../components/MoneyField';
import { OfflineBanner } from '../components/OfflineBanner';
import { SelectField } from '../components/SelectField';
import { TextField } from '../components/TextField';
import { deleteDebt, saveDebt, type Debt } from '../lib/api/moneyProfile';
import { parseMoney } from '../lib/money';
import { DEBT_TYPES, validateDebt } from '../lib/rules/debtExpense';
import { useOnline } from '../lib/useOnline';
import { M8ConfirmDelete } from './M8ConfirmDelete';

export interface M1DebtProps {
  isOpen: boolean;
  debt?: Debt;
  onClose: () => void;
  onSaved: (toast: string) => void;
}

const blank = { name: '', type: '', monthlyRepayment: '', balanceOwing: '' };

export const M1Debt: React.FC<M1DebtProps> = ({ isOpen, debt, onClose, onSaved }) => {
  const online = useOnline();
  const [form, setForm] = useState(blank);
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm(
      debt
        ? { name: debt.name, type: debt.type, monthlyRepayment: String(debt.monthly_repayment), balanceOwing: debt.balance_owing === null ? '' : String(debt.balance_owing) }
        : blank,
    );
    setShowErrors(false);
    setError(null);
  }, [isOpen, debt]);

  const errors = validateDebt(form);
  const shown = showErrors ? errors : {};
  const set = (field: keyof typeof blank) => (value: string) => setForm((f) => ({ ...f, [field]: value }));

  const save = async () => {
    if (Object.keys(errors).length > 0) {
      setShowErrors(true);
      return;
    }
    setSaving(true);
    setError(null);
    const result = await saveDebt(
      { name: form.name.trim(), type: form.type, monthly_repayment: parseMoney(form.monthlyRepayment) as number, balance_owing: form.balanceOwing.trim() === '' ? null : parseMoney(form.balanceOwing) },
      debt?.id,
    );
    setSaving(false);
    if (result.ok) onSaved('Debt saved');
    else setError(result.error);
  };

  return (
    <>
      <Modal isOpen={isOpen && !confirming} onClose={onClose} title={debt ? 'Edit debt' : 'Add a debt'} maxWidth="480">
        <OfflineBanner />
        <div className="space-y-4">
          <TextField label="Name" placeholder="e.g. Clothing store card" value={form.name} onChange={(e) => set('name')(e.target.value)} error={shown.name} />
          <SelectField label="Type" placeholder="Choose a type" options={DEBT_TYPES} value={form.type} onChange={set('type')} error={shown.type} />
          <MoneyField label="Monthly repayment" placeholder="e.g. 1200" helperText="The amount on your statement each month." value={form.monthlyRepayment} onChange={(e) => set('monthlyRepayment')(e.target.value)} error={shown.monthlyRepayment} />
          <MoneyField label="Balance owing" placeholder="Optional, e.g. 6400" value={form.balanceOwing} onChange={(e) => set('balanceOwing')(e.target.value)} error={shown.balanceOwing} />
          {error && (
            <p role="alert" className="text-sm text-appError">
              {error}
            </p>
          )}
          <Button className="w-full" onClick={save} loading={saving} disabled={!online}>
            {saving ? 'Saving…' : 'Save debt'}
          </Button>
          <Button variant="secondary" className="w-full" onClick={onClose}>
            Cancel
          </Button>
          {debt && (
            <Button variant="danger-text" className="w-full" disabled={!online} onClick={() => setConfirming(true)}>
              Delete
            </Button>
          )}
        </div>
      </Modal>
      {debt && (
        <M8ConfirmDelete
          isOpen={confirming}
          title={`Delete ${debt.name}?`}
          body="Your Snapshot will update straight away."
          onConfirm={() => deleteDebt(debt.id)}
          onDone={() => {
            setConfirming(false);
            onSaved('Debt deleted');
          }}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  );
};
