import { test, expect } from '@playwright/test';
import { latestEmailLink, logIn, signUpAndVerify, uniqueEmail } from './helpers';

test('T-E2E-6 Flow 6: forgot password through to the new log-in', async ({ page, request }) => {
  test.setTimeout(90_000);
  const email = uniqueEmail('forgot');
  await signUpAndVerify(page, request, email, 'creditwise1');

  await page.goto('/log-in');
  await page.getByRole('link', { name: 'Forgot password?' }).click();
  await page.getByLabel('Email').fill(email);
  await page.getByRole('button', { name: 'Send link' }).click();
  await expect(page.getByText("If an account exists for this email, we've sent a reset link.")).toBeVisible();

  await expect.poll(async () => (await latestEmailLink(request, email)).includes('type=recovery')).toBe(true);
  await page.goto(await latestEmailLink(request, email));
  await page.getByLabel('New password', { exact: true }).fill('creditwise2');
  await page.getByLabel('Confirm new password').fill('creditwise2');
  await page.getByRole('button', { name: 'Save password' }).click();
  await expect(page.getByText('Password changed. Log in with your new password.')).toBeVisible();

  await logIn(page, email, 'creditwise2');
  await expect(page.getByRole('heading', { name: 'Set up your money profile' })).toBeVisible();
});
