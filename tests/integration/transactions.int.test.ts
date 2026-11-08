import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import request from 'supertest';
import app from '../../api/index';
import { todaySast } from '../../src/lib/dates';
import { admin, createTestUser, LOGGED_OUT, removeUser, THANDO_ID, type TestUser } from './helpers';

/** Moves every date in a fixture forward by the same number of days, so the newest row is yesterday. */
function shifted(file: string): string {
  const lines = readFileSync(file, 'utf8').trim().split(/\r?\n/);
  const dates = lines.slice(1).map((l) => Date.parse(`${l.split(',')[0]}T00:00:00Z`));
  const yesterday = Date.parse(`${todaySast()}T00:00:00Z`) - 86_400_000;
  const shift = yesterday - Math.max(...dates);
  return [lines[0], ...lines.slice(1).map((line) => {
    const [date, ...rest] = line.split(',');
    return [new Date(Date.parse(`${date}T00:00:00Z`) + shift).toISOString().slice(0, 10), ...rest].join(',');
  })].join('\n');
}

let user: TestUser;
const upload = (u: TestUser, fileName: string, csvText: string) =>
  request(app).post('/api/transactions/import').set('Authorization', `Bearer ${u.token}`).send({ fileName, csvText });
const count = async (id: string) => (await admin.from('transactions').select('id', { count: 'exact', head: true }).eq('user_id', id)).count;

beforeAll(async () => {
  user = await createTestUser('Bankuser');
});
afterAll(async () => {
  await removeUser(user.id);
});

