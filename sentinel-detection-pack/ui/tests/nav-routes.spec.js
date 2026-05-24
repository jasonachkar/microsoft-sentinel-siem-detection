import { test, expect } from '@playwright/test';
import { navSections } from '../src/config/navigation.js';
import { preparePage, REPO_BASE } from './helpers.js';

const navRoutes = navSections.flatMap((section) =>
  section.items.map((item) => ({ ...item, section: section.section })),
);

test.describe('Internal navigation routes', () => {
  for (const item of navRoutes) {
    test(`${item.section} → ${item.label} (${item.path}) loads`, async ({ page }) => {
      await preparePage(page);
      await page.goto(item.path, { waitUntil: 'networkidle' });
      await expect(page.locator('#root')).not.toBeEmpty();
      await expect(page.locator('main')).toBeVisible();
      const mainText = await page.locator('main').innerText();
      expect(mainText.trim().length).toBeGreaterThan(40);
    });
  }
});

test.describe('GitHub proof links on Start Here', () => {
  test('top proof links use the correct repository base URL', async ({ page }) => {
    await preparePage(page);
    await page.goto('/', { waitUntil: 'networkidle' });

    const proofSection = page.locator('section').filter({ hasText: 'Top 5 proof links' });
    const githubLinks = proofSection.locator(`a[href^="${REPO_BASE}/blob/main/"]`);
    await expect(githubLinks).toHaveCount(5);

    for (const link of await githubLinks.all()) {
      const href = await link.getAttribute('href');
      expect(href).toMatch(new RegExp(`^${REPO_BASE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/blob/main/`));
    }
  });
});
