import { describe, it, expect } from 'vitest';
import { importToast, validateManualTransaction } from '@/lib/rules/transaction';
import { flagExplanation } from '@/lib/rules/flags';

const TODAY = '2026-11-08';
const valid = { date: '2026-10-28', description: 'Taxi fare', amount: 45 };

describe('BR10 adding one transaction', () => {
  it('T-BR10-1 validates each field with the exact message', () => {
    expect(validateManualTransaction(valid, TODAY)).toEqual({});
    expect(validateManualTransaction({ ...valid, date: '2026-11-09' }, TODAY).date).toBe('Choose a date in the last 90 days.');
    expect(validateManualTransaction({ ...valid, date: '2026-08-09' }, TODAY).date).toBe('Choose a date in the last 90 days.');
    expect(validateManualTransaction({ ...valid, date: '2026-08-10' }, TODAY)).toEqual({});
    expect(validateManualTransaction({ ...valid, description: '' }, TODAY).description).toBe('Enter a description of up to 80 characters.');
    expect(validateManualTransaction({ ...valid, description: 'x'.repeat(81) }, TODAY).description).toBe('Enter a description of up to 80 characters.');
    for (const amount of [0, 1000000.01, null]) {
      expect(validateManualTransaction({ ...valid, amount }, TODAY).amount).toBe('Enter an amount from R0.01 to R1,000,000.00.');
    }
  });

  it('T-US7-1 builds the import toast', () => {
    expect(importToast({ added: 62, skipped: 0, needChecking: 3 })).toBe('62 transactions added, 0 skipped. 3 need checking.');
    expect(importToast({ added: 52, skipped: 10, needChecking: 0 })).toBe('52 transactions added, 10 skipped.');
  });
});

describe('Flag explanations', () => {
  const gym = { id: 'g2', date: '2026-10-02', description: 'FITZONE GYM DEBIT', amount: -399, flag_type: 'double_charge' as const };

  it('T-M4-1 explains each reason with the transaction’s own details', () => {
    expect(flagExplanation(gym, [{ id: 'g1', date: '2026-10-01', description: 'FITZONE GYM DEBIT', amount: -399 }])).toBe(
      'We found 2 payments of R399.00 to FITZONE GYM DEBIT within 3 days (1 Oct 2026 and 2 Oct 2026). If you expected only one, ask your bank about it.',
    );
    expect(
      flagExplanation({ id: 'e3', date: '2026-10-18', description: 'PREPAID ELECTRICITY', amount: -1150, flag_type: 'higher_than_usual' }, [
        { id: 'e1', date: '2026-08-12', description: 'PREPAID ELECTRICITY', amount: -350 },
        { id: 'e2', date: '2026-09-14', description: 'PREPAID ELECTRICITY', amount: -380 },
      ]),
    ).toBe('This payment of R1,150.00 is more than double your usual R365.00 to PREPAID ELECTRICITY.');
    expect(flagExplanation({ id: 'o', date: '2026-10-21', description: 'ONLINE TECH STORE', amount: -2499, flag_type: 'new_payee' }, [])).toBe(
      "This is your first payment of R1,000.00 or more to ONLINE TECH STORE. If you don't recognise it, contact your bank straight away.",
    );
  });
});
