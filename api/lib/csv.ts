import Papa from 'papaparse';
import { addDays } from '../../src/lib/dates.js';

/** BR9: reading and checking the uploaded CSV text. */
export const CSV_MESSAGES = {
  wrongTemplate: "This file doesn't match the CreditWise template. Download the template and try again.",
  notCsv: 'Please choose a .csv file. In Excel, use Save As and choose CSV.',
  tooBig: 'This file is bigger than 1 MB or has more than 500 rows. Split it into smaller files.',
  overLimit: 'This would take you over 1,000 transactions. Delete all transactions in Account, then try again.',
} as const;

const MAX_BYTES = 1024 * 1024;
const MAX_ROWS = 500;

export interface CsvRow {
  date: string;
  description: string;
  amount: number;
}

export type CsvResult = { rows: CsvRow[]; skipped: number } | { error: string };

function isRealDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(`${date}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
}

function readRow(cells: string[], today: string): CsvRow | null {
  if (cells.length !== 3) return null;
  const [date, description, amountText] = cells;
  if (!isRealDate(date) || date > today || date < addDays(today, -90)) return null;
  if (description.length < 1 || description.length > 80) return null;
  if (!/^-?\d+(\.\d{1,2})?$/.test(amountText)) return null;
  const amount = Number(amountText);
  if (amount === 0 || Math.abs(amount) > 1_000_000) return null;
  // Values stay as plain strings; nothing in a cell is ever evaluated (PRD 12.3).
  return { date, description, amount };
}

export function parseCsvImport(input: { fileName: string; csvText: string; today: string }): CsvResult {
  if (!input.fileName.toLowerCase().endsWith('.csv')) return { error: CSV_MESSAGES.notCsv };
  if (Buffer.byteLength(input.csvText, 'utf8') > MAX_BYTES) return { error: CSV_MESSAGES.tooBig };

  const parsed = Papa.parse<string[]>(input.csvText.replace(/^﻿/, ''), { skipEmptyLines: true });
  const [header, ...dataRows] = parsed.data;
  if (!header || header.join(',').trim().toLowerCase() !== 'date,description,amount') return { error: CSV_MESSAGES.wrongTemplate };
  if (dataRows.length > MAX_ROWS) return { error: CSV_MESSAGES.tooBig };

  const rows = dataRows.map((cells) => readRow(cells, input.today)).filter((row): row is CsvRow => row !== null);
  return { rows, skipped: dataRows.length - rows.length };
}

const rowKey = (row: CsvRow) => `${row.date}|${row.description}|${Number(row.amount).toFixed(2)}`;

/** For each identical date + description + amount, keeps only the rows beyond those already stored. */
export function selectNewRows(rows: CsvRow[], stored: CsvRow[]): CsvRow[] {
  const remaining = new Map<string, number>();
  for (const row of stored) remaining.set(rowKey(row), (remaining.get(rowKey(row)) ?? 0) + 1);
  return rows.filter((row) => {
    const key = rowKey(row);
    const left = remaining.get(key) ?? 0;
    if (left === 0) return true;
    remaining.set(key, left - 1);
    return false;
  });
}
