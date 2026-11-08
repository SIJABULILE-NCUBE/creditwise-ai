import { test, expect } from '@playwright/test';
import { completeProfile, logIn, signUpAndVerify, uniqueEmail } from './helpers';

// Uses a new user so that each browser starts with no ticks.
test('T-E2E-5 Flow 5: tick 2 checklist items', async ({ page, request }) => {
  test.setTimeout(90_000);
  const email = uniqueEmail('flow5');
  await signUpAndVerify(page, request, email, 'creditwise1');
  await completeProfile(email, 'creditwise1');
  await logIn(page, email, 'creditwise1');

  await page.getByRole('link', { name: 'Get Ready' }).click();
  await page.getByRole('button', { name: /Vehicle finance/ }).click();
  await page.getByLabel('I have my 3 latest payslips').check();
  await page.getByLabel("I have my last 3 months' bank statements").check();
  await expect(page.getByRole('dialog').getByText('2 of 6 done')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).last().click();
  await expect(page.getByRole('button', { name: /Vehicle finance/ }).getByText('2 of 6 done')).toBeVisible();
});
