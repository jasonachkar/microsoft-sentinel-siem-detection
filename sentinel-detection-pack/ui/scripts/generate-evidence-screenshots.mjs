#!/usr/bin/env node
/**
 * Captures portfolio UI screenshots for the reviewer path.
 * Does not fake Azure/Sentinel portal evidence — UI-only captures.
 */
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UI_ROOT = path.resolve(__dirname, '..');
const EVIDENCE_DIR = path.resolve(UI_ROOT, '../../evidence/ui');
const PORT = process.env.PLAYWRIGHT_PORT || '4173';
const BASE_URL = process.env.PORTFOLIO_EVIDENCE_URL || `http://127.0.0.1:${PORT}`;

const DESKTOP = { width: 1280, height: 720 };
const MOBILE = { width: 390, height: 844 };

const CAPTURES = [
  {
    route: '/',
    file: 'overview.png',
    viewport: DESKTOP,
    waitFor: 'Detection engineering, built as code',
    proves: 'Homepage answers what/why/where in the first viewport, with a repo-derived proof strip.',
  },
  {
    route: '/architecture',
    file: 'architecture.png',
    viewport: DESKTOP,
    waitFor: 'Architecture',
    proves: 'Reference architecture, trust boundaries, infrastructure source, and featured ADRs.',
  },
  {
    route: '/detections',
    file: 'detections.png',
    viewport: DESKTOP,
    waitFor: 'Detections',
    proves: 'Filterable detection catalog generated from rules-yaml at build time.',
  },
  {
    route: '/detections/0710c724-a738-4b0f-af52-947ba4f01c0d',
    file: 'password-spray-detail.png',
    viewport: DESKTOP,
    waitFor: 'Entra ID Password Spray',
    proves: 'Flagship detection case study: KQL, tuning, false positives, and response runbook.',
  },
  {
    route: '/operations',
    file: 'delivery-and-response.png',
    viewport: DESKTOP,
    waitFor: 'Delivery & Response',
    proves: 'PR-to-Sentinel delivery lifecycle and the detection-to-response lifecycle.',
  },
  {
    route: '/evidence',
    file: 'evidence.png',
    viewport: DESKTOP,
    waitFor: 'Proof index',
    proves: 'Repo-backed proof inventory with a six-state status vocabulary and project scope.',
  },
  {
    route: '/',
    file: 'mobile-overview.png',
    viewport: MOBILE,
    waitFor: 'Detection engineering, built as code',
    proves: 'Mobile layout of the homepage.',
  },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5_000) });
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await sleep(500);
  }
  throw new Error(`Server not ready at ${url} after ${timeoutMs}ms`);
}

function startPreviewServer() {
  const child = spawn(
    'npm',
    ['run', 'preview', '--', '--host', '127.0.0.1', '--port', PORT],
    { cwd: UI_ROOT, stdio: 'pipe', shell: process.platform === 'win32' },
  );
  child.stderr?.on('data', (chunk) => {
    const line = chunk.toString().trim();
    if (line) console.error(`[preview] ${line}`);
  });
  return child;
}

async function generateIndex(generatedAt) {
  const lines = [
    '# UI Evidence Screenshots',
    '',
    `Generated: ${generatedAt}`,
    '',
    'These are **automated UI reviewer evidence** captures from the portfolio React app.',
    'They are **not** Azure tenant or Sentinel portal screenshots.',
    'Real cloud deployment proof still requires a configured lab environment.',
    '',
    '| Screenshot | Route | What it proves |',
    '| --- | --- | --- |',
  ];

  for (const capture of CAPTURES) {
    lines.push(`| [${capture.file}](./${capture.file}) | \`${capture.route}\` | ${capture.proves} |`);
  }

  lines.push(
    '',
    '## Regenerate locally',
    '',
    '```bash',
    'cd sentinel-detection-pack/ui',
    'npm run build',
    'npm run evidence:screenshots',
    '```',
    '',
    '## CI artifacts',
    '',
    'GitHub Actions uploads `portfolio-ui-screenshots` and `playwright-report` on each run.',
    '',
  );

  await writeFile(path.join(EVIDENCE_DIR, 'evidence-index.md'), `${lines.join('\n')}\n`, 'utf8');
}

async function main() {
  await mkdir(EVIDENCE_DIR, { recursive: true });

  let server;
  let startedServer = false;

  try {
    if (process.env.PORTFOLIO_EVIDENCE_URL) {
      await waitForServer(BASE_URL);
    } else if (!process.env.PLAYWRIGHT_SKIP_WEBSERVER) {
      server = startPreviewServer();
      startedServer = true;
      await waitForServer(BASE_URL);
    }

    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    page.setDefaultNavigationTimeout(45_000);
    page.setDefaultTimeout(30_000);

    const generatedAt = new Date().toISOString();

    for (const capture of CAPTURES) {
      await page.setViewportSize(capture.viewport);
      await page.goto(`${BASE_URL}${capture.route}`, { waitUntil: 'domcontentloaded' });
      await page.getByText(capture.waitFor, { exact: false }).first().waitFor({ state: 'visible', timeout: 30_000 });
      await page.locator('main').waitFor({ state: 'visible' });
      await sleep(400);
      const outPath = path.join(EVIDENCE_DIR, capture.file);
      await page.screenshot({ path: outPath, fullPage: true });
      console.log(`Wrote ${outPath}`);
    }

    await browser.close();
    await generateIndex(generatedAt);
    console.log(`Wrote ${path.join(EVIDENCE_DIR, 'evidence-index.md')}`);
  } finally {
    if (startedServer && server) {
      server.kill('SIGTERM');
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
