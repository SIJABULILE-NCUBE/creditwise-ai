import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../api/index';
import { admin, createTestUser, removeUser, THANDO_ID } from './helpers';

describe('DELETE /api/account', () => {
  it('T-US3-2 / T-SEC-3a removes the caller and every row they own', async () => {
    const user = await createTestUser();
    await admin.from('expenses').insert({ user_id: user.id, name: 'Rent', category: 'Housing', monthly_amount: 100 });
    const res = await request(app).delete('/api/account').set('Authorization', `Bearer ${user.token}`);
    expect(res.status).toBe(204);
    const row = await admin.from('users').select('id').eq('id', user.id);
    expect(row.data).toEqual([]);
    const expense = await admin.from('expenses').select('id').eq('user_id', user.id);
    expect(expense.data).toEqual([]);
    const authUser = await admin.auth.admin.getUserById(user.id);
    expect(authUser.data.user).toBeNull();
  });

  it('T-SEC-3b an id in the body is ignored: only the caller is deleted', async () => {
    const user = await createTestUser();
    try {
      const res = await request(app)
        .delete('/api/account')
        .set('Authorization', `Bearer ${user.token}`)
        .send({ id: THANDO_ID, user_id: THANDO_ID });
      expect(res.status).toBe(204);
      const thando = await admin.from('users').select('id').eq('id', THANDO_ID);
      expect(thando.data).toHaveLength(1);
      const caller = await admin.from('users').select('id').eq('id', user.id);
      expect(caller.data).toEqual([]);
    } finally {
      await removeUser(user.id);
    }
  });
});
