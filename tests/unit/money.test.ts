import { describe, it, expect } from 'vitest';
import { formatMoney, parseMoney } from '@/lib/money';

describe('BR1 money', () => {
  it('T-BR1-1 formats rand amounts', () => {
    expect(formatMoney(1234.5)).toBe('R1,234.50');
    expect(formatMoney(0)).toBe('R0.00');
    expect(formatMoney(-3100)).toBe('-R3,100.00');
    expect(formatMoney(10000000)).toBe('R10,000,000.00');
  });

  it('T-BR1-2 reads typed amounts and refuses bad ones', () => {
    expect(parseMoney('R 25 000')).toBe(25000);
    expect(parseMoney('25000.5')).toBe(25000.5);
    for (const bad of ['12.345', 'abc', '1.2.3', '']) expect(parseMoney(bad)).toBeNull();
  });
});
