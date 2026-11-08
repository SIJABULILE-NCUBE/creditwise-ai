import { randomUUID } from 'node:crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const admin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

export function anonClient(): SupabaseClient {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const TEST_PASSWORD = 'integration-test-1';
export const THANDO_ID = '00000000-0000-0000-0000-000000000001';

export interface TestUser {
  id: string;
  email: string;
  token: string;
  client: SupabaseClient;
}

/** Creates a confirmed user with its own signed-in client. Delete with removeUser. */
export async function createTestUser(firstName = 'Tester'): Promise<TestUser> {
  const email = `test-${randomUUID()}@example.com`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: TEST_PASSWORD,
    email_confirm: true,
    user_metadata: { first_name: firstName, is_18_or_older: true },
  });
  if (error) throw error;
  const client = anonClient();
  const signIn = await client.auth.signInWithPassword({ email, password: TEST_PASSWORD });
  if (signIn.error) throw signIn.error;
  return { id: data.user.id, email, token: signIn.data.session.access_token, client };
}

export async function removeUser(id: string) {
  await admin.auth.admin.deleteUser(id);
}

export const LOGGED_OUT = 'You were logged out to keep your money details safe. Log in again.';
