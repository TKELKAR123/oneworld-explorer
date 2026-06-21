import { expect, test } from "@playwright/test";
import { loadClassicRoute } from "../helpers/wait-for-validation";

test.describe("screens — health drawer", () => {
  test("collapsed strip then expand shows checklist", async ({ page }) => {
    await loadClassicRoute(page);
    await expect(page.getByTestId("health-drawer-strip")).toBeVisible();
    await page.getByTestId("health-drawer-open").click();
    await expect(page.getByText("What's checked")).toBeVisible();
  });
});
