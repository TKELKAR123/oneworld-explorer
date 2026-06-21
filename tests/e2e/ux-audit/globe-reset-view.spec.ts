import { expect, test } from "@playwright/test";
import {
  dragGlobe,
  pickAirportFromSearch,
  readZoomPercent,
  wheelOverGlobe,
} from "../helpers/globe-metrics";
import { waitForAppReady } from "../helpers/wait-for-validation";

test.describe("UX audit — globe reset view", () => {
  test("reset restores 100% zoom after drag and zoom in", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await pickAirportFromSearch(page, "London", "LHR");
    await expect(page.getByText(/Next hops from LHR/i)).toBeVisible({ timeout: 10_000 });

    await page.getByTestId("globe-zoom-in").click();
    await page.getByTestId("globe-zoom-in").click();
    await wheelOverGlobe(page, -500);
    await dragGlobe(page, 80, 40);
    await page.waitForTimeout(300);

    await expect.poll(() => readZoomPercent(page)).toBeGreaterThan(100);

    await page.getByTestId("globe-reset-view").click();
    await expect.poll(() => readZoomPercent(page)).toBe(100);
    await page.waitForTimeout(1000);

    const shell = page.getByTestId("globe-canvas");
    const latBefore = Number((await shell.getAttribute("data-globe-pov-lat")) ?? "0");
    await dragGlobe(page, 0, -80);
    await page.waitForTimeout(400);
    const latAfter = Number((await shell.getAttribute("data-globe-pov-lat")) ?? "0");
    expect(Math.abs(latAfter - latBefore)).toBeGreaterThan(2);
  });
});
