import type { Debt, Expense, MoneyProfileData } from '@/lib/api/moneyProfile';

const debt = (id: string, name: string, type: string, monthly_repayment: number, balance_owing: number | null = null): Debt => ({ id, name, type, monthly_repayment, balance_owing });
const expense = (id: string, name: string, category: string, monthly_amount: number): Expense => ({ id, name, category, monthly_amount });

const profile = (gross: number, net: number, extra: Partial<MoneyProfileData['profile']> = {}): MoneyProfileData['profile'] => ({
  grossIncome: gross,
  netIncome: net,
  hasNoDebts: false,
  setupStep: 3,
  completedAt: '2026-10-27T12:05:00Z',
  updatedAt: '2026-10-27T12:05:00Z',
  ...extra,
});

export const thando: MoneyProfileData = {
  firstName: 'Thando',
  profile: profile(25000, 19800),
  debts: [
    debt('d1', 'Personal loan', 'Personal loan', 4500, 68000),
    debt('d2', 'Credit card', 'Credit card', 2000, 18000),
    debt('d3', 'Furniture store account', 'Store account', 1300, 14500),
    debt('d4', 'Clothing store card', 'Store account', 1200, 6400),
  ],
  expenses: [
    expense('e1', 'Rent', 'Housing', 4800),
    expense('e2', 'Groceries', 'Food', 2000),
    expense('e3', 'Transport', 'Transport', 1500),
    expense('e4', 'Cellphone contract', 'Phone and internet', 399),
    expense('e5', 'Gym', 'Other', 399),
  ],
};

export const sibusiso: MoneyProfileData = {
  firstName: 'Sibusiso',
  profile: profile(32000, 24500),
  debts: [
    debt('d1', 'Vehicle finance', 'Vehicle finance', 5900, 182000),
    debt('d2', 'Personal loan', 'Personal loan', 3800, 41000),
    debt('d3', 'Credit card', 'Credit card', 2100, 22500),
    debt('d4', 'Store account A', 'Store account', 900),
    debt('d5', 'Store account B', 'Store account', 850),
    debt('d6', 'Store account C', 'Store account', 850),
  ],
  expenses: [
    expense('e1', 'Rent', 'Housing', 5500),
    expense('e2', 'Groceries', 'Food', 3500),
    expense('e3', 'Transport', 'Transport', 2200),
    expense('e4', 'School fees', 'Education', 2000),
  ],
};

export const ayanda: MoneyProfileData = {
  firstName: 'Ayanda',
  profile: profile(14000, 11900, { hasNoDebts: true }),
  debts: [],
  expenses: [
    expense('e1', 'Rent', 'Housing', 4500),
    expense('e2', 'Groceries', 'Food', 2000),
    expense('e3', 'Transport', 'Transport', 1200),
    expense('e4', 'Family support', 'Family support', 500),
  ],
};

export const newUser: MoneyProfileData = {
  firstName: 'Setup',
  profile: profile(0, 0, { grossIncome: null, netIncome: null, setupStep: 1, completedAt: null }),
  debts: [],
  expenses: [],
};
