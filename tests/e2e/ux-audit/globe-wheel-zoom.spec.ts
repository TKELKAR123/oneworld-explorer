import { expect, test } from "@playwright/test";
import { readZoomPercent, scrollY, wheelOverGlobe } from "../helpers/globe-metrics";
import { waitForAppReady } from "../helpers/wait-for-validation";

test.describe("UX audit — globe wheel zoom", () => {
  test("wheel over globe zooms without scrolling the page", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await page.evaluate(() => window.scrollTo(0, 400));
    const yBefore = await scrollY(page);
    const zoomBefore = await readZoomPercent(page);

    await wheelOverGlobe(page, -400);
    await page.waitForTimeout(200);

    const yAfter = await scrollY(page);
    expect(yAfter).toBe(yBefore);

    const zoomAfter = await readZoomPercent(page);
    expect(zoomAfter).not.toBe(zoomBefore);
    expect(zoomAfter).toBeGreaterThanOrEqual(zoomBefore);
  });
});
