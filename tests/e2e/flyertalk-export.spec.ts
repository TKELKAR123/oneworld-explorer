import { expect, test } from "@playwright/test";
import { loadClassicRoute } from "./helpers/wait-for-validation";

test.describe("FlyerTalk export", () => {
  test("copy button writes forum shorthand to clipboard", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await loadClassicRoute(page);

    await page.getByTestId("copy-flyertalk").click();
    await expect(page.getByTestId("copy-flyertalk")).toContainText(/Copied!/i, {
      timeout: 10_000,
    });

    await expect
      .poll(async () => page.evaluate(async () => navigator.clipboard.readText()), {
        timeout: 10_000,
      })
      .toMatch(/LONE4/);

    const text = await page.evaluate(async () => navigator.clipboard.readText());
    expect(text).toMatch(/JFK-LHR-DOH-SIN-SYD-LAX-JFK/);
  });
});
