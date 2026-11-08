import { supabase } from '../supabase';
import { mapDbError } from '../errors';
import { MESSAGES } from '../messages';

/** OP8 to OP14. */
export interface Debt {
  id: string;
  name: string;
  type: string;
  monthly_repayment: number;
  balance_owing: number | null;
}

export interface Expense {
  id: string;
  name: string;
  category: string;
  monthly_amount: number;
}

export interface MoneyProfileData {
  firstName: string;
  profile: {
    grossIncome: number | null;
    netIncome: number | null;
    hasNoDebts: boolean;
    setupStep: number;
    completedAt: string | null;
    updatedAt: string;
  };
  debts: Debt[];
  expenses: Expense[];
}

export type SaveResult = { ok: true } | { ok: false; error: string };

const SAVE_FAILED = MESSAGES.saveFailed;
const DELETE_FAILED = MESSAGES.deleteFailed;

const failed = (message: string): SaveResult => ({ ok: false, error: message });

function saveResult(error: { message: string; code?: string } | null): SaveResult {
  if (!error) return { ok: true };
  if (error.message.includes('limit_debts')) return failed("You've reached the limit of 15 debts.");
  if (error.message.includes('limit_expenses')) return failed("You've reached the limit of 20 expenses.");
  return failed(mapDbError(error, SAVE_FAILED));
}

export async function getMoneyProfile(): Promise<MoneyProfileData | null> {
  const [user, profile, debts, expenses] = await Promise.all([
    supabase.from('users').select('first_name').single(),
    supabase.from('money_profiles').select('gross_income, net_income, has_no_debts, setup_step, completed_at, updated_at').single(),
    supabase.from('debts').select('id, name, type, monthly_repayment, balance_owing').order('monthly_repayment', { ascending: false }),
    supabase.from('expenses').select('id, name, category, monthly_amount').order('monthly_amount', { ascending: false }),
  ]);
  if (user.error || profile.error || debts.error || expenses.error) return null;
  return {
    firstName: user.data.first_name,
    profile: {
      grossIncome: profile.data.gross_income,
      netIncome: profile.data.net_income,
      hasNoDebts: profile.data.has_no_debts,
      setupStep: profile.data.setup_step,
      completedAt: profile.data.completed_at,
      updatedAt: profile.data.updated_at,
    },
    debts: debts.data,
    expenses: expenses.data,
  };
}

async function currentUserId(): Promise<string | undefined> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id;
}

export async function saveIncome(grossIncome: number, netIncome: number): Promise<SaveResult> {
  const { error } = await supabase.from('money_profiles').update({ gross_income: grossIncome, net_income: netIncome }).eq('user_id', await currentUserId());
  return saveResult(error);
}

export async function saveSetup(input: { setupStep: number; hasNoDebts?: boolean; complete?: boolean }): Promise<SaveResult> {
  const update: Record<string, unknown> = { setup_step: input.setupStep };
  if (input.hasNoDebts !== undefined) update.has_no_debts = input.hasNoDebts;
  if (input.complete) update.completed_at = new Date().toISOString();
  const { error } = await supabase.from('money_profiles').update(update).eq('user_id', await currentUserId());
  return saveResult(error);
}

export interface DebtFields {
  name: string;
  type: string;
  monthly_repayment: number;
  balance_owing: number | null;
}

export async function saveDebt(fields: DebtFields, id?: string): Promise<SaveResult> {
  const query = id ? supabase.from('debts').update(fields).eq('id', id) : supabase.from('debts').insert(fields);
  const { error } = await query;
  return saveResult(error);
}

export async function deleteDebt(id: string): Promise<SaveResult> {
  const { error } = await supabase.from('debts').delete().eq('id', id);
  return error ? failed(mapDbError(error, DELETE_FAILED)) : { ok: true };
}

export interface ExpenseFields {
  name: string;
  category: string;
  monthly_amount: number;
}

export async function saveExpense(fields: ExpenseFields, id?: string): Promise<SaveResult> {
  const query = id ? supabase.from('expenses').update(fields).eq('id', id) : supabase.from('expenses').insert(fields);
  const { error } = await query;
  return saveResult(error);
}

export async function deleteExpense(id: string): Promise<SaveResult> {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  return error ? failed(mapDbError(error, DELETE_FAILED)) : { ok: true };
}
