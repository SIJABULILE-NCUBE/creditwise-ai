import { formatPlainDate } from '../dates';
import { formatMoney } from '../money';

export type FlagType = 'none' | 'double_charge' | 'higher_than_usual' | 'new_payee';
export type FlagStatus = 'none' | 'open' | 'dismissed' | 'querying' | 'resolved';

export const FLAG_REASONS: Record<Exclude<FlagType, 'none'>, string> = {
  double_charge: 'Possible double charge',
  higher_than_usual: 'Higher than usual',
  new_payee: 'New payee',
};

export interface Payment {
  id: string;
  date: string;
  description: string;
  amount: number;
}

/** Same rule as the database's compare_description (BR11). */
export function compareDescription(description: string): string {
  return description.toLowerCase().replace(/\d/g, '').replace(/\s+/g, ' ').trim();
}

/** The explanation in M4. `earlier` holds the user's earlier payments with the same compared description. */
export function flagExplanation(transaction: Payment & { flag_type: FlagType }, earlier: Payment[]): string {
  const amount = formatMoney(Math.abs(transaction.amount));
  const { description } = transaction;
  if (transaction.flag_type === 'double_charge') {
    const match = [...earlier].filter((p) => p.amount === transaction.amount).sort((a, b) => b.date.localeCompare(a.date))[0];
    const firstDate = match ? formatPlainDate(match.date) : formatPlainDate(transaction.date);
    return `We found 2 payments of ${amount} to ${description} within 3 days (${firstDate} and ${formatPlainDate(transaction.date)}). If you expected only one, ask your bank about it.`;
  }
  if (transaction.flag_type === 'higher_than_usual') {
    const usual = earlier.reduce((total, p) => total + Math.abs(p.amount), 0) / Math.max(earlier.length, 1);
    return `This payment of ${amount} is more than double your usual ${formatMoney(usual)} to ${description}.`;
  }
  return `This is your first payment of R1,000.00 or more to ${description}. If you don't recognise it, contact your bank straight away.`;
}
