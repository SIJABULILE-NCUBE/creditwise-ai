import { describe, it, expect } from 'vitest';
import { calculateDti, calculateMoneyLeft, calculateRoom, getStatusBand, STATUS_LABELS, formatDti, calculateWhatIf } from '@/lib/calculations';

describe('Snapshot calculations', () => {
  it('T-BR4-1 calculates DTI as a rounded whole percentage', () => {
    expect(calculateDti(9000, 25000)).toBe(36);
    expect(calculateDti(14400, 32000)).toBe(45);
    expect(calculateDti(0, 14000)).toBe(0);
    expect(calculateDti(125, 1000)).toBe(13);
  });

  it('T-BR5-1 picks the status band and its exact label', () => {
    expect(getStatusBand(30)).toBe('green');
    expect(getStatusBand(31)).toBe('amber');
    expect(getStatusBand(40)).toBe('amber');
    expect(getStatusBand(41)).toBe('red');
    expect(STATUS_LABELS).toEqual({ green: 'Green: healthy', amber: 'Amber: getting stretched', red: 'Red: lenders may decline' });
  });

  it('T-BR6-1 calculates Money left', () => {
    expect(calculateMoneyLeft(19800, 9098, 9000)).toBe(1702);
    expect(calculateMoneyLeft(24500, 13200, 14400)).toBe(-3100);
    expect(calculateMoneyLeft(11900, 8200, 0)).toBe(3700);
  });

  it('T-BR7-1 calculates Room, rounded down, never negative', () => {
    expect(calculateRoom(25000, 9000)).toBe(1000);
    expect(calculateRoom(14000, 0)).toBe(5600);
    expect(calculateRoom(32000, 14400)).toBe(0);
    expect(calculateRoom(1001, 100.5)).toBe(299);
  });

  it('T-BR18-1 calculates What if as though the ticked repayments were R0.00', () => {
    const thando = { grossIncome: 25000, netIncome: 19800, totalExpenses: 9098, debts: [{ id: 'loan', monthly_repayment: 6500 }, { id: 'clothing', monthly_repayment: 1200 }, { id: 'furniture', monthly_repayment: 1300 }] };
    expect(calculateWhatIf(thando, ['clothing', 'furniture'])).toEqual({
      before: { dti: 36, band: 'amber', moneyLeft: 1702, room: 1000 },
      after: { dti: 26, band: 'green', moneyLeft: 4202, room: 3500 },
    });
    const sibusiso = { grossIncome: 32000, netIncome: 24500, totalExpenses: 13200, debts: [{ id: 'big', monthly_repayment: 11800 }, { id: 'a', monthly_repayment: 900 }, { id: 'b', monthly_repayment: 850 }, { id: 'c', monthly_repayment: 850 }] };
    expect(calculateWhatIf(sibusiso, ['a', 'b', 'c'])).toEqual({
      before: { dti: 45, band: 'red', moneyLeft: -3100, room: 0 },
      after: { dti: 37, band: 'amber', moneyLeft: -500, room: 1000 },
    });
  });

  it('T-EDGE-6 caps only the displayed DTI', () => {
    expect(formatDti(1000)).toBe('999%+');
    expect(formatDti(999)).toBe('999%');
    expect(formatDti(36)).toBe('36%');
  });
});
