import { test, expect } from '@playwright/test';
import { logIn, SEED_PASSWORD } from './helpers';

// Ayanda has an empty conversation, so the suggested questions show. The AI is replaced by a fixed answer (Section 18 #10).
test('T-E2E-3 Flow 3: from the Snapshot to an answer', async ({ page }) => {
  await page.route('**/api/ask', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ answer: 'Your Room is R5,600.00.', questionsLeft: 19 }) }),
  );
  await logIn(page, 'ayanda.mthembu@example.com', SEED_PASSWORD);
  await page.getByRole('button', { name: 'Ask about my Snapshot' }).click();
  await page.getByRole('button', { name: 'What car instalment can I afford?' }).click();
  await expect(page.getByText('Your Room is R5,600.00.')).toBeVisible();
  await expect(page.getByText('19 questions left today')).toBeVisible();
});
