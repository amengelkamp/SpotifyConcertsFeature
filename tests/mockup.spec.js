import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const URL = `file://${path.resolve(__dirname, '../index.html')}`;

test.beforeEach(async ({ page }) => {
  await page.goto(URL);
});

// ── Phone frame ──────────────────────────────────────────────
test('phone frame renders with status bar', async ({ page }) => {
  await expect(page.locator('.phone')).toBeVisible();
  await expect(page.locator('.dynamic-island')).toBeVisible();
  await expect(page.locator('.sb-time')).toContainText('9:41');
});

// ── Home screen ──────────────────────────────────────────────
test('home screen shows correct tabs', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Alle' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Musik' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Podcasts' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Hörbücher' })).toBeVisible();
});

test('concerts row animates in after delay', async ({ page }) => {
  // Initially hidden
  const section = page.locator('#concerts-section');
  await expect(section).not.toHaveClass(/visible/);
  // After animation delay
  await page.waitForTimeout(2000);
  await expect(section).toHaveClass(/visible/);
});

test('notification prompt appears after concerts row', async ({ page }) => {
  await page.waitForTimeout(2500);
  await expect(page.locator('#np')).toHaveClass(/visible/);
});

test('sold-out badge visible on Florence card', async ({ page }) => {
  await expect(page.locator('.badge-so').first()).toBeVisible();
});

test('Europa-Show badge visible on Phoebe Bridgers card', async ({ page }) => {
  await expect(page.locator('.badge-eu').first()).toBeVisible();
});

// ── Notification flow ────────────────────────────────────────
test('notification prompt dismisses on Nein danke', async ({ page }) => {
  await page.waitForTimeout(2500);
  await page.getByRole('button', { name: 'Nein danke' }).click();
  await expect(page.locator('#np')).not.toHaveClass(/visible/);
});

test('Ja benachrichtigen triggers iOS permission sheet', async ({ page }) => {
  await page.waitForTimeout(2500);
  await page.getByRole('button', { name: 'Ja, benachrichtigen' }).click();
  await page.waitForTimeout(300);
  await expect(page.locator('.ios-overlay')).toHaveClass(/show/);
  await expect(page.locator('.ios-alert-title')).toBeVisible();
});

test('iOS sheet dismisses on Erlauben', async ({ page }) => {
  await page.waitForTimeout(2500);
  await page.getByRole('button', { name: 'Ja, benachrichtigen' }).click();
  await page.waitForTimeout(400);
  await page.locator('.ios-alert-btn.ios-allow').click();
  await expect(page.locator('.ios-overlay')).not.toHaveClass(/show/);
});

// ── Navigation ───────────────────────────────────────────────
test('clicking Alle anzeigen opens concerts list', async ({ page }) => {
  await page.locator('#s-home a.sec-link[onclick]').click();
  await page.waitForTimeout(350);
  await expect(page.locator('#s-concerts')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  await expect(page.locator('#s-concerts').getByText('Diese Woche')).toBeVisible();
});

test('concerts list back button returns to home', async ({ page }) => {
  await page.locator('#s-home a.sec-link[onclick]').click();
  await page.waitForTimeout(350);
  await page.locator('#s-concerts .back-btn').click();
  await page.waitForTimeout(350);
  await expect(page.locator('#s-home')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
});

test('clicking concert row opens Remi Wolf detail', async ({ page }) => {
  await page.locator('#s-home a.sec-link[onclick]').click();
  await page.waitForTimeout(350);
  await page.locator('#s-concerts .concert-item').first().click();
  await page.waitForTimeout(350);
  // Should be on a detail screen
  const detailVisible = await page.locator('#s-detail-remi, #s-detail-phoebe').first().evaluate(
    el => window.getComputedStyle(el).transform === 'matrix(1, 0, 0, 1, 0, 0)'
  );
  expect(detailVisible).toBe(true);
});

test('Rock am Ring navigates to festival detail page', async ({ page }) => {
  await page.locator('#s-home a.sec-link[onclick]').click();
  await page.waitForTimeout(350);
  await page.locator('#s-concerts .concert-item[data-distance="95"]').click();
  await page.waitForTimeout(350);
  await expect(page.locator('#s-detail-rar')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  await expect(page.locator('#s-detail-rar').getByText('Rock am Ring')).toBeVisible();
  await expect(page.locator('#s-detail-rar').getByText('Remi Wolf')).toBeVisible();
});

test('Phoebe Bridgers detail shows Europa notice', async ({ page }) => {
  await page.locator('#s-home a.sec-link[onclick]').click();
  await page.waitForTimeout(350);
  await page.locator('#s-concerts .concert-item[data-exception="true"]').click();
  await page.waitForTimeout(350);
  await expect(page.locator('#s-detail-phoebe')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  await expect(page.locator('#s-detail-phoebe').getByText(/einzigen Termin in Europa/)).toBeVisible();
});

// ── Radius filtering ──────────────────────────────────────────
test('radius 50km hides all concerts and shows empty state', async ({ page }) => {
  await page.locator('#s-home a.sec-link[onclick]').click();
  await page.waitForTimeout(350);
  await page.selectOption('#radius-select', '50');
  await expect(page.locator('#concerts-empty')).toBeVisible();
  await expect(page.locator('#filter-meta')).toContainText('0 Konzerte');
});

test('radius 300km shows maximum concerts', async ({ page }) => {
  await page.locator('#s-home a.sec-link[onclick]').click();
  await page.waitForTimeout(350);
  await page.selectOption('#radius-select', '300');
  await expect(page.locator('#filter-meta')).toContainText('8 Konzerte'); // Maggie Rogers at 320km excluded
});

test('Phoebe exception row hidden at 100km', async ({ page }) => {
  await page.locator('#s-home a.sec-link[onclick]').click();
  await page.waitForTimeout(350);
  await page.selectOption('#radius-select', '100');
  const phoebe = page.locator('.concert-item[data-exception="true"]');
  await expect(phoebe).toHaveCSS('display', 'none');
});

test('Phoebe exception row visible at 150km', async ({ page }) => {
  await page.locator('#s-home a.sec-link[onclick]').click();
  await page.waitForTimeout(350);
  await page.selectOption('#radius-select', '150');
  const phoebe = page.locator('.concert-item[data-exception="true"]');
  await expect(phoebe).not.toHaveCSS('display', 'none');
});

// ── Sold-out toggle ───────────────────────────────────────────
test('sold-out toggle hides sold-out rows', async ({ page }) => {
  await page.locator('#s-home a.sec-link[onclick]').click();
  await page.waitForTimeout(350);
  const soldOut = page.locator('#s-concerts .so-item').first();
  await expect(soldOut).not.toHaveCSS('display', 'none');
  await page.locator('#so-toggle').click();
  await expect(soldOut).toHaveCSS('display', 'none');
});

test('sold-out toggle restores rows when toggled off', async ({ page }) => {
  await page.locator('#s-home a.sec-link[onclick]').click();
  await page.waitForTimeout(350);
  await page.locator('#so-toggle').click();
  await page.locator('#so-toggle').click();
  await expect(page.locator('#s-concerts .so-item').first()).not.toHaveCSS('display', 'none');
});
