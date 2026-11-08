import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/Button';
import { Checkbox } from '../components/Checkbox';
import { Header } from '../components/Header';
import { LoadingPlaceholder } from '../components/LoadingPlaceholder';
import { DebtRow, ExpenseRow } from '../components/MoneyRow';
import { MoneyField } from '../components/MoneyField';
import { OfflineBanner } from '../components/OfflineBanner';
import { Toast } from '../components/Toast';
import * as authApi from '../lib/api/auth';
import { getMoneyProfile, saveIncome, saveSetup, type Debt, type Expense, type MoneyProfileData } from '../lib/api/moneyProfile';
import { useAuth } from '../lib/authContext';
import { sumOf } from '../lib/calculations';
import { setFlash } from '../lib/flash';
import { formatMoney, parseMoney } from '../lib/money';
import { isIncomeComplete, validateIncome } from '../lib/rules/income';
import { canCompleteSetup } from '../lib/rules/setup';
import { clearSessionTimes } from '../lib/session';
import { useOnline } from '../lib/useOnline';
import { M1Debt } from '../modals/M1Debt';
import { M2Expense } from '../modals/M2Expense';

const SAVE_FAILED = "We couldn't save that. Try again.";

export const S5SetUp: React.FC = () => {
  const navigate = useNavigate();
  const online = useOnline();
  const { refreshAccount, markSignedOut } = useAuth();
  const [data, setData] = useState<MoneyProfileData | null>(null);
  const [step, setStep] = useState(1);
  const [gross, setGross] = useState('');
  const [net, setNet] = useState('');
  const [touched, setTouched] = useState({ gross: false, net: false });
  const [hasNoDebts, setHasNoDebts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [debtModal, setDebtModal] = useState<{ debt?: Debt } | null>(null);
  const [expenseModal, setExpenseModal] = useState<{ expense?: Expense } | null>(null);

  const reload = useCallback(async () => {
    const result = await getMoneyProfile();
    if (result) setData(result);
    return result;
  }, []);

  useEffect(() => {
    void reload().then((result) => {
      if (!result) {
        setError(SAVE_FAILED);
        return;
      }
      setStep(result.profile.setupStep);
      setHasNoDebts(result.profile.hasNoDebts);
      if (result.profile.grossIncome !== null) setGross(String(result.profile.grossIncome));
      if (result.profile.netIncome !== null) setNet(String(result.profile.netIncome));
    });
  }, [reload]);

  const run = async (action: () => Promise<{ ok: boolean }>, after: () => void) => {
    setSaving(true);
    setError(null);
    const result = await action();
    setSaving(false);
    if (result.ok) after();
    else setError(SAVE_FAILED);
  };

  const goToStep2 = () =>
    run(
      async () => {
        const income = await saveIncome(parseMoney(gross) as number, parseMoney(net) as number);
        return income.ok ? saveSetup({ setupStep: 2 }) : income;
      },
      () => setStep(2),
    );
  const goToStep3 = () => run(() => saveSetup({ setupStep: 3 }), () => setStep(3));
  const finish = () =>
    run(
      () => saveSetup({ setupStep: 3, hasNoDebts, complete: true }),
      () => {
        setFlash('Your Snapshot is ready.');
        void refreshAccount().then(() => navigate('/snapshot', { replace: true }));
      },
    );

  const logOut = async () => {
    await authApi.logOut();
    clearSessionTimes();
    markSignedOut?.();
    navigate('/', { replace: true });
  };

  const onSaved = (message: string) => {
    setDebtModal(null);
    setExpenseModal(null);
    setToast(message);
    void reload();
  };

  const incomeErrors = validateIncome(gross, net);
  const debts = data?.debts ?? [];
  const expenses = data?.expenses ?? [];
  const canFinish = canCompleteSetup({
    grossIncome: parseMoney(gross),
    netIncome: parseMoney(net),
    expenseCount: expenses.length,
    debtCount: debts.length,
    hasNoDebts,
  });

  return (
    <div className="min-h-screen bg-pageBackground">
      <Header
        showLogo
        rightAction={
          <button type="button" onClick={logOut} className="min-h-touch px-2 text-base text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            Log out
          </button>
        }
      />
      <OfflineBanner />
      <main className="mx-auto max-w-tablet space-y-4 p-4">
        <h1 className="text-2xl font-semibold text-mainText">Set up your money profile</h1>
        <div>
          <p className="text-sm text-secondaryText">{`Step ${step} of 3`}</p>
          <div className="mt-1 h-2 rounded-pill bg-placeholder">
            <div className="h-2 rounded-pill bg-primary" style={{ width: `${(step / 3) * 100}%` }} />
          </div>
        </div>

        {!data ? (
          <div className="space-y-2">
            <LoadingPlaceholder variant="row" />
            <LoadingPlaceholder variant="row" />
          </div>
        ) : step === 1 ? (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-mainText">Your income</h2>
            <p className="text-base text-secondaryText">Use your latest payslip. Gross is before tax and deductions; take-home is what reaches your bank.</p>
            <MoneyField label="Monthly income before deductions (gross)" placeholder="e.g. 25000" value={gross} onChange={(e) => setGross(e.target.value)} onBlur={() => setTouched((t) => ({ ...t, gross: true }))} error={touched.gross ? incomeErrors.gross : undefined} />
            <MoneyField label="Monthly take-home pay (net)" placeholder="e.g. 19800" value={net} onChange={(e) => setNet(e.target.value)} onBlur={() => setTouched((t) => ({ ...t, net: true }))} error={touched.net ? incomeErrors.net : undefined} />
          </section>
        ) : step === 2 ? (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-mainText">Your monthly expenses</h2>
            <p className="text-base text-secondaryText">Add costs that are not debts, like rent, transport and groceries.</p>
            {expenses.length === 0 && <p className="text-base text-secondaryText">No expenses added yet.</p>}
            {expenses.map((expense) => (
              <ExpenseRow key={expense.id} expense={expense} onClick={() => setExpenseModal({ expense })} disabled={!online} />
            ))}
            <Button variant="secondary" className="w-full" disabled={!online} onClick={() => setExpenseModal({})}>
              Add expense
            </Button>
            <p className="text-base font-medium text-mainText">Total expenses: {formatMoney(sumOf(expenses, (e) => e.monthly_amount))}</p>
          </section>
        ) : (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-mainText">Your debts</h2>
            <p className="text-base text-secondaryText">Add every account you pay off monthly, like loans, credit cards and store accounts.</p>
            {debts.length === 0 && <p className="text-base text-secondaryText">No debts added yet.</p>}
            {debts.map((debt) => (
              <DebtRow key={debt.id} debt={debt} onClick={() => setDebtModal({ debt })} disabled={!online} />
            ))}
            <Button variant="secondary" className="w-full" disabled={!online} onClick={() => setDebtModal({})}>
              Add debt
            </Button>
            <Checkbox checked={hasNoDebts} disabled={debts.length > 0} onChange={(e) => setHasNoDebts(e.target.checked)}>
              I don&apos;t have any debts
            </Checkbox>
            <p className="text-base font-medium text-mainText">Total repayments: {formatMoney(sumOf(debts, (d) => d.monthly_repayment))}</p>
            {!canFinish && <p className="text-sm text-secondaryText">Add a debt or tick &apos;I don&apos;t have any debts&apos;.</p>}
          </section>
        )}

        {error && (
          <p role="alert" className="text-sm text-appError">
            {error}
          </p>
        )}

        {data && (
          <div className="flex gap-3">
            {step > 1 && (
              <Button variant="secondary" className="flex-1" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            {step === 1 && (
              <Button className="flex-1" loading={saving} disabled={!isIncomeComplete(gross, net) || !online} onClick={goToStep2}>
                Next
              </Button>
            )}
            {step === 2 && (
              <Button className="flex-1" loading={saving} disabled={expenses.length === 0 || !online} onClick={goToStep3}>
                Next
              </Button>
            )}
            {step === 3 && (
              <Button className="flex-1" loading={saving} disabled={!canFinish || !online} onClick={finish}>
                See my snapshot
              </Button>
            )}
          </div>
        )}
      </main>
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
      <M1Debt isOpen={debtModal !== null} debt={debtModal?.debt} onClose={() => setDebtModal(null)} onSaved={onSaved} />
      <M2Expense isOpen={expenseModal !== null} expense={expenseModal?.expense} onClose={() => setExpenseModal(null)} onSaved={onSaved} />
    </div>
  );
};
