import { expect, test } from "@playwright/test";

/**
 * Critical path E2E — ship gate.
 * Proves a real user can load the app, validate a route, and see explainable results.
 */

test.describe("critical path — ship gate", () => {
  test("app loads and default RTW validates successfully end-to-end", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "oneworld Explorer" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Validate route" })).toBeEnabled();

    await page.getByRole("button", { name: "Validate route" }).click();

    await expect(page.getByText(/Valid · rules 2026-02-27/)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Fare basis: LONE4/)).toBeVisible();
    await expect(page.getByText(/4 continents charged/)).toBeVisible();
    await expect(page.getByText(/Atlantic ✓/)).toBeVisible();
    await expect(page.getByText(/Pacific ✓/)).toBeVisible();
    await expect(page.getByText("No issues.")).toBeVisible();
  });

  test("invalid route shows ruleId, PDF ref, and natural language trace", async ({ page }) => {
    await page.goto("/");
    const removeButtons = page.getByRole("button", { name: "Remove" });
    while ((await removeButtons.count()) > 1) {
      await removeButtons.last().click();
    }
    await page.getByRole("button", { name: "Validate route" }).click();

    await expect(page.getByText(/Invalid · rules 2026-02-27/)).toBeVisible({ timeout: 15_000 });
    const issue = page.locator(".issue").first();
    await expect(issue.locator("strong")).toContainText(/R3015-/);
    await expect(issue.locator(".pdf-ref")).toBeVisible();
    await expect(issue.locator(".issue-nl")).toBeVisible();
  });

  test("autocomplete → validate flow works for a rebuilt route", async ({ page }) => {
    await page.goto("/");
    // Clear to single segment
    const removeButtons = page.getByRole("button", { name: "Remove" });
    while ((await removeButtons.count()) > 1) {
      await removeButtons.last().click();
    }

    const fromInput = page.locator(".airport-field input").first();
    const toInput = page.locator(".airport-field input").nth(1);

    await fromInput.fill("JFK");
    await toInput.fill("LHR");

    await page.getByRole("button", { name: "Validate route" }).click();
    await expect(page.getByText(/Invalid · rules/)).toBeVisible({ timeout: 15_000 });
  });

  test("API health endpoints respond from deployed server", async ({ request, baseURL }) => {
    const home = await request.get("/");
    expect(home.ok()).toBeTruthy();
    expect(await home.text()).toContain("oneworld Explorer");

    const validate = await request.post("/api/validate", {
      data: {
        travelClass: "economy",
        segments: [
          { from: "JFK", to: "LHR" },
          { from: "LHR", to: "DXB" },
          { from: "DXB", to: "SIN" },
          { from: "SIN", to: "SYD" },
          { from: "SYD", to: "LAX" },
          { from: "LAX", to: "JFK" },
        ],
      },
    });
    expect(validate.ok()).toBeTruthy();
    const body = await validate.json();
    expect(body.valid).toBe(true);
    expect(body.rulesVersion).toBe("2026-02-27");

    const search = await request.get("/api/airports/search?q=SYD");
    expect(search.ok()).toBeTruthy();
    const airports = await search.json();
    expect(airports.airports.some((a: { iata: string }) => a.iata === "SYD")).toBe(true);

    expect(baseURL).toBeTruthy();
  });
});
