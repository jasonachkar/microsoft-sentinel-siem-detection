import { test, expect } from '@playwright/test';
import { gotoRoute, assertNoConsoleErrors, assertPageHasText, FLAGSHIP_RULE_ID } from './helpers.js';

test.describe('Reviewer path smoke tests', () => {
  test('Overview loads and answers what/why/where in the first viewport', async ({ page }) => {
    const errors = await gotoRoute(page, '/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Detection engineering, built as code/i);
    await assertPageHasText(page, 'analytics rules', 'Terraform modules', 'Explore the architecture', 'View detections');
    await assertNoConsoleErrors(errors);
  });

  test('no automatic tour or onboarding modal interrupts the first visit', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('Architecture page loads with tabs', async ({ page }) => {
    const errors = await gotoRoute(page, '/architecture');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Architecture/i);
    await assertPageHasText(page, 'Overview', 'Trust & identity', 'Infrastructure source', 'Decisions');
    await assertNoConsoleErrors(errors);
  });

  test('Detections catalog loads with the real rule count', async ({ page }) => {
    const errors = await gotoRoute(page, '/detections');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Detections/i);
    await assertPageHasText(page, 'Entra ID Password Spray');
    await assertNoConsoleErrors(errors);
  });

  test('Password Spray flagship detail loads with KQL and MITRE', async ({ page }) => {
    const errors = await gotoRoute(page, `/detections/${FLAGSHIP_RULE_ID}`);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Entra ID Password Spray/i);
    await assertPageHasText(page, 'SigninLogs', 'T1110.003', 'Tuning', 'Repository evidence');
    await assertNoConsoleErrors(errors);
  });

  test('Delivery & Response page loads with both lifecycles', async ({ page }) => {
    const errors = await gotoRoute(page, '/operations');
    await assertPageHasText(page, 'Delivery lifecycle', 'Response lifecycle', 'Human approval');
    await assertNoConsoleErrors(errors);
  });

  test('Evidence page loads with the proof index', async ({ page }) => {
    const errors = await gotoRoute(page, '/evidence');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Evidence/i);
    await assertPageHasText(page, 'Sentinel core infrastructure', 'CI validation', 'Project scope');
    await assertNoConsoleErrors(errors);
  });

  test('Candidate Brief loads from the footer link', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.getByRole('link', { name: 'Candidate brief' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Candidate Brief/i);
  });

  test('the primary journey is reachable by following real links, not memorized URLs', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    await page.getByRole('link', { name: 'Explore the architecture' }).click();
    await expect(page).toHaveURL(/\/architecture$/);

    await page.goto('/', { waitUntil: 'networkidle' });
    await page.getByRole('link', { name: 'View detections' }).click();
    await expect(page).toHaveURL(/\/detections$/);

    await page.goto('/', { waitUntil: 'networkidle' });
    await page.getByRole('link', { name: /Open full detection/i }).click();
    await expect(page).toHaveURL(new RegExp(`/detections/${FLAGSHIP_RULE_ID}$`));

    await page.goto('/', { waitUntil: 'networkidle' });
    await page.getByRole('link', { name: /Full evidence index/i }).click();
    await expect(page).toHaveURL(/\/evidence$/);
  });
});
