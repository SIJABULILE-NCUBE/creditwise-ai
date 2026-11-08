import React from 'react';
import type { Transaction } from '../lib/api/transactions';
import { formatMoney } from '../lib/money';
import { FlagPill } from './FlagPill';

export interface TransactionRowProps {
  transaction: Transaction;
  onOpen: (transaction: Transaction) => void;
  disabled?: boolean;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({ transaction, onOpen, disabled = false }) => {
  const { description, amount, flag_type: flagType, flag_status: flagStatus } = transaction;
  const moneyIn = amount > 0;
  const content = (
    <>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-base text-mainText">{description}</span>
        {flagType !== 'none' && <FlagPill type={flagType} status={flagStatus} />}
      </span>
      <span className={`font-mono text-base font-medium ${moneyIn ? 'text-appSuccess' : 'text-mainText'}`}>{moneyIn ? `+${formatMoney(amount)}` : formatMoney(amount)}</span>
    </>
  );

  if (flagType === 'none') return <div className="flex min-h-16 items-center gap-3 px-3 py-2">{content}</div>;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onOpen(transaction)}
      className={`flex min-h-16 w-full items-center gap-3 border-l-4 border-appWarning px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}
    >
      {content}
    </button>
  );
};
