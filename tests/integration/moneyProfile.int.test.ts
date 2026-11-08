import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { admin, createTestUser, removeUser, type TestUser } from './helpers';

let user: TestUser;

beforeAll(async () => {
  user = await createTestUser('Moneytest');
});
afterAll(async () => {
  await removeUser(user.id);
});

describe('Money profile against the local backend', () => {
  it('T-US4-1 saving income updates the profile', async () => {
    const { error } = await user.client.from('money_profiles').update({ gross_income: 25000, net_income: 19800, setup_step: 2 }).eq('user_id', user.id);
    expect(error).toBeNull();
    const { data } = await user.client.from('money_profiles').select('gross_income, setup_step').single();
    expect(data).toEqual({ gross_income: 25000, setup_step: 2 });
  });

  it('T-US5-1 / T-M2-1 adds and edits debts and expenses as the owner', async () => {
    const debt = await user.client.from('debts').insert({ name: 'Clothing store card', type: 'Store account', monthly_repayment: 1200 }).select('id').single();
    expect(debt.error).toBeNull();
    const updated = await user.client.from('debts').update({ monthly_repayment: 1500 }).eq('id', debt.data!.id).select('monthly_repayment').single();
    expect(updated.data?.monthly_repayment).toBe(1500);
    const expense = await user.client.from('expenses').insert({ name: 'Rent', category: 'Housing', monthly_amount: 4800 }).select('id').single();
    expect(expense.error).toBeNull();
  });

  it('T-INT-1 OP8 returns only the caller’s data, sorted highest first', async () => {
    await user.client.from('debts').insert({ name: 'Larger loan', type: 'Personal loan', monthly_repayment: 4500 });
    const { data } = await user.client.from('debts').select('name, user_id').order('monthly_repayment', { ascending: false });
    expect(data!.map((d) => d.name)).toEqual(['Larger loan', 'Clothing store card']);
    expect(new Set(data!.map((d) => d.user_id))).toEqual(new Set([user.id]));
  });

  it('T-US4-3 completing the profile sets completed_at', async () => {
    const { error } = await user.client.from('money_profiles').update({ completed_at: new Date().toISOString() }).eq('user_id', user.id);
    expect(error).toBeNull();
    const row = await admin.from('money_profiles').select('completed_at').eq('user_id', user.id).single();
    expect(row.data?.completed_at).not.toBeNull();
  });

  it('T-US5-2 / T-M2-2 deletes a debt and an expense as the owner', async () => {
    const debts = await user.client.from('debts').delete().eq('name', 'Clothing store card').select('id');
    expect(debts.data).toHaveLength(1);
    const expenses = await user.client.from('expenses').delete().eq('name', 'Rent').select('id');
    expect(expenses.data).toHaveLength(1);
  });
});
