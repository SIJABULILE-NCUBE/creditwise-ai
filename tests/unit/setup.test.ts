import { describe, it, expect } from 'vitest';
import { canCompleteSetup } from '@/lib/rules/setup';

const ready = { grossIncome: 25000, netIncome: 19800, expenseCount: 1, debtCount: 1, hasNoDebts: false };

describe('BR8 complete money profile', () => {
  it('T-BR8-1 needs both incomes, 1 expense and a debt or the no-debts box', () => {
    expect(canCompleteSetup(ready)).toBe(true);
    expect(canCompleteSetup({ ...ready, debtCount: 0, hasNoDebts: true })).toBe(true);
    expect(canCompleteSetup({ ...ready, debtCount: 0 })).toBe(false);
    expect(canCompleteSetup({ ...ready, expenseCount: 0 })).toBe(false);
    expect(canCompleteSetup({ ...ready, grossIncome: null })).toBe(false);
    expect(canCompleteSetup({ ...ready, netIncome: null })).toBe(false);
  });
});
