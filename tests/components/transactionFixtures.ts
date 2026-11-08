import type { Transaction } from '@/lib/api/transactions';

const tx = (id: string, date: string, description: string, amount: number, flag_type: Transaction['flag_type'] = 'none', flag_status: Transaction['flag_status'] = 'none'): Transaction => ({
  id,
  date,
  description,
  amount,
  flag_type,
  flag_status,
  flag_status_changed_at: null,
});

export const techStore = tx('t1', '2026-10-21', 'ONLINE TECH STORE', -2499, 'new_payee', 'open');
export const electricity = tx('t2', '2026-10-18', 'PREPAID ELECTRICITY', -1150, 'higher_than_usual', 'open');
export const gym = tx('t3', '2026-10-02', 'FITZONE GYM DEBIT', -399, 'double_charge', 'open');
export const salary = tx('t4', '2026-09-25', 'SALARY ACME MEDIA', 19800);

export const flagged = [techStore, electricity, gym];
export const allRows = [...flagged, salary];

export const page = (rows: Transaction[], extra = {}) => ({ rows, hasMore: false, flaggedCount: flagged.length, ...extra });
