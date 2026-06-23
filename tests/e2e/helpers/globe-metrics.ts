import { expect, type Locator, type Page } from "@playwright/test";

function exploreColumn(page: Page): Locator {
  return page.getByTestId("explore-column");
}

export async function scrollY(page: Page): Promise<number> {
  return page.evaluate(() => window.scrollY);
}

export async function readZoomPercent(page: Page): Promise<number> {
  const text = await exploreColumn(page).getByTestId("globe-zoom-controls").innerText();
  const match = text.match(/(\d+)%/);
  return match ? Number(match[1]) : 100;
}

export async function wheelOverGlobe(page: Page, deltaY: number) {
  const canvas = page.getByTestId("globe-canvas").first();
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  expect(box).toBeTruthy();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.wheel(0, deltaY);
}

export async function pickAirportFromSearch(page: Page, query: string, iata: string) {
  const search = exploreColumn(page).getByTestId("globe-airport-search");
  await expect(search).toBeVisible({ timeout: 15_000 });
  await search.fill(query);
  const option = page.getByTestId(`globe-search-option-${iata}`).first();
  await expect(option).toBeVisible({ timeout: 15_000 });
  await option.click();
}

export async function clickGlobeZoomIn(page: Page, times = 1) {
  const btn = exploreColumn(page).getByTestId("globe-zoom-in");
  await expect(btn).toBeVisible({ timeout: 15_000 });
  for (let i = 0; i < times; i++) {
    await btn.click({ force: true });
  }
}

export async function exitGlobeFullscreen(page: Page) {
  const overlay = page.getByTestId("globe-fullscreen-overlay");
  if (await overlay.isVisible().catch(() => false)) {
    await page.keyboard.press("Escape");
    await expect(overlay).not.toBeVisible({ timeout: 5_000 });
  }
}

export async function dragGlobe(page: Page, dx: number, dy: number) {
  const canvas = page.getByTestId("globe-canvas").first();
  const box = await canvas.boundingBox();
  expect(box).toBeTruthy();
  const cx = box!.x + box!.width / 2;
  const cy = box!.y + box!.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx + dx, cy + dy, { steps: 8 });
  await page.mouse.up();
}

export function routeHero(page: Page): Locator {
  return page.getByTestId("route-hero");
}
