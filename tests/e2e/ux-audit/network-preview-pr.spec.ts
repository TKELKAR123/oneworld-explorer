import { expect, test } from "@playwright/test";
import { waitForAppReady } from "../helpers/wait-for-validation";

test.describe("UX audit — PR preview toggle", () => {
  test("map overlays chrome removed from default explore toolbar", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await expect(page.getByText("Map overlays")).toHaveCount(0);
    await expect(page.getByTestId("preview-future-members-toggle")).toHaveCount(0);
  });
});
