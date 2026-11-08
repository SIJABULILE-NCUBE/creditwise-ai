import { expect, type APIRequestContext, type Page } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const MAILPIT = 'http://127.0.0.1:54324';

export const SEED_PASSWORD = process.env.SEED_TEST_PASSWORD ?? '';

/** Waits for the newest email to an address in the local inbox and returns its first link. */
export async function latestEmailLink(request: APIRequestContext, to: string): Promise<string> {
  let link = '';
  await expect
    .poll(
      async () => {
        const search = await request.get(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:"${to}"`)}&limit=1`);
        const messages = (await search.json()).messages ?? [];
        if (messages.length === 0) return false;
        const message = await (await request.get(`${MAILPIT}/api/v1/message/${messages[0].ID}`)).json();
        const match = String(message.HTML).match(/href="([^"]+)"/);
        link = match ? match[1].replace(/&amp;/g, '&') : '';
        return link.length > 0;
      },
      { timeout: 15_000 },
    )
    .toBe(true);
  return link;
}

export async function logIn(page: Page, email: string, password: string) {
  await page.goto('/log-in');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();
}

export function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}@example.com`;
}

export async function signUpAndVerify(page: Page, request: APIRequestContext, email: string, password: string) {
  await page.goto('/sign-up');
  await page.getByLabel('First name').fill('Newuser');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByLabel('I am 18 or older').check();
  await page.getByRole('checkbox', { name: /I agree to the/ }).check();
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByText('Check your email and tap the link to verify your account.')).toBeVisible();
  await page.goto(await latestEmailLink(request, email));
  await expect(page.getByText('Your email is verified. Log in to continue.')).toBeVisible();
  // The link signs the user in and S3 then signs them out again; wait until that has finished.
  await page.waitForLoadState('networkidle');
  await expect
    .poll(() => page.evaluate(() => window.location.hash === '' && !Object.keys(localStorage).some((key) => key.includes('auth-token'))))
    .toBe(true);
}

/** Finishes a new user's money profile through the public API, using only their own login. */
export async function completeProfile(email: string, password: string) {
  const client = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const signIn = await client.auth.signInWithPassword({ email, password });
  expect(signIn.error).toBeNull();
  const userId = signIn.data.user!.id;
  await client.from('money_profiles').update({ gross_income: 10000, net_income: 9000, has_no_debts: true }).eq('user_id', userId);
  await client.from('expenses').insert({ name: 'Rent', category: 'Housing', monthly_amount: 1000 });
  const done = await client.from('money_profiles').update({ completed_at: new Date().toISOString() }).eq('user_id', userId);
  expect(done.error).toBeNull();
}
