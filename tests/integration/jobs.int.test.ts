import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { addDays, todaySast } from '../../src/lib/dates';
import { admin, createTestUser, removeUser, type TestUser } from './helpers';

let user: TestUser;

beforeAll(async () => {
  user = await createTestUser('Jobsuser');
});
afterAll(async () => {
  await removeUser(user.id);
});

describe('Daily cleanup job', () => {
  it('T-EDGE-4 a flagged transaction older than 90 days is removed and the open count drops', async () => {
    const today = todaySast();
    const rows = [
      { date: addDays(today, -89), description: 'OLD GYM', amount: -399 },
      { date: addDays(today, -88), description: 'OLD GYM', amount: -399 },
      { date: addDays(today, -5), description: 'NEW GYM', amount: -250 },
      { date: addDays(today, -4), description: 'NEW GYM', amount: -250 },
    ].map((row, i) => ({ ...row, user_id: user.id, source: 'csv', created_at: new Date(Date.now() + i).toISOString() }));
    await admin.from('transactions').insert(rows);
    await admin.rpc('recalculate_flags', { p_user_id: user.id });

    const open = async () => (await user.client.from('transactions').select('id', { count: 'exact', head: true }).eq('flag_status', 'open')).count;
    expect(await open()).toBe(2);

    // Rows can't be inserted with an old date, so age them the way time would.
    await admin.from('transactions').update({ date: addDays(today, -92) }).eq('user_id', user.id).eq('description', 'OLD GYM').eq('flag_type', 'none');
    await admin.from('transactions').update({ date: addDays(today, -91) }).eq('user_id', user.id).eq('description', 'OLD GYM').eq('flag_type', 'double_charge');

    const job = await admin.rpc('cleanup_old_data');
    expect(job.error).toBeNull();

    const left = await user.client.from('transactions').select('description');
    expect(left.data!.map((r) => r.description)).toEqual(['NEW GYM', 'NEW GYM']);
    expect(await open()).toBe(1);
  });
});
