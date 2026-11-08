import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import { completeProfile, logIn, signUpAndVerify, uniqueEmail } from './helpers';

function shiftedThandoCsv(): string {
  const lines = readFileSync('tests/fixtures/thando-oct.csv', 'utf8').trim().split(/\r?\n/);
  const newest = Math.max(...lines.slice(1).map((l) => Date.parse(`${l.split(',')[0]}T00:00:00Z`)));
  const shift = Date.now() - 2 * 86_400_000 - newest;
  return [
    lines[0],
    ...lines.slice(1).map((line) => {
      const [date, ...rest] = line.split(',');
      return [new Date(Date.parse(`${date}T00:00:00Z`) + shift).toISOString().slice(0, 10), ...rest].join(',');
    }),
  ].join('\n');
}

test('T-E2E-2 Flow 2: upload bank activity and query a flag', async ({ page, request }) => {
  test.setTimeout(90_000);
  const email = uniqueEmail('flow2');
  await signUpAndVerify(page, request, email, 'creditwise1');
  await completeProfile(email, 'creditwise1');
  await logIn(page, email, 'creditwise1');

  await page.getByRole('link', { name: 'Transactions' }).click();
  await expect(page.getByText('No transactions yet.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Add transactions' }).first().click();
  await page.getByLabel('Choose file').setInputFiles({ name: 'thando-oct.csv', mimeType: 'text/csv', buffer: Buffer.from(shiftedThandoCsv()) });
  await page.getByRole('button', { name: 'Upload', exact: true }).click();
  await expect(page.getByText('62 transactions added, 0 skipped. 3 need checking.')).toBeVisible();
  await expect(page.getByTestId('tab-badge')).toHaveText('3');

  await page.getByRole('button', { name: 'Flagged (3)' }).click();
  await page.getByRole('button', { name: /FITZONE GYM DEBIT/ }).click();
  await page.getByRole('button', { name: "I'll query it" }).click();
  await expect(page.getByText('Possible double charge · Querying')).toBeVisible();
  await expect(page.getByTestId('tab-badge')).toHaveText('2');
});
