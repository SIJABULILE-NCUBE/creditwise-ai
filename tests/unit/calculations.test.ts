import { describe, it, expect } from 'vitest';
import { calculateDti, calculateMoneyLeft, calculateRoom, getStatusBand, STATUS_LABELS, formatDti } from '@/lib/calculations';

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

  it('T-EDGE-6 caps only the displayed DTI', () => {
    expect(formatDti(1000)).toBe('999%+');
    expect(formatDti(999)).toBe('999%');
    expect(formatDti(36)).toBe('36%');
  });
});
