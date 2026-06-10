import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const URL = `file://${path.resolve(__dirname, '../index.html')}`;

test.beforeEach(async ({ page }) => {
  await page.goto(URL);
});

// ── Home screen ──────────────────────────────────────────────
test('home screen shows correct tabs', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Alle' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Musik' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Podcasts' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Hörbücher' })).toBeVisible();
});

test('home screen shows concerts row with artists', async ({ page }) => {
  await expect(page.locator('#s-home').getByText('Konzerte in deiner Nähe', { exact: true })).toBeVisible();
  await expect(page.locator('.c-card-artist', { hasText: 'Remi Wolf' }).first()).toBeVisible();
  await expect(page.locator('.c-card-artist', { hasText: 'Phoebe Bridgers' })).toBeVisible();
  await expect(page.locator('.c-card-artist', { hasText: 'Rock am Ring' })).toBeVisible();
});

test('sold-out badge visible on Florence card', async ({ page }) => {
  await expect(page.locator('.badge-so').first()).toBeVisible();
});

test('Europa-Show badge visible on Phoebe Bridgers card', async ({ page }) => {
  await expect(page.locator('.badge-eu').first()).toBeVisible();
});

test('notification prompt shown on first load', async ({ page }) => {
  await expect(page.getByText('Benachrichtigungen aktivieren?')).toBeVisible();
});

test('notification prompt dismisses on confirm', async ({ page }) => {
  await page.getByRole('button', { name: 'Ja, benachrichtigen' }).click();
  await expect(page.locator('#np')).toBeHidden();
});

// ── Navigation ───────────────────────────────────────────────
test('clicking Alle anzeigen opens concerts list', async ({ page }) => {
  // <a class="sec-link"> has no href so getByRole('link') won't match; also scope to the
  // Konzerte section header (which has onclick) rather than the "Für Alicia" header
  await page.locator('#s-home a.sec-link[onclick]').click();
  await expect(page.locator('#s-concerts')).toBeVisible();
  await expect(page.getByText('Diese Woche')).toBeVisible();
  await expect(page.getByText('Nächster Monat')).toBeVisible();
  await expect(page.getByText('In den nächsten 6 Monaten')).toBeVisible();
});

test('concerts list back button returns to home', async ({ page }) => {
  await page.locator('#s-home a.sec-link[onclick]').click();
  await page.locator('#s-concerts .back-btn').click();
  await expect(page.locator('#s-home')).toBeVisible();
});

test('clicking concert row opens detail page', async ({ page }) => {
  await page.locator('#s-home a.sec-link[onclick]').click();
  await page.locator('#s-concerts .c-row').first().click();
  await expect(page.locator('#s-detail-remi')).toBeVisible();
  await expect(page.locator('#s-detail-remi').getByText('Tickets kaufen')).toBeVisible();
});

test('Phoebe Bridgers detail shows Europa notice', async ({ page }) => {
  await page.locator('#s-home a.sec-link[onclick]').click();
  await page.locator('#s-concerts .c-row', { hasText: 'Phoebe Bridgers' }).click();
  await expect(page.locator('#s-detail-phoebe')).toBeVisible();
  await expect(page.getByText(/einzigen Termin in Europa/)).toBeVisible();
});

// ── Concerts list filters ─────────────────────────────────────
test('radius dropdown changes filter meta text', async ({ page }) => {
  await page.locator('#s-home a.sec-link[onclick]').click();
  await page.selectOption('.radius-select', '200');
  await expect(page.locator('#filter-meta')).toContainText('200 km');
});

test('sold-out toggle hides sold-out rows', async ({ page }) => {
  await page.locator('#s-home a.sec-link[onclick]').click();
  const soldOut = page.locator('#s-concerts .c-row.sold-out').first();
  await expect(soldOut).toBeVisible();
  await page.locator('#so-toggle').click();
  await expect(soldOut).toBeHidden();
});

test('sold-out toggle restores rows when turned off again', async ({ page }) => {
  await page.locator('#s-home a.sec-link[onclick]').click();
  await page.locator('#so-toggle').click();
  await page.locator('#so-toggle').click();
  await expect(page.locator('#s-concerts .c-row.sold-out').first()).toBeVisible();
});
