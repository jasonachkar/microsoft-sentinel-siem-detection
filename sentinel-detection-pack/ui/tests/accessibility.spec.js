import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { preparePage } from './helpers.js';

const ROUTES = ['/', '/evidence', '/scenario/password-spray'];

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

test.describe('Accessibility smoke checks', () => {
  for (const route of ROUTES) {
    test(`${route} has no serious axe violations`, async ({ page }) => {
      await preparePage(page);
      await page.goto(route, { waitUntil: 'networkidle' });

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'best-practice'])
        .disableRules(['color-contrast', 'color-contrast-enhanced'])
        .analyze();

      const serious = results.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical',
      );
      const filtered = serious.filter((v) => SERIOUS_RULES.includes(v.id) || v.impact === 'critical');

      expect(filtered, formatViolations(route, filtered)).toEqual([]);
    });
  }

  test('document title is set on Start Here', async ({ page }) => {
    await preparePage(page);
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page).toHaveTitle(/Microsoft Sentinel Cloud Security Detection Engineering Lab/i);
  });
});

function formatViolations(route, violations) {
  if (!violations.length) return '';
  return violations
    .map((v) => `${route}: [${v.impact}] ${v.id} — ${v.help}\n  ${v.nodes.map((n) => n.target.join(' ')).join('\n  ')}`)
    .join('\n\n');
}
