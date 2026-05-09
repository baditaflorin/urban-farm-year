import { expect, test } from '@playwright/test';

test('loads the planner and records a harvest', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Urban Farm Year' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Star on GitHub/i })).toHaveAttribute(
    'href',
    'https://github.com/baditaflorin/urban-farm-year',
  );
  await expect(page.getByText(/Version 0\.2\.0/)).toBeVisible();

  await page
    .getByLabel(/Paste seed packets/)
    .fill(
      'Tomato "Red Pride" Bush. 78 days from transplant. Sow indoors 4-6 weeks before last frost. Space 24 in.',
    );
  await expect(page.getByText('Seed packet draft')).toBeVisible();
  await expect(page.getByText('Red Pride')).toBeVisible();
  await page.getByRole('button', { name: 'Apply draft' }).click();
  await expect(page.getByText(/Applied Seed packet draft/)).toBeVisible();

  await page.getByRole('button', { name: 'Plan' }).click();
  await expect(page.getByRole('heading', { name: 'Crop Plan' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Tomato Solanaceae/ })).toBeVisible();

  await page.getByRole('button', { name: 'Harvest' }).click();
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(page.getByText(/entries/)).toBeVisible();
});
