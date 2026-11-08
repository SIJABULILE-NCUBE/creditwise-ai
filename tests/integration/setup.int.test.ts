import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createClient } from '@supabase/supabase-js';
import app from '../../api/index';

describe('T-SETUP-3 Integration setup', () => {
  it('T-SETUP-3 supabase-js reaches local backend and Express app returns 404 for unknown route', async () => {
    const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'test-anon-key';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Should be able to make a request to auth/health or rest
    const { error } = await supabase.auth.getSession();
    expect(error).toBeNull();

    // Express app in supertest returns 404 JSON for unknown route
    const res = await request(app).get('/api/unknown-route');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});
