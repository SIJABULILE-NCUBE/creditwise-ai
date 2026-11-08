import { supabase } from '../supabase';
import { mapDbError } from '../errors';
import { MESSAGES } from '../messages';
import { compareDescription, type FlagStatus, type FlagType, type Payment } from '../rules/flags';
import { callApi } from './http';
import type { SaveResult } from './moneyProfile';

/** OP15 to OP19. */
export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  flag_type: FlagType;
  flag_status: FlagStatus;
  flag_status_changed_at: string | null;
}

export type TransactionFilter = 'all' | 'flagged';

export interface TransactionPage {
  rows: Transaction[];
  hasMore: boolean;
  flaggedCount: number;
}

const PAGE_SIZE = 50;
const COLUMNS = 'id, date, description, amount, flag_type, flag_status, flag_status_changed_at';
const FLAGGED_STATUSES = ['open', 'querying'];

export async function listTransactions(filter: TransactionFilter, page: number): Promise<TransactionPage | null> {
  let query = supabase.from('transactions').select(COLUMNS, { count: 'exact' });
  if (filter === 'flagged') query = query.in('flag_status', FLAGGED_STATUSES);
  const start = page * PAGE_SIZE;
  const [rows, flagged] = await Promise.all([
    query.order('date', { ascending: false }).order('created_at', { ascending: false }).range(start, start + PAGE_SIZE - 1),
    supabase.from('transactions').select('id', { count: 'exact', head: true }).in('flag_status', FLAGGED_STATUSES),
  ]);
  if (rows.error || flagged.error) return null;
  return { rows: rows.data as Transaction[], hasMore: (rows.count ?? 0) > start + PAGE_SIZE, flaggedCount: flagged.count ?? 0 };
}

export async function getOpenFlagCount(): Promise<number> {
  const { count } = await supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('flag_status', 'open');
  return count ?? 0;
}

export async function getTransactionCount(): Promise<number> {
  const { count } = await supabase.from('transactions').select('id', { count: 'exact', head: true });
  return count ?? 0;
}

/** The earlier payments with the same compared description, for the explanation in M4. */
export async function getEarlierPayments(transaction: Payment): Promise<Payment[]> {
  const { data } = await supabase.from('transactions').select('id, date, description, amount').lt('amount', 0).lte('date', transaction.date);
  const target = compareDescription(transaction.description);
  return (data ?? []).filter((p) => p.id !== transaction.id && compareDescription(p.description) === target);
}

export async function setFlagStatus(id: string, status: FlagStatus): Promise<SaveResult> {
  const { error } = await supabase.from('transactions').update({ flag_status: status }).eq('id', id);
  return error ? { ok: false, error: mapDbError(error, "We couldn't update this flag. Try again.") } : { ok: true };
}

export type ImportResult = { ok: true; added: number; skipped: number; needChecking: number } | { ok: false; error: string };

function readFileText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

export async function importCsv(file: File): Promise<ImportResult> {
  try {
    const csvText = await readFileText(file);
    const result = await callApi<{ added: number; skipped: number; needChecking: number }>('/api/transactions/import', { method: 'POST', body: { fileName: file.name, csvText } });
    return result.ok ? { ok: true, ...result.data } : { ok: false, error: result.error };
  } catch {
    return { ok: false, error: MESSAGES.serverError };
  }
}

export async function addTransaction(input: { date: string; description: string; amount: number; direction: 'in' | 'out' }): Promise<SaveResult> {
  const result = await callApi<{ ok: true }>('/api/transactions', { method: 'POST', body: input });
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

export async function deleteAllTransactions(): Promise<SaveResult> {
  const result = await callApi<void>('/api/transactions', { method: 'DELETE' });
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}
