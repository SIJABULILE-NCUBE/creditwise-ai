import { test, expect, type Page } from '@playwright/test';
import { latestEmailLink, logIn, uniqueEmail } from './helpers';

async function addExpense(page: Page, name: string, category: string, amount: string) {
  await page.getByRole('button', { name: 'Add expense' }).click();
  await page.getByLabel('Name').fill(name);
  await page.getByLabel('Category').selectOption(category);
  await page.getByLabel('Monthly amount').fill(amount);
  await page.getByRole('button', { name: 'Save expense' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
}

async function addDebt(page: Page, name: string, type: string, amount: string) {
  await page.getByRole('button', { name: 'Add debt' }).click();
  await page.getByLabel('Name').fill(name);
  await page.getByLabel('Type').selectOption(type);
  await page.getByLabel('Monthly repayment').fill(amount);
  await page.getByRole('button', { name: 'Save debt' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
}

test('T-E2E-1 Flow 1: sign-up to first Snapshot', async ({ page, request }) => {
  test.setTimeout(90_000);
  const email = uniqueEmail('flow1');
  const password = 'creditwise1';

  await page.goto('/');
  await page.getByRole('button', { name: 'Create account' }).click();
  await page.getByRole('button', { name: 'Privacy Notice' }).click();
  await expect(page.getByRole('heading', { name: 'What we collect' })).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).last().click();

  await page.getByLabel('First name').fill('Thando');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByLabel('I am 18 or older').check();
  await page.getByRole('checkbox', { name: /I agree to the/ }).check();
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByText('Check your email and tap the link to verify your account.')).toBeVisible();

  await page.goto(await latestEmailLink(request, email));
  await expect(page.getByText('Your email is verified. Log in to continue.')).toBeVisible();
  await page.waitForLoadState('networkidle');
  await logIn(page, email, password);

  await page.getByLabel('Monthly income before deductions (gross)').fill('25000');
  await page.getByLabel('Monthly take-home pay (net)').fill('19800');
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByText('Step 2 of 3')).toBeVisible();

  await addExpense(page, 'Rent', 'Housing', '4800');
  await addExpense(page, 'Transport', 'Transport', '1500');
  await addExpense(page, 'Groceries', 'Food', '2000');
  await addExpense(page, 'Cellphone contract', 'Phone and internet', '399');
  await addExpense(page, 'Gym', 'Other', '399');
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByText('Step 3 of 3')).toBeVisible();

  await addDebt(page, 'Personal loan', 'Personal loan', '4500');
  await addDebt(page, 'Clothing store card', 'Store account', '1200');
  await addDebt(page, 'Furniture store account', 'Store account', '1300');
  await addDebt(page, 'Credit card', 'Credit card', '2000');
  await page.getByRole('button', { name: 'See my snapshot' }).click();

  await expect(page.getByText('36%', { exact: true })).toBeVisible();
  await expect(page.getByText('Amber: getting stretched')).toBeVisible();
  await expect(page.getByText('R1,702.00').first()).toBeVisible();
  await expect(page.getByText('R1,000.00').first()).toBeVisible();
});
