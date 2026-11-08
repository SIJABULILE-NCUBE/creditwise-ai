import { test, expect, type Page } from '@playwright/test';
import { logIn, SEED_PASSWORD } from './helpers';

const READY: Record<string, string> = {
  '/snapshot': 'Hi Thando',
  '/my-money': 'Take-home pay (net)',
  '/transactions': 'Showing the last 90 days.',
  '/ask': 'Ask CreditWise explains your numbers.',
  '/get-ready': 'You can get your credit report free',
  '/account': 'Your data is stored in London',
};
const TABS = Object.keys(READY);

async function visit(page: Page, path: string) {
  await page.evaluate((target) => {
    window.history.pushState({}, '', target);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, path);
  await expect(page.getByText(READY[path]).first()).toBeVisible();
  await page.waitForLoadState('networkidle');
}

async function expectNoSideScroll(page: Page, label: string) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, label).toBeLessThanOrEqual(0);
}

test('T-NFR-7 layouts at 360, 768 and 1440 px', async ({ page }) => {
  test.setTimeout(90_000);
  await logIn(page, 'thando.nkosi@example.com', SEED_PASSWORD);
  await expect(page.getByText('36%', { exact: true })).toBeVisible();
  const nav = page.getByRole('navigation', { name: 'Main' });

  for (const width of [360, 768]) {
    await page.setViewportSize({ width, height: 844 });
    for (const path of TABS) {
      await visit(page, path);
      await expectNoSideScroll(page, `${path} at ${width}`);
    }
    const box = await nav.boundingBox();
    expect(box!.y + box!.height).toBeCloseTo(844, 0);
    expect(box!.width).toBe(width);
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  for (const path of TABS) {
    await visit(page, path);
    await expectNoSideScroll(page, `${path} at 1440`);
  }
  const side = await nav.boundingBox();
  expect(side).toMatchObject({ x: 0, y: 0, width: 240 });

  await visit(page, '/snapshot');
  const dti = await page.getByText('Debt-to-income (DTI)').boundingBox();
  const bar = await page.getByRole('heading', { name: 'Where your take-home pay goes' }).boundingBox();
  expect(bar!.x).toBeGreaterThan(dti!.x + 200);
  expect(Math.abs(bar!.y - dti!.y)).toBeLessThan(20);

  await visit(page, '/my-money');
  const expenses = await page.getByRole('heading', { name: 'Expenses' }).boundingBox();
  const debts = await page.getByRole('heading', { name: 'Debts' }).boundingBox();
  expect(debts!.x).toBeGreaterThan(expenses!.x + 200);

  await visit(page, '/transactions');
  for (const name of ['Date', 'Description', 'Amount', 'Flag']) {
    await expect(page.getByRole('columnheader', { name })).toBeVisible();
  }
});

test('T-NFR-3 every tappable control measures at least 44 px at phone width', async ({ page }) => {
  await logIn(page, 'thando.nkosi@example.com', SEED_PASSWORD);
  await expect(page.getByText('36%', { exact: true })).toBeVisible();
  for (const path of TABS) {
    await visit(page, path);
    const small = await page.locator('button:visible, a[href]:visible').evaluateAll((elements) =>
      elements
        .map((e) => ({ text: (e.getAttribute('aria-label') ?? e.textContent ?? '').trim(), box: e.getBoundingClientRect() }))
        .filter(({ box }) => box.height < 44 || box.width < 44)
        .map(({ text, box }) => `${text} ${Math.round(box.width)}x${Math.round(box.height)}`),
    );
    expect(small, path).toEqual([]);
  }
});
