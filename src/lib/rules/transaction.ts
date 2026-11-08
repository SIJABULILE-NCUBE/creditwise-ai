import { addDays } from '../dates.js';
import { MESSAGES } from '../messages.js';

export interface ManualTransaction {
  date: string;
  description: string;
  amount: number | null;
}

export interface ManualTransactionErrors {
  date?: string;
  description?: string;
  amount?: string;
}

/** BR10: adding one transaction by hand. */
export function validateManualTransaction(input: ManualTransaction, today: string): ManualTransactionErrors {
  const errors: ManualTransactionErrors = {};
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date) || input.date > today || input.date < addDays(today, -90)) {
    errors.date = MESSAGES.transactionDate;
  }
  if (input.description.length < 1 || input.description.length > 80) {
    errors.description = MESSAGES.transactionDescription;
  }
  if (input.amount === null || input.amount < 0.01 || input.amount > 1_000_000) {
    errors.amount = MESSAGES.transactionAmount;
  }
  return errors;
}

export function importToast(result: { added: number; skipped: number; needChecking: number }): string {
  const base = `${result.added} transactions added, ${result.skipped} skipped.`;
  return result.needChecking > 0 ? `${base} ${result.needChecking} need checking.` : base;
}
