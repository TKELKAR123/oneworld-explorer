import { expect, test } from "@playwright/test";

const CLASSIC_RTW = [
  { from: "JFK", to: "LHR" },
  { from: "LHR", to: "DXB" },
  { from: "DXB", to: "SIN" },
  { from: "SIN", to: "SYD" },
  { from: "SYD", to: "LAX" },
  { from: "LAX", to: "JFK" },
];

test.describe("UI — route builder core flow", () => {
  test("loads, validates default RTW, shows Valid + fare basis + segment budgets", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "oneworld Explorer" })).toBeVisible();
    await page.getByRole("button", { name: "Validate route" }).click();
    await expect(page.getByText(/Valid · rules 2026-02-27/)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Fare basis: LONE4/)).toBeVisible();
    await expect(page.getByText(/4 continents charged/)).toBeVisible();
    await expect(page.getByText(/Direction: east/)).toBeVisible();
  });

  test("shows rule trace with pdfRef when route is invalid", async ({ page }) => {
    await page.goto("/");
    const removeButtons = page.getByRole("button", { name: "Remove" });
    for (let i = (await removeButtons.count()) - 1; i >= 1; i--) {
      await removeButtons.nth(i).click();
    }
    await page.getByRole("button", { name: "Validate route" }).click();
    await expect(page.getByText(/Invalid · rules/)).toBeVisible({ timeout: 10_000 });
    await expect(page.locator(".issue .pdf-ref").first()).toBeVisible();
    await expect(page.locator(".issue-nl").first()).toBeVisible();
  });
});

test.describe("UI — segment editor", () => {
  test("add and remove segments", async ({ page }) => {
    await page.goto("/");
    const initialRows = await page.locator(".row").count();
    await page.getByRole("button", { name: "Add segment" }).click();
    await expect(page.locator(".row")).toHaveCount(initialRows + 1);
    await page.getByRole("button", { name: "Remove" }).last().click();
    await expect(page.locator(".row")).toHaveCount(initialRows);
  });

  test("surface sector checkbox toggles", async ({ page }) => {
    await page.goto("/");
    const surface = page.locator('input[type="checkbox"]').first();
    await expect(surface).not.toBeChecked();
    await surface.check();
    await expect(surface).toBeChecked();
  });

  test("travel class changes fare basis on valid RTW", async ({ page }) => {
    await page.goto("/");
    await page.locator("#class").selectOption("business");
    await page.getByRole("button", { name: "Validate route" }).click();
    await expect(page.getByText(/Fare basis: DONE4/)).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("UI — airport autocomplete", () => {
  test("typing city shows suggestions and selection updates field", async ({ page }) => {
    await page.goto("/");
    const fromInput = page.locator(".airport-field input").first();
    await fromInput.fill("Lon");
    await expect(page.locator(".airport-suggestions")).toBeVisible({ timeout: 5000 });
    await page.getByRole("button", { name: /LHR/ }).first().click();
    await expect(fromInput).toHaveValue("LHR");
  });
});

test.describe("UI — unknown airport", () => {
  test("invalid IATA shows parse error in validation panel", async ({ page }) => {
    await page.goto("/");
    const fromInput = page.locator(".airport-field input").first();
    await fromInput.fill("ZZZ");
    await page.getByRole("button", { name: "Validate route" }).click();
    await expect(page.getByText(/Invalid · rules/)).toBeVisible({ timeout: 10_000 });
    await expect(page.locator(".issue strong", { hasText: "UNKNOWN_AIRPORT" })).toBeVisible();
  });
});

test.describe("API from browser", () => {
  test("fetch /api/validate matches UI contract", async ({ request }) => {
    const res = await request.post("/api/validate", {
      data: { travelClass: "economy", segments: CLASSIC_RTW },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.valid).toBe(true);
    expect(body.analysis.suggestedFareBasis).toBe("LONE4");
  });

  test("fetch /api/airports/search returns structured airports", async ({ request }) => {
    const res = await request.get("/api/airports/search?q=Sydney");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.airports.some((a: { iata: string }) => a.iata === "SYD")).toBe(true);
  });
});
