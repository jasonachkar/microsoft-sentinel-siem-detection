import { test, expect } from '@playwright/test';
import { primaryNav, labNav, GITHUB_URL } from '../src/config/navigation.ts';
import { REPO_BASE } from './helpers.js';

test.describe('Primary navigation structure', () => {
  test('primary nav has no more than five internal destinations', async () => {
    expect(primaryNav.length).toBeLessThanOrEqual(5);
  });

  test('primary nav renders exactly the expected labels, in order', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const nav = page.locator('nav[aria-label="Primary"]');
    const labels = await nav.getByRole('link').allInnerTexts();
    expect(labels).toEqual(primaryNav.map((item) => item.label));
  });

  test('GitHub link in the header points to the repository', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const link = page.getByRole('link', { name: 'GitHub' }).first();
    await expect(link).toHaveAttribute('href', GITHUB_URL);
    expect(GITHUB_URL.startsWith(REPO_BASE)).toBe(true);
  });

  for (const item of primaryNav) {
    test(`primary route ${item.path} loads with visible content`, async ({ page }) => {
      await page.goto(item.path, { waitUntil: 'networkidle' });
      await expect(page.locator('#root')).not.toBeEmpty();
      await expect(page.locator('main')).toBeVisible();
      const mainText = await page.locator('main').innerText();
      expect(mainText.trim().length).toBeGreaterThan(40);
    });
  }
});

test.describe('Lab sandbox routes', () => {
  for (const item of labNav) {
    test(`lab route ${item.path} loads but is not in primary nav`, async ({ page }) => {
      await page.goto(item.path, { waitUntil: 'networkidle' });
      await expect(page.locator('main')).toBeVisible();

      const primaryNavBar = page.locator('nav[aria-label="Primary"]');
      const linkToLab = primaryNavBar.locator(`a[href="${item.path}"]`);
      await expect(linkToLab).toHaveCount(0);
    });
  }

  test('lab pages show the experimental banner (except the index)', async ({ page }) => {
    await page.goto('/lab/kql', { waitUntil: 'networkidle' });
    await expect(page.getByText(/Lab sandbox — experimental\/demo page/i)).toBeVisible();
  });
});
