import { test, expect } from '@playwright/test';
import rulesData from '../src/data/rules.json' with { type: 'json' };

test.describe('Detections catalog filters', () => {
  test('search narrows results by name', async ({ page }) => {
    await page.goto('/detections', { waitUntil: 'networkidle' });
    const rows = page.locator('tbody tr');
    const initialCount = await rows.count();
    expect(initialCount).toBeGreaterThan(1);

    await page.getByPlaceholder(/Search by name/i).fill('Password Spray');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText('Entra ID Password Spray');
  });

  test('domain filter narrows results to a single domain', async ({ page }) => {
    await page.goto('/detections', { waitUntil: 'networkidle' });
    const identityCount = rulesData.rules.filter((r) => r.category === 'identity').length;

    await page.getByLabel('Filter by domain').selectOption('identity');
    await expect(page.locator('tbody tr')).toHaveCount(identityCount);
  });

  test('severity filter narrows results', async ({ page }) => {
    await page.goto('/detections', { waitUntil: 'networkidle' });
    const highCount = rulesData.rules.filter((r) => r.severity === 'High').length;

    await page.getByLabel('Filter by severity').selectOption('High');
    await expect(page.locator('tbody tr')).toHaveCount(highCount);
  });

  test('no decorative charts — the catalog is a table, not a dashboard', async ({ page }) => {
    await page.goto('/detections', { waitUntil: 'networkidle' });
    await expect(page.locator('canvas')).toHaveCount(0);
    await expect(page.locator('svg.recharts-surface')).toHaveCount(0);
  });

  test('clicking a rule opens its detail page', async ({ page }) => {
    await page.goto('/detections', { waitUntil: 'networkidle' });
    await page.getByRole('link', { name: 'Entra ID Password Spray' }).click();
    await expect(page).toHaveURL(/\/detections\/0710c724-a738-4b0f-af52-947ba4f01c0d$/);
  });
});
