import { test, expect } from '@playwright/test';
import { completeProfile, logIn, SEED_PASSWORD, signUpAndVerify, uniqueEmail } from './helpers';

test('T-US3-1 log out goes to S1 and the back button shows no data', async ({ page }) => {
  await logIn(page, 'ayanda.mthembu@example.com', SEED_PASSWORD);
  await page.getByRole('button', { name: 'Account' }).click();
  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page.getByRole('heading', { name: 'See your money the way a lender does.' })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('navigation', { name: 'Main' })).toHaveCount(0);
  await expect(page.getByText('ayanda.mthembu@example.com')).toHaveCount(0);
});

test('T-E2E-7 Flow 7: Account, Privacy Notice, then deleting a new user', async ({ page, request }) => {
  const email = uniqueEmail('delete');
  await signUpAndVerify(page, request, email, 'creditwise1');
  await completeProfile(email, 'creditwise1');
  await logIn(page, email, 'creditwise1');

  await page.getByRole('button', { name: 'Account' }).click();
  await page.getByRole('button', { name: 'Privacy Notice' }).click();
  await expect(page.getByRole('heading', { name: 'What we collect' })).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).last().click();

  await page.getByRole('button', { name: 'Delete account' }).click();
  await page.getByLabel('Type DELETE to confirm').fill('DELETE');
  await page.getByRole('button', { name: 'Delete my account' }).click();
  await expect(page.getByText('Your account and all your data have been deleted.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'See your money the way a lender does.' })).toBeVisible();
});
