import { expect, test } from '@playwright/test';

test('loads the planner and records a harvest', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Urban Farm Year' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Star on GitHub/i })).toHaveAttribute(
    'href',
    'https://github.com/baditaflorin/urban-farm-year',
  );
  await expect(page.getByText(/Version 0\.1\.0/)).toBeVisible();

  await page.getByRole('button', { name: 'Plan' }).click();
  await expect(page.getByRole('heading', { name: 'Crop Plan' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Tomato Solanaceae/ })).toBeVisible();

  await page.getByRole('button', { name: 'Harvest' }).click();
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(page.getByText(/entries/)).toBeVisible();
});
