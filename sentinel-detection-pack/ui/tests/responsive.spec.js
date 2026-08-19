import { test, expect } from '@playwright/test';
import { primaryNav, labNav } from '../src/config/navigation.ts';
import {
  PRIMARY_ROUTES,
  assertNoHorizontalOverflow,
  assertMainContentVisible,
  openMobileNav,
  primaryNavLink,
} from './helpers.js';

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'laptop', width: 1280, height: 800 },
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'wide', width: 1536, height: 864 },
];

const LAB_SMOKE_ROUTES = ['/lab/kql', '/lab/simulator', '/lab/copilot', '/lab/threat-map', '/lab/dashboard'];

for (const viewport of VIEWPORTS) {
  test.describe(`Responsive layout — ${viewport.name} (${viewport.width}px)`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const route of PRIMARY_ROUTES) {
      test(`primary route ${route} is visible without horizontal overflow`, async ({ page }) => {
        await page.goto(route, { waitUntil: 'domcontentloaded' });
        await assertMainContentVisible(page);
        await assertNoHorizontalOverflow(page);
        await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
      });
    }

    for (const route of LAB_SMOKE_ROUTES) {
      test(`lab route ${route} is visible without horizontal overflow`, async ({ page }) => {
        await page.goto(route, { waitUntil: 'domcontentloaded' });
        await assertMainContentVisible(page);
        await assertNoHorizontalOverflow(page);
        await expect(page.locator('main')).not.toBeEmpty();
      });
    }

    if (viewport.width < 1024) {
      test('mobile navigation opens as a simple drawer, navigates, and closes', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await openMobileNav(page);

        // The mobile drawer must not recreate the old 27-item desktop sidebar —
        // it should list exactly the primary nav plus GitHub.
        const dialogLinks = await page.getByRole('dialog').getByRole('link').allInnerTexts();
        expect(dialogLinks.length).toBeLessThanOrEqual(primaryNav.length + 1);

        await page.getByRole('dialog').getByRole('link', { name: 'Evidence' }).click();
        await expect(page).toHaveURL(/\/evidence$/);
        await expect(page.getByRole('button', { name: 'Open navigation menu' })).toBeVisible();
      });

      test('command palette opens via keyboard shortcut on small screens', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await page.keyboard.press('Control+k');
        await expect(page.getByPlaceholder(/Search pages/i)).toBeVisible();
        await page.keyboard.press('Escape');
      });
    } else {
      test('desktop keeps the top nav visible, no hamburger', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await expect(primaryNavLink(page, 'Overview')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Open navigation menu' })).toBeHidden();
      });
    }
  });
}

test.describe('Responsive layout — all nav routes on mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  const allRoutes = [...primaryNav, ...labNav].map((item) => item.path);
  for (const route of [...new Set(allRoutes)]) {
    test(`${route} loads on mobile without overflow`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await assertMainContentVisible(page, 180);
      await assertNoHorizontalOverflow(page);
    });
  }
});
