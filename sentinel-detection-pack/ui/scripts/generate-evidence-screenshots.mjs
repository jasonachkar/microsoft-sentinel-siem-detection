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
    file: 'start-here.png',
    viewport: DESKTOP,
    waitFor: 'Start Here',
    proves: 'Guided reviewer entry point with mission, proof pillars, and 5-minute path.',
  },
  {
    route: '/architecture',
    file: 'architecture.png',
    viewport: DESKTOP,
    waitFor: 'Reference Architecture',
    proves: 'End-to-end architecture narrative for detection engineering and cloud security.',
  },
  {
    route: '/scenario/password-spray',
    file: 'password-spray-scenario.png',
    viewport: DESKTOP,
    waitFor: 'Password Spray',
    proves: 'Flagship Entra ID detection walkthrough with KQL, entities, and triage context.',
  },
  {
    route: '/evidence',
    file: 'evidence.png',
    viewport: DESKTOP,
    waitFor: 'Verified proof cards',
    proves: 'Repo-backed proof inventory separating real code, demo data, and limitations.',
  },
  {
    route: '/interview',
    file: 'interview-prep.png',
    viewport: DESKTOP,
    waitFor: 'Interview Prep',
    proves: 'Skills matrix, hard questions, and safe claims for hiring conversations.',
  },
  {
    route: '/',
    file: 'mobile-start-here.png',
    viewport: MOBILE,
    waitFor: 'Start Here',
    proves: 'Mobile layout of the Start Here reviewer journey.',
  },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await sleep(500);
  }
  throw new Error(`Server not ready at ${url}`);
}

function startPreviewServer() {
  return spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', PORT], {
    cwd: UI_ROOT,
    stdio: 'pipe',
    shell: true,
  });
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

  if (!process.env.PORTFOLIO_EVIDENCE_URL) {
    if (!process.env.PLAYWRIGHT_SKIP_WEBSERVER) {
      server = startPreviewServer();
      startedServer = true;
      await waitForServer(BASE_URL);
    }
  } else {
    await waitForServer(BASE_URL);
  }

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.addInitScript(() => {
    localStorage.setItem('sentinel-tour-seen', '1');
  });

  const generatedAt = new Date().toISOString();

  for (const capture of CAPTURES) {
    await page.setViewportSize(capture.viewport);
    await page.goto(`${BASE_URL}${capture.route}`, { waitUntil: 'networkidle' });
    await page.getByText(capture.waitFor, { exact: false }).first().waitFor({ state: 'visible', timeout: 30_000 });
    await page.locator('main').waitFor({ state: 'visible' });
    await sleep(400);
    const outPath = path.join(EVIDENCE_DIR, capture.file);
    await page.screenshot({ path: outPath, fullPage: true });
    console.log(`Wrote ${outPath}`);
  }

  await browser.close();
  if (startedServer && server) server.kill('SIGTERM');

  await generateIndex(generatedAt);
  console.log(`Wrote ${path.join(EVIDENCE_DIR, 'evidence-index.md')}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
