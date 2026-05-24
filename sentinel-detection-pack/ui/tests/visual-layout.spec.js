import { test, expect } from '@playwright/test';
import { preparePage, assertNoHorizontalOverflow } from './helpers.js';

// Layout smoke test for the primary reviewer routes. This is intentionally NOT a
// pixel-perfect screenshot test — it guards the structural failures that actually
// break a portfolio review: body-level horizontal scrolling, a missing/clipped
// primary heading, hidden main content, and unexpected console errors.
const PRIMARY_ROUTES = [
  '/',
  '/architecture',
  '/scenario/password-spray',
  '/evidence',
  '/cloud-security-controls',
  '/drift',
  '/soar',
];

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'laptop', width: 1440, height: 900 },
];

// Console noise expected when the optional live API / browser internals are offline.
const BENIGN_CONSOLE = /favicon|\.map\b|devtools|Live API|Failed to fetch|net::ERR|ResizeObserver|AbortError/i;

for (const vp of VIEWPORTS) {
  test.describe(`Visual layout smoke — ${vp.name} (${vp.width}x${vp.height})`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    for (const route of PRIMARY_ROUTES) {
      test(`${route} renders without overflow or clipped heading`, async ({ page }) => {
        const errors = [];
        page.on('console', (msg) => {
          if (msg.type() === 'error' && !BENIGN_CONSOLE.test(msg.text())) errors.push(msg.text());
        });

        await preparePage(page);
        await page.goto(route, { waitUntil: 'networkidle' });

        // 1 & 5: main content is present and visible.
        await expect(page.locator('main')).toBeVisible();

        // 2 & 6: a primary heading is visible and not clipped past the viewport edge.
        const heading = page.getByRole('heading', { level: 1 }).first();
        await expect(heading).toBeVisible();
        const box = await heading.boundingBox();
        expect(box, `no heading box on ${route}`).not.toBeNull();
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(vp.width + 2);

        // 4: no body-level horizontal overflow.
        await assertNoHorizontalOverflow(page);

        // 3: no unexpected console errors.
        expect(errors, `Console errors on ${route}:\n${errors.join('\n')}`).toEqual([]);
      });
    }
  });
}
