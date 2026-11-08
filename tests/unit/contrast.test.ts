import { describe, it, expect } from 'vitest';
import { tokens } from '@/theme/tokens';

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const c = tokens.color;
const WHITE = '#FFFFFF';
const pairs: [string, string, string][] = [
  ['text on background', c.text, c.background],
  ['text on surface', c.text, c.surface],
  ['textSecondary on background', c.textSecondary, c.background],
  ['textSecondary on surface', c.textSecondary, c.surface],
  ['white on primary', WHITE, c.primary],
  ['primary on background', c.primary, c.background],
  ['primary on surface', c.primary, c.surface],
  ['error on surface', c.error, c.surface],
  ['error on background', c.error, c.background],
  ['white on error', WHITE, c.error],
  ['success on surface', c.success, c.surface],
  ['warning on surface', c.warning, c.surface],
  ['green pill', c.pill.green.text, c.pill.green.bg],
  ['amber pill', c.pill.amber.text, c.pill.amber.bg],
  ['red pill', c.pill.red.text, c.pill.red.bg],
  ['grey pill', c.pill.grey.text, c.pill.grey.bg],
  ['white on toast', WHITE, c.toast],
];

describe('T-NFR-4 colour contrast', () => {
  it.each(pairs)('T-NFR-4 %s passes 4.5:1', (_name, foreground, background) => {
    expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
  });
});
