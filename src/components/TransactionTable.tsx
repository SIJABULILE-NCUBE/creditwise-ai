import React from 'react';
import type { Transaction } from '../lib/api/transactions';
import { formatPlainDate } from '../lib/dates';
import { FlagPill } from './FlagPill';
import { TransactionAmount } from './TransactionRow';

export interface TransactionTableProps {
  rows: Transaction[];
  onOpen: (transaction: Transaction) => void;
  disabled?: boolean;
}

/** S8 on desktop (PRD 9.3): columns Date, Description, Amount, Flag. */
export const TransactionTable: React.FC<TransactionTableProps> = ({ rows, onOpen, disabled = false }) => (
  <div className="overflow-x-auto rounded-card border border-appBorder bg-surface">
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-appBorder text-sm text-secondaryText">
          <th scope="col" className="p-3 font-medium">
            Date
          </th>
          <th scope="col" className="p-3 font-medium">
            Description
          </th>
          <th scope="col" className="p-3 text-right font-medium">
            Amount
          </th>
          <th scope="col" className="p-3 font-medium">
            Flag
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-appBorder">
        {rows.map((row) => (
          <tr key={row.id}>
            <td className="whitespace-nowrap p-3 text-sm text-secondaryText">{formatPlainDate(row.date)}</td>
            <td className="p-3 text-base text-mainText">
              {row.flag_type === 'none' ? (
                row.description
              ) : (
                <button type="button" disabled={disabled} onClick={() => onOpen(row)} className={`min-h-touch text-left underline ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}>
                  {row.description}
                </button>
              )}
            </td>
            <td className="p-3 text-right">
              <TransactionAmount amount={row.amount} />
            </td>
            <td className="p-3">{row.flag_type !== 'none' && <FlagPill type={row.flag_type} status={row.flag_status} />}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
