import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { calculateWhatIf, sumOf } from '../../src/lib/calculations';
import { admin, anonClient, createTestUser, removeUser, TEST_PASSWORD, THANDO_ID, type TestUser } from './helpers';

let user: TestUser;
let itemId: string;

beforeAll(async () => {
  user = await createTestUser('Tickuser');
  const guide = await user.client.from('guides').select('id').eq('slug', 'vehicle-finance').single();
  const item = await user.client.from('checklist_items').select('id').eq('guide_id', guide.data!.id).eq('sort_order', 1).single();
  itemId = item.data!.id;
});
afterAll(async () => {
  await removeUser(user.id);
});

describe('Checklist and What if against the local backend', () => {
  it('T-US11-2 a tick is still there after logging out and in again', async () => {
    const { error } = await user.client.from('checklist_ticks').insert({ item_id: itemId });
    expect(error).toBeNull();
    await user.client.auth.signOut();
    const again = anonClient();
    await again.auth.signInWithPassword({ email: user.email, password: TEST_PASSWORD });
    const { data } = await again.from('checklist_ticks').select('item_id');
    expect(data).toEqual([{ item_id: itemId }]);
    const untick = await again.from('checklist_ticks').delete().eq('item_id', itemId).select('item_id');
    expect(untick.data).toHaveLength(1);
  });

  it('T-US12-2 What if changes nothing that is saved', async () => {
    const read = async () => (await admin.from('money_profiles').select('gross_income, net_income, updated_at').eq('user_id', THANDO_ID).single()).data!;
    const debts = (await admin.from('debts').select('id, monthly_repayment').eq('user_id', THANDO_ID)).data!;
    const before = await read();
    const result = calculateWhatIf({ grossIncome: before.gross_income, netIncome: before.net_income, totalExpenses: 9098, debts }, [debts[0].id]);
    expect(result.after.dti).toBeLessThan(result.before.dti);
    expect(await read()).toEqual(before);
    expect(sumOf((await admin.from('debts').select('monthly_repayment').eq('user_id', THANDO_ID)).data!, (d) => d.monthly_repayment)).toBe(9000);
  });
});
