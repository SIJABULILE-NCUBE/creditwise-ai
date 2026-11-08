import React, { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { MoneyField } from '../components/MoneyField';
import { OfflineBanner } from '../components/OfflineBanner';
import { SelectField } from '../components/SelectField';
import { TextField } from '../components/TextField';
import { deleteExpense, saveExpense, type Expense } from '../lib/api/moneyProfile';
import { parseMoney } from '../lib/money';
import { EXPENSE_CATEGORIES, validateExpense } from '../lib/rules/debtExpense';
import { useOnline } from '../lib/useOnline';
import { M8ConfirmDelete } from './M8ConfirmDelete';

export interface M2ExpenseProps {
  isOpen: boolean;
  expense?: Expense;
  onClose: () => void;
  onSaved: (toast: string) => void;
}

const blank = { name: '', category: '', monthlyAmount: '' };

export const M2Expense: React.FC<M2ExpenseProps> = ({ isOpen, expense, onClose, onSaved }) => {
  const online = useOnline();
  const [form, setForm] = useState(blank);
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm(expense ? { name: expense.name, category: expense.category, monthlyAmount: String(expense.monthly_amount) } : blank);
    setShowErrors(false);
    setError(null);
  }, [isOpen, expense]);

  const errors = validateExpense(form);
  const shown = showErrors ? errors : {};
  const set = (field: keyof typeof blank) => (value: string) => setForm((f) => ({ ...f, [field]: value }));

  const save = async () => {
    if (Object.keys(errors).length > 0) {
      setShowErrors(true);
      return;
    }
    setSaving(true);
    setError(null);
    const result = await saveExpense({ name: form.name.trim(), category: form.category, monthly_amount: parseMoney(form.monthlyAmount) as number }, expense?.id);
    setSaving(false);
    if (result.ok) onSaved('Expense saved');
    else setError(result.error);
  };

  return (
    <>
      <Modal isOpen={isOpen && !confirming} onClose={onClose} title={expense ? 'Edit expense' : 'Add an expense'} maxWidth="480">
        <OfflineBanner />
        <div className="space-y-4">
          <TextField label="Name" placeholder="e.g. Rent" value={form.name} onChange={(e) => set('name')(e.target.value)} error={shown.name} />
          <SelectField label="Category" placeholder="Choose a category" options={EXPENSE_CATEGORIES} value={form.category} onChange={set('category')} error={shown.category} />
          <MoneyField label="Monthly amount" placeholder="e.g. 4800" value={form.monthlyAmount} onChange={(e) => set('monthlyAmount')(e.target.value)} error={shown.monthlyAmount} />
          {error && (
            <p role="alert" className="text-sm text-appError">
              {error}
            </p>
          )}
          <Button className="w-full" onClick={save} loading={saving} disabled={!online}>
            {saving ? 'Saving…' : 'Save expense'}
          </Button>
          <Button variant="secondary" className="w-full" onClick={onClose}>
            Cancel
          </Button>
          {expense && (
            <Button variant="danger-text" className="w-full" disabled={!online} onClick={() => setConfirming(true)}>
              Delete
            </Button>
          )}
        </div>
      </Modal>
      {expense && (
        <M8ConfirmDelete
          isOpen={confirming}
          title={`Delete ${expense.name}?`}
          body="Your Snapshot will update straight away."
          onConfirm={() => deleteExpense(expense.id)}
          onDone={() => {
            setConfirming(false);
            onSaved('Expense deleted');
          }}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  );
};
