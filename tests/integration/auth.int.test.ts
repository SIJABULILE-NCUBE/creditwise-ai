import { describe, it, expect, afterAll } from 'vitest';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import app from '../../api/index';
import { admin, anonClient, removeUser, LOGGED_OUT } from './helpers';

const created: string[] = [];
afterAll(async () => {
  for (const id of created) await removeUser(id);
});

const signUpInput = (email: string) => ({
  email,
  password: 'creditwise1',
  options: { data: { first_name: 'Newuser', is_18_or_older: true } },
});

describe('Accounts against the local backend', () => {
  it('T-US1-1 sign-up creates the account, the users row and the empty money profile', async () => {
    const email = `signup-${randomUUID()}@example.com`;
    const { data, error } = await anonClient().auth.signUp(signUpInput(email));
    expect(error).toBeNull();
    created.push(data.user!.id);
    const user = await admin.from('users').select('first_name, email').eq('id', data.user!.id).single();
    expect(user.data).toEqual({ first_name: 'Newuser', email });
    const profile = await admin.from('money_profiles').select('setup_step, completed_at').eq('user_id', data.user!.id).single();
    expect(profile.data).toEqual({ setup_step: 1, completed_at: null });
  });

  it('T-US1-2 signing up with an existing email is refused as already registered', async () => {
    const { error } = await anonClient().auth.signUp(signUpInput('thando.nkosi@example.com'));
    expect(error?.code).toBe('user_already_exists');
  });

  it('T-US2-1 verified users can log in; the set-up user has an incomplete profile and Thando a complete one', async () => {
    const password = process.env.SEED_TEST_PASSWORD!;
    const thando = anonClient();
    const signedIn = await thando.auth.signInWithPassword({ email: 'thando.nkosi@example.com', password });
    expect(signedIn.error).toBeNull();
    const own = await thando.from('money_profiles').select('completed_at').single();
    expect(own.data?.completed_at).not.toBeNull();

    const setup = anonClient();
    await setup.auth.signInWithPassword({ email: 'setup.user@example.com', password });
    const incomplete = await setup.from('money_profiles').select('completed_at').single();
    expect(incomplete.data?.completed_at).toBeNull();
  });

  it('T-US2-2 an unverified user cannot log in', async () => {
    const email = `unverified-${randomUUID()}@example.com`;
    const client = anonClient();
    const { data } = await client.auth.signUp(signUpInput(email));
    created.push(data.user!.id);
    const { error } = await client.auth.signInWithPassword({ email, password: 'creditwise1' });
    expect(error?.code).toBe('email_not_confirmed');
  });

  it('T-US2-3 a reset request for an unknown email looks the same as for a real one', async () => {
    const unknown = await anonClient().auth.resetPasswordForEmail(`nobody-${randomUUID()}@example.com`);
    expect(unknown.error).toBeNull();
  });

  it.each([
    ['delete', '/api/account'],
  ])('T-SEC-17b %s %s without a token, or with a bad one, returns 401', async (method, path) => {
    const call = () => (method === 'delete' ? request(app).delete(path) : request(app).post(path));
    const missing = await call();
    expect(missing.status).toBe(401);
    expect(missing.body).toEqual({ error: LOGGED_OUT });
    const invalid = await call().set('Authorization', 'Bearer not-a-real-token');
    expect(invalid.status).toBe(401);
    expect(invalid.body).toEqual({ error: LOGGED_OUT });
  });
});
