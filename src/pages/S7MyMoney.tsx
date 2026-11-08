import React, { useCallback, useEffect, useState } from 'react';
import { AccountButton } from '../components/AccountButton';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Header } from '../components/Header';
import { LoadingPlaceholder } from '../components/LoadingPlaceholder';
import { DebtRow, ExpenseRow } from '../components/MoneyRow';
import { MoneyField } from '../components/MoneyField';
import { OfflineBanner } from '../components/OfflineBanner';
import { Toast } from '../components/Toast';
import { getMoneyProfile, saveIncome, type Debt, type Expense, type MoneyProfileData } from '../lib/api/moneyProfile';
import { sumOf } from '../lib/calculations';
import { formatMoney, parseMoney } from '../lib/money';
import { MAX_DEBTS, MAX_EXPENSES } from '../lib/rules/debtExpense';
import { isIncomeComplete, validateIncome } from '../lib/rules/income';
import { useOnline } from '../lib/useOnline';
import { M1Debt } from '../modals/M1Debt';
import { M2Expense } from '../modals/M2Expense';

export const S7MyMoney: React.FC = () => {
  const online = useOnline();
  const [data, setData] = useState<MoneyProfileData | null>(null);
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading');
  const [editing, setEditing] = useState(false);
  const [gross, setGross] = useState('');
  const [net, setNet] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [debtModal, setDebtModal] = useState<{ debt?: Debt } | null>(null);
  const [expenseModal, setExpenseModal] = useState<{ expense?: Expense } | null>(null);

  const load = useCallback(async () => {
    const result = await getMoneyProfile();
    setData(result);
    setStatus(result ? 'ready' : 'error');
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const retry = () => {
    setStatus('loading');
    void load();
  };

  const startEditing = () => {
    if (!data) return;
    setGross(String(data.profile.grossIncome));
    setNet(String(data.profile.netIncome));
    setSaveError(null);
    setEditing(true);
  };

  const saveEdits = async () => {
    setSaving(true);
    setSaveError(null);
    const result = await saveIncome(parseMoney(gross) as number, parseMoney(net) as number);
    setSaving(false);
    if (!result.ok) {
      setSaveError(result.error);
      return;
    }
    setEditing(false);
    setToast('Income saved');
    void load();
  };

  const onSaved = (message: string) => {
    setDebtModal(null);
    setExpenseModal(null);
    setToast(message);
    void load();
  };

  const debts = [...(data?.debts ?? [])].sort((a, b) => b.monthly_repayment - a.monthly_repayment);
  const expenses = [...(data?.expenses ?? [])].sort((a, b) => b.monthly_amount - a.monthly_amount);
  const incomeErrors = validateIncome(gross, net);
  const atDebtLimit = debts.length >= MAX_DEBTS;
  const atExpenseLimit = expenses.length >= MAX_EXPENSES;

  return (
    <>
      <Header title="My Money" rightAction={<AccountButton />} />
      <OfflineBanner />
      <main className="mx-auto max-w-tablet space-y-4 p-4 tablet:p-6 desktop:max-w-desktop desktop:p-8">
        {status === 'loading' && (
          <div className="space-y-4">
            <LoadingPlaceholder variant="card" />
            <LoadingPlaceholder variant="card" />
            <LoadingPlaceholder variant="card" />
          </div>
        )}
        {status === 'error' && (
          <div className="space-y-3 text-center">
            <p className="text-base text-mainText">We couldn&apos;t load your money details. Try again.</p>
            <Button onClick={retry}>Try again</Button>
          </div>
        )}
        {status === 'ready' && data && (
          <>
            <Card className="space-y-3">
              {editing ? (
                <>
                  <MoneyField label="Monthly income before deductions (gross)" value={gross} onChange={(e) => setGross(e.target.value)} error={incomeErrors.gross} />
                  <MoneyField label="Monthly take-home pay (net)" value={net} onChange={(e) => setNet(e.target.value)} error={incomeErrors.net} />
                  {saveError && (
                    <p role="alert" className="text-sm text-appError">
                      {saveError}
                    </p>
                  )}
                  <Button className="w-full" loading={saving} disabled={!isIncomeComplete(gross, net) || !online} onClick={saveEdits}>
                    Save income
                  </Button>
                  <Button variant="secondary" className="w-full" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-secondaryText">Income before deductions (gross)</p>
                    <p className="font-mono text-base font-medium text-mainText">{formatMoney(data.profile.grossIncome as number)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondaryText">Take-home pay (net)</p>
                    <p className="font-mono text-base font-medium text-mainText">{formatMoney(data.profile.netIncome as number)}</p>
                  </div>
                  <button type="button" disabled={!online} onClick={startEditing} className={`min-h-touch min-w-touch text-base text-primary underline ${online ? '' : 'cursor-not-allowed opacity-40'}`}>
                    Edit
                  </button>
                </>
              )}
            </Card>

            <div className="space-y-4 desktop:grid desktop:grid-cols-2 desktop:gap-4 desktop:space-y-0">
              <Card className="space-y-2" data-testid="expenses-card">
                <div className="flex items-baseline justify-between">
                  <h2 className="text-lg font-semibold text-mainText">Expenses</h2>
                  <p className="font-mono text-sm text-mainText">{formatMoney(sumOf(expenses, (e) => e.monthly_amount))} a month</p>
                </div>
                {expenses.length === 0 && <p className="text-base text-secondaryText">Add at least 1 expense so your Money left is correct.</p>}
                {expenses.map((expense) => (
                  <ExpenseRow key={expense.id} expense={expense} onClick={() => setExpenseModal({ expense })} disabled={!online} />
                ))}
                <Button variant="secondary" className="w-full" disabled={atExpenseLimit || !online} onClick={() => setExpenseModal({})}>
                  Add expense
                </Button>
                {atExpenseLimit && <p className="text-sm text-secondaryText">You&apos;ve reached the limit of 20 expenses.</p>}
              </Card>

              <Card className="space-y-2" data-testid="debts-card">
                <div className="flex items-baseline justify-between">
                  <h2 className="text-lg font-semibold text-mainText">Debts</h2>
                  <p className="font-mono text-sm text-mainText">{formatMoney(sumOf(debts, (d) => d.monthly_repayment))} a month</p>
                </div>
                {debts.length === 0 && <p className="text-base text-secondaryText">No debts added. Your DTI is 0%.</p>}
                {debts.map((debt) => (
                  <DebtRow key={debt.id} debt={debt} onClick={() => setDebtModal({ debt })} disabled={!online} />
                ))}
                <Button variant="secondary" className="w-full" disabled={atDebtLimit || !online} onClick={() => setDebtModal({})}>
                  Add debt
                </Button>
                {atDebtLimit && <p className="text-sm text-secondaryText">You&apos;ve reached the limit of 15 debts.</p>}
              </Card>
            </div>
          </>
        )}
      </main>
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
      <M1Debt isOpen={debtModal !== null} debt={debtModal?.debt} onClose={() => setDebtModal(null)} onSaved={onSaved} />
      <M2Expense isOpen={expenseModal !== null} expense={expenseModal?.expense} onClose={() => setExpenseModal(null)} onSaved={onSaved} />
    </>
  );
};
