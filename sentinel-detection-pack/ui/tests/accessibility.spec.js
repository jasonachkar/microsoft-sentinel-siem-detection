import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PRIMARY_ROUTES } from './helpers.js';

// Serious a11y rules only — color-contrast noise is intentionally excluded for now.
const SERIOUS_RULES = [
  'document-title',
  'html-has-lang',
  'landmark-one-main',
  'page-has-heading-one',
  'button-name',
  'link-name',
  'aria-allowed-attr',
  'aria-required-children',
  'aria-required-parent',
  'duplicate-id',
  'frame-title',
  'image-alt',
  'input-button-name',
  'label',
  'select-name',
];

async function runAxe(page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'best-practice'])
    .disableRules(['color-contrast', 'color-contrast-enhanced'])
    .analyze();
  const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  return serious.filter((v) => SERIOUS_RULES.includes(v.id) || v.impact === 'critical');
}

test.describe('Accessibility smoke checks', () => {
  for (const route of PRIMARY_ROUTES) {
    test(`${route} has no serious axe violations`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'networkidle' });
      const filtered = await runAxe(page);
      expect(filtered, formatViolations(route, filtered)).toEqual([]);
    });
  }

  test('document title is set on Overview', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page).toHaveTitle(/Sentinel/i);
  });

  test('dark theme has no serious axe violations on Overview', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /^Theme:/ }).click(); // system -> light
    await page.getByRole('button', { name: /^Theme:/ }).click(); // light -> dark
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const filtered = await runAxe(page);
    expect(filtered, formatViolations('/ (dark theme)', filtered)).toEqual([]);
  });

  test('reduced motion preference does not break the page', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const filtered = await runAxe(page);
    expect(filtered, formatViolations('/ (reduced motion)', filtered)).toEqual([]);
  });

  test('skip-to-content link is the first focusable element', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  });
});

function formatViolations(route, violations) {
  if (!violations.length) return '';
  return violations
    .map((v) => `${route}: [${v.impact}] ${v.id} — ${v.help}\n  ${v.nodes.map((n) => n.target.join(' ')).join('\n  ')}`)
    .join('\n\n');
}
