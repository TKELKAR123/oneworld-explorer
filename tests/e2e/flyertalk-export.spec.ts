import { expect, test } from "@playwright/test";
import { loadClassicRoute } from "./helpers/wait-for-validation";

test.describe("FlyerTalk export", () => {
  test("copy button writes forum shorthand to clipboard", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await loadClassicRoute(page);

    await page.getByTestId("copy-flyertalk").click();
    await expect(page.getByTestId("copy-flyertalk")).toContainText(/Copied!/);

    const text = await page.evaluate(async () => navigator.clipboard.readText());
    expect(text).toMatch(/LONE4/);
    expect(text).toMatch(/JFK-LHR-DXB-SIN-SYD-LAX-JFK/);
  });
});
