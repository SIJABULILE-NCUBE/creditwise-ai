import { parseMoney } from '../money';

export const GROSS_ERROR = 'Enter an amount from R1.00 to R10,000,000.00.';
export const NET_ERROR = "Take-home pay can't be more than your income before deductions.";

export interface IncomeErrors {
  gross?: string;
  net?: string;
}

/** BR2. Empty fields are invalid but only the gross range has its own message. */
export function validateIncome(grossText: string, netText: string): IncomeErrors {
  const errors: IncomeErrors = {};
  const gross = parseMoney(grossText);
  const net = parseMoney(netText);
  if (gross === null || gross < 1 || gross > 10_000_000) errors.gross = GROSS_ERROR;
  if (net !== null && (net < 1 || (gross !== null && net > gross))) errors.net = NET_ERROR;
  return errors;
}

export function isIncomeComplete(grossText: string, netText: string): boolean {
  const errors = validateIncome(grossText, netText);
  return !errors.gross && !errors.net && parseMoney(netText) !== null;
}
