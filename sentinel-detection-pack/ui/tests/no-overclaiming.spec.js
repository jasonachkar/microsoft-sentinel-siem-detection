import { test, expect } from '@playwright/test';
import { navSections } from '../src/config/navigation.js';
import { findOverclaimingViolations, preparePage } from './helpers.js';

const PRIMARY_ROUTES = ['/', '/architecture', '/scenario/password-spray', '/evidence', '/interview'];

const NAV_ROUTES = navSections.flatMap((section) => section.items.map((item) => item.path));

test.describe('No overclaiming guard', () => {
  for (const route of PRIMARY_ROUTES) {
    test(`primary route ${route} has no unsafe positive claims`, async ({ page }) => {
      await preparePage(page);
      await page.goto(route, { waitUntil: 'networkidle' });
      const text = await page.locator('main').innerText();
      const violations = findOverclaimingViolations(text);
      expect(violations, formatViolations(route, violations)).toEqual([]);
    });
  }

  test('Lab Sandbox routes avoid unsafe AI SOC Copilot claims', async ({ page }) => {
    await preparePage(page);
    await page.goto('/copilot', { waitUntil: 'networkidle' });
    const text = await page.locator('main').innerText();
    const violations = findOverclaimingViolations(text);
    expect(violations, formatViolations('/copilot', violations)).toEqual([]);
    await expect(page.getByRole('heading', { name: 'Copilot Concept Demo' })).toBeVisible();
  });

  test('safe limitation wording remains visible on Interview Prep', async ({ page }) => {
    await preparePage(page);
    await page.goto('/interview', { waitUntil: 'networkidle' });
    await expect(page.getByText('Not a production SOC', { exact: false })).toBeVisible();
    await expect(page.getByText('Not autonomous containment', { exact: false })).toBeVisible();
  });
});

test.describe('Nav routes overclaiming sweep', () => {
  const uniqueRoutes = [...new Set(NAV_ROUTES)];

  for (const route of uniqueRoutes) {
    test(`nav route ${route} has no unsafe claims`, async ({ page }) => {
      await preparePage(page);
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
