import { test, expect } from '@playwright/test';
import { FLAGSHIP_RULE_ID } from './helpers.js';

test.describe('KQL viewer (real syntax, not a fake executor)', () => {
  test('renders a Monaco editor with real Kusto tokens', async ({ page }) => {
    await page.goto(`/detections/${FLAGSHIP_RULE_ID}`, { waitUntil: 'networkidle' });

    const editor = page.locator('.monaco-editor').first();
    await expect(editor).toBeVisible();

    // Kusto keywords like "let" should be tokenized (not plain, unstyled text) —
    // proof the real Kusto Monarch grammar is registered, not a generic <pre>.
    const keywordToken = editor.locator('.mtk1, [class*="mtk"]').first();
    await expect(keywordToken).toBeVisible();
    await expect(editor).toContainText('SigninLogs');
  });

  test('is read-only — no editable textbox and no "Run Query" affordance', async ({ page }) => {
    await page.goto(`/detections/${FLAGSHIP_RULE_ID}`, { waitUntil: 'networkidle' });

    const textbox = page.locator('.monaco-editor textarea');
    await expect(textbox).toHaveAttribute('readonly', 'true');

    await expect(page.getByRole('button', { name: /run query/i })).toHaveCount(0);
    await expect(page.getByText(/read-only source, not a live query runner/i)).toBeVisible();
  });

  test('offers copy and view-source actions instead of fake execution', async ({ page }) => {
    await page.goto(`/detections/${FLAGSHIP_RULE_ID}`, { waitUntil: 'networkidle' });
    await expect(page.getByRole('button', { name: 'Copy' })).toBeVisible();
    const sourceLink = page.getByRole('link', { name: 'View source' });
    await expect(sourceLink).toHaveAttribute('href', /github\.com/);
  });
});
