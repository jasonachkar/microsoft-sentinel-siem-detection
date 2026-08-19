import { test, expect } from '@playwright/test';
import { primaryNav, labNav } from '../src/config/navigation.ts';
import { findOverclaimingViolations, PRIMARY_ROUTES } from './helpers.js';

test.describe('No overclaiming guard', () => {
  for (const route of PRIMARY_ROUTES) {
    test(`primary route ${route} has no unsafe positive claims`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'networkidle' });
      const text = await page.locator('main').innerText();
      const violations = findOverclaimingViolations(text);
      expect(violations, formatViolations(route, violations)).toEqual([]);
    });
  }

  test('/lab/copilot avoids unsafe AI SOC Copilot claims', async ({ page }) => {
    await page.goto('/lab/copilot', { waitUntil: 'networkidle' });
    const text = await page.locator('main').innerText();
    const violations = findOverclaimingViolations(text);
    expect(violations, formatViolations('/lab/copilot', violations)).toEqual([]);
    await expect(page.getByRole('heading', { name: 'Copilot Concept Demo' })).toBeVisible();
  });

  test('safe limitation wording remains visible on the Candidate Brief', async ({ page }) => {
    await page.goto('/interview', { waitUntil: 'networkidle' });
    const main = page.locator('main');
    await expect(main.getByText('Not a production SOC', { exact: false }).first()).toBeVisible();
    await expect(main.getByText('Not autonomous containment', { exact: false }).first()).toBeVisible();
  });

  test('no primary page links to the lab AI Copilot', async ({ page }) => {
    for (const route of PRIMARY_ROUTES) {
      await page.goto(route, { waitUntil: 'networkidle' });
      const copilotLinks = page.locator('a[href*="/lab/copilot"]');
      await expect(copilotLinks, `${route} should not link to /lab/copilot`).toHaveCount(0);
    }
  });
});

test.describe('Nav routes overclaiming sweep', () => {
  const allRoutes = [...primaryNav, ...labNav].map((item) => item.path);
  const uniqueRoutes = [...new Set(allRoutes)].filter((path) => path !== '/detections/:id');

  for (const route of uniqueRoutes) {
    test(`nav route ${route} has no unsafe claims`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'networkidle' });
      const text = await page.locator('main').innerText();
      const violations = findOverclaimingViolations(text);
      expect(violations, formatViolations(route, violations)).toEqual([]);
    });
  }
});

function formatViolations(route, violations) {
  if (!violations.length) return '';
  return violations
    .map((v) => `${route}: forbidden "${v.phrase}" in "...${v.snippet}..."`)
    .join('\n');
}
