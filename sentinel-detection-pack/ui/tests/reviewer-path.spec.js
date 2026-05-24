import { test, expect } from '@playwright/test';
import { gotoRoute, assertNoConsoleErrors, assertPageHasText, preparePage, trackConsoleErrors } from './helpers.js';

test.describe('Reviewer path smoke tests', () => {
  test('Start Here loads with guided review content', async ({ page }) => {
    const errors = await gotoRoute(page, '/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await assertPageHasText(page, 'Start Here', 'What this project proves', '5-minute review path', 'Real vs');
    await assertNoConsoleErrors(errors);
  });

  test('Architecture page loads', async ({ page }) => {
    const errors = await gotoRoute(page, '/architecture');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Architecture/i);
    await assertNoConsoleErrors(errors);
  });

  test('Password Spray Scenario page loads', async ({ page }) => {
    const errors = await gotoRoute(page, '/scenario/password-spray');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Password Spray/i);
    await assertPageHasText(page, 'SigninLogs', 'MITRE');
    await assertNoConsoleErrors(errors);
  });

  test('Evidence page loads with proof inventory', async ({ page }) => {
    const errors = await gotoRoute(page, '/evidence');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Repo-backed proof/i);
    await assertPageHasText(page, 'Evidence', 'Verified proof cards', 'Real vs');
    await assertNoConsoleErrors(errors);
  });

  test('Candidate Brief page loads', async ({ page }) => {
    const errors = await gotoRoute(page, '/interview');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Candidate Brief/i);
    await assertPageHasText(page, 'Skills matrix', 'Claims I do not make');
    await assertNoConsoleErrors(errors);
  });

  test('5-minute review path links navigate correctly', async ({ page }) => {
    await preparePage(page);
    trackConsoleErrors(page);
    await page.goto('/', { waitUntil: 'networkidle' });

    const clickPathLink = async (label) => {
      const card = page.locator('a').filter({ hasText: label }).first();
      await card.click();
    };

    await clickPathLink('Architecture');
    await expect(page).toHaveURL(/\/architecture$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Architecture/i);
    await page.goto('/', { waitUntil: 'networkidle' });

    await clickPathLink('Password Spray Scenario');
    await expect(page).toHaveURL(/\/scenario\/password-spray$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Password Spray/i);
    await page.goto('/', { waitUntil: 'networkidle' });

    await clickPathLink('Evidence');
    await expect(page).toHaveURL(/\/evidence$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Repo-backed proof/i);
    await page.goto('/', { waitUntil: 'networkidle' });

    await clickPathLink('CI/CD & Drift');
    await expect(page).toHaveURL(/\/drift$/);
    await expect(page.locator('main')).not.toBeEmpty();
  });
});
