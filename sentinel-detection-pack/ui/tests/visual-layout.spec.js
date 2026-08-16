import { test, expect } from '@playwright/test';
import { PRIMARY_ROUTES } from './helpers.js';

// Layout smoke test for the primary reviewer routes. This is intentionally NOT a
// pixel-perfect screenshot test — it guards the structural failures that actually
// break a portfolio review: body-level horizontal scrolling, a missing/clipped
// primary heading, hidden main content, and unexpected console errors.
//
// Viewports match the brief's required desktop/laptop/mobile trio exactly.
const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'laptop', width: 1280, height: 800 },
  { name: 'desktop', width: 1440, height: 900 },
];

// Console noise expected from Monaco/ResizeObserver in headless CI.
const BENIGN_CONSOLE = /favicon|\.map\b|devtools|ResizeObserver|AbortError/i;

for (const vp of VIEWPORTS) {
  test.describe(`Visual layout smoke — ${vp.name} (${vp.width}x${vp.height})`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    for (const route of PRIMARY_ROUTES) {
      test(`${route} renders without overflow or clipped heading`, async ({ page }) => {
        const errors = [];
        page.on('console', (msg) => {
          if (msg.type() === 'error' && !BENIGN_CONSOLE.test(msg.text())) errors.push(msg.text());
        });

        await page.goto(route, { waitUntil: 'networkidle' });

        await expect(page.locator('main')).toBeVisible();

        const heading = page.getByRole('heading', { level: 1 }).first();
        await expect(heading).toBeVisible();
        const box = await heading.boundingBox();
        expect(box, `no heading box on ${route}`).not.toBeNull();
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(vp.width + 2);

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        );
        expect(overflow, `${route} should not scroll horizontally at ${vp.width}px`).toBe(false);

        expect(errors, `Console errors on ${route}:\n${errors.join('\n')}`).toEqual([]);
      });
    }
  });
}
