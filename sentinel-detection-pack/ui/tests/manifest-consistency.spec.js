import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import manifest from '../src/data/projectManifest.json' with { type: 'json' };

const repoRoot = join(process.cwd(), '..', '..');

function countYamlFiles(dir) {
  let count = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) count += countYamlFiles(full);
    else if (entry.name.endsWith('.yaml') || entry.name.endsWith('.yml')) count += 1;
  }
  return count;
}

test.describe('Generated project manifest matches the repository', () => {
  test('rule count in the manifest matches the actual rules-yaml file count', () => {
    const actual = countYamlFiles(join(repoRoot, 'sentinel-detection-pack', 'rules-yaml'));
    expect(manifest.rules.total).toBe(actual);
  });

  test('workflow count matches .github/workflows', () => {
    const dir = join(repoRoot, '.github', 'workflows');
    const actual = readdirSync(dir).filter((f) => f.endsWith('.yml') || f.endsWith('.yaml')).length;
    expect(manifest.workflows.total).toBe(actual);
  });

  test('ADR count matches docs/adr', () => {
    const dir = join(repoRoot, 'docs', 'adr');
    const actual = readdirSync(dir).filter((f) => /^\d{4}-.*\.md$/.test(f)).length;
    expect(manifest.adrs.length).toBe(actual);
  });

  test('the homepage displays the same rule count as the manifest', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.getByText(`${manifest.rules.total} analytics rules`)).toBeVisible();
  });

  test('every ADR referenced in the manifest exists as a real file', () => {
    for (const adr of manifest.adrs) {
      expect(existsSync(join(repoRoot, adr.file)), `${adr.file} referenced by manifest but missing`).toBe(true);
    }
  });

  test('detection-validation-report.json is embedded and non-empty', () => {
    const reportPath = join(repoRoot, 'docs', 'detection-engineering', 'detection-validation-report.json');
    if (!existsSync(reportPath)) test.skip();
    const onDisk = JSON.parse(readFileSync(reportPath, 'utf-8'));
    expect(manifest.validation.summary.rules).toBe(onDisk.summary.rules);
  });
});
