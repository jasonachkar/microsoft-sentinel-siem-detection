import { test, expect } from '@playwright/test';
import { navSections } from '../src/config/navigation.js';
import {
  preparePage,
  REVIEWER_ROUTES,
  assertNoHorizontalOverflow,
  assertMainContentVisible,
  openMobileNav,
  sidebarLink,
} from './helpers.js';

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 834, height: 1112 },
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'wide', width: 1536, height: 864 },
];

const LAB_SMOKE_ROUTES = ['/kql', '/simulator', '/copilot', '/threat-map', '/command-center'];

const navRoutes = navSections.flatMap((section) => section.items.map((item) => item.path));

for (const viewport of VIEWPORTS) {
  test.describe(`Responsive layout — ${viewport.name} (${viewport.width}px)`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const route of REVIEWER_ROUTES) {
      test(`reviewer route ${route} is visible without horizontal overflow`, async ({ page }) => {
        await preparePage(page);
        await page.goto(route, { waitUntil: 'domcontentloaded' });
        await assertMainContentVisible(page);
        await assertNoHorizontalOverflow(page);
        await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
      });
    }

    for (const route of LAB_SMOKE_ROUTES) {
      test(`lab route ${route} is visible without horizontal overflow`, async ({ page }) => {
        await preparePage(page);
        await page.goto(route, { waitUntil: 'domcontentloaded' });
        await assertMainContentVisible(page);
        await assertNoHorizontalOverflow(page);
        await expect(page.locator('main')).not.toBeEmpty();
      });
    }

    if (viewport.width < 1024) {
      test('mobile navigation opens, navigates, and closes', async ({ page }) => {
        await preparePage(page);
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await openMobileNav(page);
        await sidebarLink(page, 'Evidence').click();
        await expect(page).toHaveURL(/\/evidence$/);
        await expect(page.getByRole('button', { name: 'Open navigation menu' })).toBeVisible();
      });

      test('command palette opens on small screens', async ({ page }) => {
        await preparePage(page);
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await page.getByRole('button', { name: /Search or jump/i }).click();
        await expect(page.getByPlaceholder(/Jump to a view/i)).toBeVisible();
        await page.keyboard.press('Escape');
      });
    } else {
      test('desktop keeps sidebar visible', async ({ page }) => {
        await preparePage(page);
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await expect(sidebarLink(page, 'Start Here')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Open navigation menu' })).toBeHidden();
      });
    }
  });
}

test.describe('Responsive layout — all nav routes on mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const route of navRoutes) {
    test(`${route} loads on mobile without overflow`, async ({ page }) => {
      await preparePage(page);
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await assertMainContentVisible(page, 180);
      await assertNoHorizontalOverflow(page);
    });
  }
});
