import { parseMoney } from '../money';

export const DEBT_TYPES = ['Personal loan', 'Vehicle finance', 'Home loan', 'Credit card', 'Store account', 'Student loan', 'Other'];
export const EXPENSE_CATEGORIES = ['Housing', 'Transport', 'Food', 'Utilities', 'Insurance', 'Education', 'Phone and internet', 'Family support', 'Other'];
export const MAX_DEBTS = 15;
export const MAX_EXPENSES = 20;

const NAME_ERROR = 'Enter a name of 2 to 40 characters.';
const AMOUNT_ERROR = 'Enter an amount from R1.00 to R1,000,000.00.';
const BALANCE_ERROR = 'Enter an amount from R0.00 to R10,000,000.00.';

const nameError = (name: string) => (name.trim().length >= 2 && name.trim().length <= 40 ? undefined : NAME_ERROR);
const amountError = (text: string) => {
  const amount = parseMoney(text);
  return amount !== null && amount >= 1 && amount <= 1_000_000 ? undefined : AMOUNT_ERROR;
};

function withoutEmpty<T extends object>(errors: T): Partial<T> {
  return Object.fromEntries(Object.entries(errors).filter(([, value]) => value !== undefined)) as Partial<T>;
}

export interface DebtInput {
  name: string;
  type: string;
  monthlyRepayment: string;
  balanceOwing: string;
}

export function validateDebt(input: DebtInput) {
  let balanceError: string | undefined;
  if (input.balanceOwing.trim() !== '') {
    const balance = parseMoney(input.balanceOwing);
    if (balance === null || balance < 0 || balance > 10_000_000) balanceError = BALANCE_ERROR;
  }
  return withoutEmpty({
    name: nameError(input.name),
    type: DEBT_TYPES.includes(input.type) ? undefined : 'Choose a type.',
    monthlyRepayment: amountError(input.monthlyRepayment),
    balanceOwing: balanceError,
  });
}

export interface ExpenseInput {
  name: string;
  category: string;
  monthlyAmount: string;
}

export function validateExpense(input: ExpenseInput) {
  return withoutEmpty({
    name: nameError(input.name),
    category: EXPENSE_CATEGORIES.includes(input.category) ? undefined : 'Choose a category.',
    monthlyAmount: amountError(input.monthlyAmount),
  });
}