describe('Transaction routes', () => {
  it('T-US7-2 a wrong template saves nothing', async () => {
    const res = await upload(user, 'bad-header.csv', readFileSync('tests/fixtures/bad-header.csv', 'utf8'));
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("This file doesn't match the CreditWise template. Download the template and try again.");
    expect(await count(user.id)).toBe(0);
  });

  it('T-EDGE-7 a non-CSV name is refused on the server too', async () => {
    const res = await upload(user, 'sample.xlsx', 'whatever');
    expect(res.body.error).toBe('Please choose a .csv file. In Excel, use Save As and choose CSV.');
  });

  it('T-US7-1 a 62-row file adds 62 with 3 needing checking', async () => {
    const res = await upload(user, 'thando-oct.csv', shifted('tests/fixtures/thando-oct.csv'));
    expect(res.body).toEqual({ added: 62, skipped: 0, needChecking: 3 });
    const { data } = await user.client.from('transactions').select('date').order('date', { ascending: false }).limit(1);
    expect(data![0].date).toBe(new Date(Date.parse(`${todaySast()}T00:00:00Z`) - 86_400_000).toISOString().slice(0, 10));
  });

  it('T-EDGE-3 the same file twice adds nothing and leaves flags unchanged', async () => {
    const res = await upload(user, 'thando-oct.csv', shifted('tests/fixtures/thando-oct.csv'));
    expect(res.body).toEqual({ added: 0, skipped: 62, needChecking: 0 });
    const open = await admin.from('transactions').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('flag_status', 'open');
    expect(open.count).toBe(3);
  });

  it('T-US8-2 / T-US8-3 the owner moves a flag along the allowed path', async () => {
    const { data } = await user.client.from('transactions').select('id').eq('flag_type', 'double_charge').single();
    const toQuery = await user.client.from('transactions').update({ flag_status: 'querying' }).eq('id', data!.id).select('flag_status').single();
    expect(toQuery.data?.flag_status).toBe('querying');
    const bad = await user.client.from('transactions').update({ flag_status: 'open' }).eq('id', data!.id);
    expect(bad.error).not.toBeNull();
  });

  it('T-INT-3 OP18 pages 50 rows newest first; Flagged counts open and querying; the badge only open', async () => {
    const pageOne = await user.client.from('transactions').select('date').order('date', { ascending: false }).order('created_at', { ascending: false }).range(0, 49);
    expect(pageOne.data).toHaveLength(50);
    const dates = pageOne.data!.map((r) => r.date);
    expect([...dates].sort().reverse()).toEqual(dates);
    const flagged = await user.client.from('transactions').select('id', { count: 'exact', head: true }).in('flag_status', ['open', 'querying']);
    expect(flagged.count).toBe(3);
    const open = await user.client.from('transactions').select('id', { count: 'exact', head: true }).eq('flag_status', 'open');
    expect(open.count).toBe(2);
  });

  it('T-US7-4 adds one transaction', async () => {
    const res = await request(app).post('/api/transactions').set('Authorization', `Bearer ${user.token}`).send({ date: todaySast(), description: 'Taxi fare', amount: 45, direction: 'out' });
    expect(res.status).toBe(201);
    const row = await admin.from('transactions').select('amount, source').eq('user_id', user.id).eq('description', 'Taxi fare').single();
    expect(row.data).toEqual({ amount: -45, source: 'manual' });
  });

  it('T-US7-4 refuses a bad amount with the exact message', async () => {
    const res = await request(app).post('/api/transactions').set('Authorization', `Bearer ${user.token}`).send({ date: todaySast(), description: 'Taxi', amount: 0, direction: 'out' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Enter an amount from R0.01 to R1,000,000.00.');
  });

  it('T-SEC-16a / 16b routes act only for the token user; a body user_id is ignored', async () => {
    const before = await count(THANDO_ID);
    await request(app).post('/api/transactions').set('Authorization', `Bearer ${user.token}`).send({ user_id: THANDO_ID, date: todaySast(), description: 'Not Thando', amount: 1, direction: 'out' });
    await upload(user, 'x.csv', `date,description,amount\n${todaySast()},Also not Thando,-1.00`);
    expect(await count(THANDO_ID)).toBe(before);
    const direct = await user.client.from('transactions').insert({ user_id: user.id, date: todaySast(), description: 'Direct', amount: -1, source: 'manual' });
    expect(direct.error).not.toBeNull();
    const directDelete = await user.client.from('transactions').delete().eq('user_id', user.id);
    expect(directDelete.error).not.toBeNull();
  });

  it.each([
    ['post', '/api/transactions/import'],
    ['post', '/api/transactions'],
    ['delete', '/api/transactions'],
  ] as const)('T-SEC-17b %s %s needs a token', async (method, path) => {
    const res = await request(app)[method](path);
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: LOGGED_OUT });
  });

  it('T-INT-2 OP17 deletes only the caller’s transactions', async () => {
    const before = await count(THANDO_ID);
    const res = await request(app).delete('/api/transactions').set('Authorization', `Bearer ${user.token}`).send({ user_id: THANDO_ID });
    expect(res.status).toBe(204);
    expect(await count(user.id)).toBe(0);
    expect(await count(THANDO_ID)).toBe(before);
  });

  it('T-US7-3 skips the 10 rows older than 90 days', async () => {
    const res = await upload(user, 'old-rows.csv', shifted('tests/fixtures/old-rows.csv'));
    expect(res.body).toEqual({ added: 52, skipped: 10, needChecking: 0 });
    await request(app).delete('/api/transactions').set('Authorization', `Bearer ${user.token}`);
  });

  it('T-BR10 an import that would pass 1,000 stored adds nothing', async () => {
    const rows = Array.from({ length: 1000 }, (_, i) => ({ user_id: user.id, date: todaySast(), description: `Row ${i}`, amount: -1, source: 'csv' }));
    await admin.from('transactions').insert(rows);
    const res = await upload(user, 'x.csv', `date,description,amount\n${todaySast()},One more,-1.00`);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('This would take you over 1,000 transactions. Delete all transactions in Account, then try again.');
    await request(app).delete('/api/transactions').set('Authorization', `Bearer ${user.token}`);
  });

  it('T-NFR-9 a 500-row import finishes within 10 seconds', async () => {
    const body = Array.from({ length: 500 }, (_, i) => `${todaySast()},Payee ${String.fromCharCode(65 + (i % 26))}${i},-${(i % 90) + 1}.00`).join('\n');
    const start = Date.now();
    const res = await upload(user, 'big.csv', `date,description,amount\n${body}`);
    expect(res.body.added).toBe(500);
    expect(Date.now() - start).toBeLessThan(10_000);
  });
});
