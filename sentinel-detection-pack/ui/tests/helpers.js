import { expect } from '@playwright/test';

export const FLAGSHIP_RULE_ID = '0710c724-a738-4b0f-af52-947ba4f01c0d';

export const PRIMARY_ROUTES = [
  '/',
  '/architecture',
  '/detections',
  `/detections/${FLAGSHIP_RULE_ID}`,
  '/operations',
  '/evidence',
];

export const REPO_BASE = 'https://github.com/jasonachkar/microsoft-sentinel-siem-detection';

/** Collect console errors; filter known benign browser noise. */
export function trackConsoleErrors(page) {
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (/favicon|404.*\.map|devtools/i.test(text)) return;
    errors.push(text);
  });
  return errors;
}

export async function gotoRoute(page, path) {
  const errors = trackConsoleErrors(page);
  await page.goto(path, { waitUntil: 'networkidle' });
  await expect(page.locator('#root')).not.toBeEmpty();
  await expect(page.locator('main')).toBeVisible();
  return errors;
}

export async function assertNoConsoleErrors(errors) {
  expect(errors, `Unexpected console errors:\n${errors.join('\n')}`).toEqual([]);
}

export async function assertPageHasText(page, ...phrases) {
  for (const phrase of phrases) {
    await expect(page.getByText(phrase, { exact: false }).first()).toBeVisible();
  }
}

export async function assertNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow, 'Page should not scroll horizontally').toBe(false);
}

export async function assertMainContentVisible(page, minWidth = 200) {
  await expect(page.locator('main')).toBeVisible();
  const box = await page.locator('main').boundingBox();
  expect(box).not.toBeNull();
  expect(box.width).toBeGreaterThan(minWidth);
  expect(box.x).toBeGreaterThanOrEqual(0);
}

export async function openMobileNav(page) {
  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await expect(page.getByRole('dialog').getByRole('link').first()).toBeVisible();
}

export function primaryNavLink(page, label) {
  return page.locator('nav[aria-label="Primary"]').getByRole('link', { name: new RegExp(`^${label}$`, 'i') });
}

/**
 * Detect forbidden positive claims while allowing safe negations.
 * Returns list of { phrase, snippet } violations.
 */
export function findOverclaimingViolations(text) {
  const rules = [
    { phrase: 'production-ready', allow: /\bnot\s+production-ready\b/i },
    { phrase: 'enterprise-grade', allow: /\bnot\s+enterprise-grade\b/i },
    { phrase: 'enterprise SOC', allow: /\bnot\s+(an?\s+)?enterprise SOC\b/i },
    { phrase: 'production SOC', allow: /\bnot\s+(a\s+)?production SOC\b|without claiming a production SOC\b/i },
    { phrase: 'real-time SOC', allow: /\bnot\s+(a\s+)?real-time SOC\b/i },
    { phrase: 'fully live telemetry', allow: /\bnot\s+fully live telemetry\b/i },
    {
      phrase: 'autonomous containment',
      allow: /\bnot\s+autonomous containment\b|do not claim autonomous containment\b|no autonomous containment\b/i,
    },
    { phrase: 'SOC 2 compliant', allow: /\bnot\s+SOC 2 compliant\b/i },
    { phrase: 'ISO 27001 certified', allow: /\bnot\s+ISO 27001 certified\b/i },
    { phrase: 'NIST certified', allow: /\bnot\s+.*NIST certified\b/i },
    {
      phrase: 'AI SOC Copilot',
      allow: /copilot concept demo\b/i,
      requireDemoLabelWithin: 80,
    },
    {
      phrase: 'replacement for Microsoft Sentinel',
      allow: /\bnot\s+a replacement for Microsoft Sentinel\b/i,
    },
    {
      phrase: 'replacement for Microsoft Defender',
      allow: /\bnot\s+a replacement for Microsoft Defender\b/i,
    },
  ];

  const violations = [];
  const lower = text.toLowerCase();

  for (const rule of rules) {
    const phraseLower = rule.phrase.toLowerCase();
    let start = 0;
    while ((start = lower.indexOf(phraseLower, start)) !== -1) {
      const contextStart = Math.max(0, start - 60);
      const contextEnd = Math.min(text.length, start + rule.phrase.length + 60);
      const snippet = text.slice(contextStart, contextEnd).replace(/\s+/g, ' ').trim();

      const allowedByPattern = rule.allow?.test(snippet);
      const negated = /\bnot\b|\bno\b|\bwithout claiming\b|\bdo not claim\b/i.test(snippet);

      let allowedByDemoLabel = true;
      if (rule.requireDemoLabelWithin) {
        const window = text.slice(start, start + rule.requireDemoLabelWithin);
        allowedByDemoLabel = /concept demo|demo-only|demo only/i.test(window);
      }

      if (!allowedByPattern && !negated && !allowedByDemoLabel) {
        violations.push({ phrase: rule.phrase, snippet });
      }
      start += phraseLower.length;
    }
  }

  return violations;
}
