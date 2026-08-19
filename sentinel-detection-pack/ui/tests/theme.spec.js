import { test, expect } from '@playwright/test';

test.describe('Theme system', () => {
  test('defaults to system preference (no stamped attribute)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.+/);
  });

  test('cycles system → light → dark and persists the explicit choice', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const toggle = page.getByRole('button', { name: /^Theme:/ });

    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('both themes render the hero heading with visible text', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const heading = page.getByRole('heading', { level: 1 });

    await expect(heading).toBeVisible();
    const lightColor = await heading.evaluate((el) => getComputedStyle(el).color);

    await page.getByRole('button', { name: /^Theme:/ }).click(); // -> light
    await page.getByRole('button', { name: /^Theme:/ }).click(); // -> dark
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(heading).toBeVisible();
    const darkColor = await heading.evaluate((el) => getComputedStyle(el).color);

    // The two themes must actually differ, not just toggle a no-op attribute.
    expect(darkColor).not.toEqual(lightColor);
  });
});
