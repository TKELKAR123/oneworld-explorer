import { expect, test } from "@playwright/test";
import { pickAirportFromSearch } from "./helpers/globe-metrics";
import { waitForAppReady, waitForGlobeAtlas } from "./helpers/wait-for-validation";

test.describe("globe — southern hemisphere", () => {
  test("drag in fullscreen lowers POV latitude", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await waitForGlobeAtlas(page);

    await pickAirportFromSearch(page, "London", "LHR");
    await expect(page.getByTestId("explore-destinations-panel")).toContainText(
      /Next hops from LHR/i,
      { timeout: 15_000 },
    );

    try {
      await page.getByTestId("globe-fullscreen-expand").click();
      const shell = page.getByTestId("globe-canvas").last();
      await expect(shell).toBeVisible();
      const canvas = shell.locator("canvas").first();
      await expect(canvas).toBeVisible();

      const box = await canvas.boundingBox();
      expect(box).not.toBeNull();
      if (!box) return;

      const cx = box.x + box.width / 2;
      const cy = box.y + box.height / 2;
      await page.mouse.move(cx, cy);
      await page.mouse.down();
      await page.mouse.move(cx, cy - 260, { steps: 16 });
      await page.mouse.up();
      await page.waitForTimeout(600);

      await expect
        .poll(async () => Number((await shell.getAttribute("data-globe-pov-lat")) ?? "90"))
        .toBeLessThan(-10);
    } finally {
      await page.keyboard.press("Escape");
    }
  });
});
