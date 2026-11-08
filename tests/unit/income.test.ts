import { describe, it, expect } from 'vitest';
import { validateIncome } from '@/lib/rules/income';

const RANGE = 'Enter an amount from R1.00 to R10,000,000.00.';
const NET = "Take-home pay can't be more than your income before deductions.";

describe('BR2 income', () => {
  it('T-BR2-1 accepts the allowed range and refuses net above gross', () => {
    expect(validateIncome('1', '1')).toEqual({});
    expect(validateIncome('10000000', '10000000')).toEqual({});
    expect(validateIncome('0.99', '').gross).toBe(RANGE);
    expect(validateIncome('10000000.01', '').gross).toBe(RANGE);
    expect(validateIncome('25000', '25000.01').net).toBe(NET);
  });
});
