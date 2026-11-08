import { describe, it, expect } from 'vitest';
import { validateDebt, validateExpense } from '@/lib/rules/debtExpense';

const debt = { name: 'Clothing store card', type: 'Store account', monthlyRepayment: '1200', balanceOwing: '' };
const expense = { name: 'Rent', category: 'Housing', monthlyAmount: '4800' };

describe('BR3 debts and expenses', () => {
  it('T-BR3-1 validates a debt with exact messages; balance owing is optional', () => {
    expect(validateDebt(debt)).toEqual({});
    expect(validateDebt({ ...debt, name: 'A' }).name).toBe('Enter a name of 2 to 40 characters.');
    expect(validateDebt({ ...debt, name: 'x'.repeat(41) }).name).toBe('Enter a name of 2 to 40 characters.');
    expect(validateDebt({ ...debt, type: '' }).type).toBe('Choose a type.');
    expect(validateDebt({ ...debt, monthlyRepayment: '0' }).monthlyRepayment).toBe('Enter an amount from R1.00 to R1,000,000.00.');
    expect(validateDebt({ ...debt, monthlyRepayment: '1000000.01' }).monthlyRepayment).toBe('Enter an amount from R1.00 to R1,000,000.00.');
    expect(validateDebt({ ...debt, balanceOwing: '10000000.01' }).balanceOwing).toBe('Enter an amount from R0.00 to R10,000,000.00.');
    expect(validateDebt({ ...debt, balanceOwing: '0' })).toEqual({});
  });

  it('T-BR3-1 validates an expense with exact messages', () => {
    expect(validateExpense(expense)).toEqual({});
    expect(validateExpense({ ...expense, name: 'A' }).name).toBe('Enter a name of 2 to 40 characters.');
    expect(validateExpense({ ...expense, category: '' }).category).toBe('Choose a category.');
    expect(validateExpense({ ...expense, monthlyAmount: '0' }).monthlyAmount).toBe('Enter an amount from R1.00 to R1,000,000.00.');
  });
});
