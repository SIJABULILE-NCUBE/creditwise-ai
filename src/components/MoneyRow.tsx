import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { Debt, Expense } from '../lib/api/moneyProfile';
import { formatMoney } from '../lib/money';

interface RowProps {
  name: string;
  detail: string;
  amount: number;
  owing?: number | null;
  onClick: () => void;
  disabled?: boolean;
}

const Row: React.FC<RowProps> = ({ name, detail, amount, owing, onClick, disabled = false }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`flex min-h-14 w-full items-center gap-2 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}
  >
    <span className="min-w-0 flex-1">
      <span className="block truncate text-base text-mainText">{name}</span>
      <span className="block text-sm text-secondaryText">{detail}</span>
    </span>
    <span className="text-right">
      <span className="block font-mono text-base font-medium text-mainText">{formatMoney(amount)}</span>
      {owing !== null && owing !== undefined && <span className="block text-sm text-secondaryText">Owing {formatMoney(owing)}</span>}
    </span>
    <ChevronRight className="h-5 w-5 shrink-0 text-secondaryText" aria-hidden="true" />
  </button>
);

export const DebtRow: React.FC<{ debt: Debt; onClick: () => void; disabled?: boolean }> = ({ debt, onClick, disabled }) => (
  <Row name={debt.name} detail={debt.type} amount={debt.monthly_repayment} owing={debt.balance_owing} onClick={onClick} disabled={disabled} />
);

export const ExpenseRow: React.FC<{ expense: Expense; onClick: () => void; disabled?: boolean }> = ({ expense, onClick, disabled }) => (
  <Row name={expense.name} detail={expense.category} amount={expense.monthly_amount} onClick={onClick} disabled={disabled} />
);
