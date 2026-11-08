import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import app from '../../api/index';
import { askClaude } from '../../api/lib/claude';
import { todaySast, addDays } from '../../src/lib/dates';
import { admin, createTestUser, LOGGED_OUT, removeUser, THANDO_ID, type TestUser } from './helpers';

vi.mock('../../api/lib/claude', () => ({ askClaude: vi.fn() }));

const UNAVAILABLE = 'Ask CreditWise is not available right now. Try again in a few minutes.';
const fake = vi.mocked(askClaude);
let user: TestUser;

const ask = (question: unknown, body: Record<string, unknown> = {}) =>
  request(app).post('/api/ask').set('Authorization', `Bearer ${user.token}`).send({ question, ...body });
const setCount = (ask_count: number, ask_count_date: string | null) => admin.from('users').update({ ask_count, ask_count_date }).eq('id', user.id);
const getCount = async () => (await admin.from('users').select('ask_count, ask_count_date').eq('id', user.id).single()).data;
const messageCount = async () => (await admin.from('chat_messages').select('id', { count: 'exact', head: true }).eq('user_id', user.id)).count;

beforeAll(async () => {
  user = await createTestUser('Askuser');
  await admin.from('money_profiles').update({ gross_income: 25000, net_income: 19800 }).eq('user_id', user.id);
  await admin.from('expenses').insert({ user_id: user.id, name: 'Private rent name', category: 'Housing', monthly_amount: 9098 });
  await admin.from('debts').insert({ user_id: user.id, name: 'Private debt name', type: 'Personal loan', monthly_repayment: 9000, balance_owing: 68000 });
});
afterAll(async () => {
  await removeUser(user.id);
});
beforeEach(async () => {
  fake.mockReset();
  fake.mockResolvedValue('Your Room is R1,000.00.');
  await admin.from('chat_messages').delete().eq('user_id', user.id);
  await setCount(0, null);
});

describe('POST /api/ask', () => {
  it('T-US9-1 sends the figures and last 10 messages, saves both, and returns the answer', async () => {
    const start = Date.now() - 100_000;
    await admin.from('chat_messages').insert(
      Array.from({ length: 12 }, (_, i) => ({ user_id: user.id, role: i % 2 === 0 ? 'user' : 'assistant', text: `old ${i}`, created_at: new Date(start + i * 1000).toISOString() })),
    );
    const res = await ask('What car instalment can I afford?');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ answer: 'Your Room is R1,000.00.', questionsLeft: 19 });

    const { system, messages } = fake.mock.calls[0][0];
    expect(system).toContain('R1,000.00');
    expect(system).not.toContain('Askuser');
    expect(system).not.toContain('Private');
    expect(system).not.toContain(user.email);
    expect(messages).toHaveLength(11);
    expect(messages[0].content).toContain('old 2');
    expect(messages[10].content).toContain('What car instalment can I afford?');
    expect(await messageCount()).toBe(14);
  });

  it('T-US9-1 trims a long answer to 200 words', async () => {
    fake.mockResolvedValue(Array(300).fill('word').join(' '));
    const res = await ask('Tell me a lot');
    expect(res.body.answer.split(' ')).toHaveLength(200);
  });

  it('T-US9-3 at 20 questions it refuses and does not call the AI', async () => {
    await setCount(20, todaySast());
    const res = await ask('One more');
    expect(res.status).toBe(429);
    expect(res.body.error).toBe("You've used your 20 questions for today. You can ask again after midnight.");
    expect(fake).not.toHaveBeenCalled();
    expect(await messageCount()).toBe(0);
  });

  it('T-BR15-1 refuses over 500 characters', async () => {
    const res = await ask('a'.repeat(501));
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Questions can be up to 500 characters.');
    expect(fake).not.toHaveBeenCalled();
  });

  it('T-US10-3 when the AI fails nothing is saved and the count is unchanged', async () => {
    fake.mockRejectedValue(new Error('timeout'));
    await setCount(3, todaySast());
    const res = await ask('Hello');
    expect(res.status).toBe(503);
    expect(res.body.error).toBe(UNAVAILABLE);
    expect(await messageCount()).toBe(0);
    expect((await getCount())?.ask_count).toBe(3);
  });

  it('T-BR15-2 the count rises by 1 on success and restarts on the next SAST day', async () => {
    await setCount(5, todaySast());
    await ask('Hello');
    expect(await getCount()).toEqual({ ask_count: 6, ask_count_date: todaySast() });
    await setCount(20, addDays(todaySast(), -1));
    const res = await ask('New day');
    expect(res.status).toBe(200);
    expect(await getCount()).toEqual({ ask_count: 1, ask_count_date: todaySast() });
  });

  it('T-S9-2 clearing the chat keeps the daily count', async () => {
    await ask('Hello');
    await user.client.from('chat_messages').delete().eq('user_id', user.id);
    expect(await messageCount()).toBe(0);
    expect((await getCount())?.ask_count).toBe(1);
  });

  it('T-SEC-15a / 15b acts only for the token user; browser inserts are refused', async () => {
    const before = (await admin.from('chat_messages').select('id', { count: 'exact', head: true }).eq('user_id', THANDO_ID)).count;
    await ask('Hello', { user_id: THANDO_ID });
    const after = (await admin.from('chat_messages').select('id', { count: 'exact', head: true }).eq('user_id', THANDO_ID)).count;
    expect(after).toBe(before);
    const direct = await user.client.from('chat_messages').insert({ user_id: user.id, role: 'user', text: 'Direct' });
    expect(direct.error).not.toBeNull();
  });

  it('T-SEC-17b needs a token', async () => {
    const res = await request(app).post('/api/ask').send({ question: 'Hello' });
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: LOGGED_OUT });
  });
});
