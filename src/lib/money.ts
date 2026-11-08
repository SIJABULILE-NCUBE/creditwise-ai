/**
 * BR1: Money formatting and parsing
 */

export function formatMoney(amount: number): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return isNegative ? `-R${formatted}` : `R${formatted}`;
}

export function formatMoneyWithoutPrefix(amount: number): string {
  const absAmount = Math.abs(amount);
  return absAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function parseMoney(input: string): number | null {
  if (!input || typeof input !== 'string') return null;

  // Remove leading/trailing spaces and optional 'R' or '-R' or spaces
  let cleaned = input.trim();
  let isNegative = false;

  if (cleaned.startsWith('-')) {
    isNegative = true;
    cleaned = cleaned.substring(1).trim();
  }

  if (cleaned.startsWith('R') || cleaned.startsWith('r')) {
    cleaned = cleaned.substring(1).trim();
  }

  // Remove spaces or thousands separators (comma or space or non-breaking space)
  cleaned = cleaned.replace(/\s+/g, '').replace(/,/g, '');

  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
    return null;
  }

  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;

  return isNegative ? -num : num;
}
