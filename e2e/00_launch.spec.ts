import { test, expect } from '@playwright/test';

test.describe('T-SETUP-4 App launch', () => {
  test('T-SETUP-4 At 390 x 844 the app opens on S1 and shows "Create account"', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible();
    await expect(page.getByText('See your money the way a lender does.')).toBeVisible();
  });
});
