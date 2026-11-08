import { test, expect } from '@playwright/test';
import { addDebts, completeProfile, logIn, signUpAndVerify, uniqueEmail } from './helpers';

// Uses a new user with Sibusiso's income and debts, because this flow deletes a debt and must not change the seed data.
test('T-E2E-4 Flow 4: What if, then deleting a debt moves the Snapshot', async ({ page, request }) => {
  test.setTimeout(90_000);
  const email = uniqueEmail('flow4');
  await signUpAndVerify(page, request, email, 'creditwise1');
  await completeProfile(email, 'creditwise1', { gross: 32000, net: 24500 });
  await addDebts(email, 'creditwise1', [
    { name: 'Vehicle finance', type: 'Vehicle finance', monthly_repayment: 5900 },
    { name: 'Personal loan', type: 'Personal loan', monthly_repayment: 3800 },
    { name: 'Credit card', type: 'Credit card', monthly_repayment: 2100 },
    { name: 'Store account A', type: 'Store account', monthly_repayment: 900 },
    { name: 'Store account B', type: 'Store account', monthly_repayment: 850 },
    { name: 'Store account C', type: 'Store account', monthly_repayment: 850 },
  ]);
  await logIn(page, email, 'creditwise1');

  await expect(page.getByText('45%', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'What if I settle a debt?' }).click();
  await page.getByLabel(/Store account A/).check();
  await page.getByLabel(/Store account B/).check();
  await expect(page.getByText('45% → 40%')).toBeAttached();
  await page.getByRole('button', { name: 'Close' }).last().click();
  await expect(page.getByText('45%', { exact: true })).toBeVisible();

  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'My Money' }).click();
  await page.getByRole('button', { name: /Store account A/ }).click();
  await page.getByRole('button', { name: 'Delete' }).click();
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Debt deleted')).toBeVisible();

  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Snapshot' }).click();
  await expect(page.getByText('42%', { exact: true })).toBeVisible();
});
