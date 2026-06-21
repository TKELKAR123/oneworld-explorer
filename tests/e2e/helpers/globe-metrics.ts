import { expect, type Locator, type Page } from "@playwright/test";

export async function scrollY(page: Page): Promise<number> {
  return page.evaluate(() => window.scrollY);
}

export async function readZoomPercent(page: Page): Promise<number> {
  const text = await page.getByTestId("globe-zoom-controls").innerText();
  const match = text.match(/(\d+)%/);
  return match ? Number(match[1]) : 100;
}

export async function wheelOverGlobe(page: Page, deltaY: number) {
  const canvas = page.getByTestId("globe-canvas");
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  expect(box).toBeTruthy();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.wheel(0, deltaY);
}

export async function pickAirportFromSearch(page: Page, query: string, iata: string) {
  await page.getByTestId("globe-airport-search").fill(query);
  await page.getByTestId(`globe-search-option-${iata}`).click();
}

export async function dragGlobe(page: Page, dx: number, dy: number) {
  const canvas = page.getByTestId("globe-canvas");
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
