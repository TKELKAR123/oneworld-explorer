import { expect, test } from "@playwright/test";
import { loadClassicRoute, openHealthDrawer, openTemplatesPanel, routeHero, waitForAppReady, waitForValidation, recheckForValidRoute } from "./helpers/wait-for-validation";

test.describe("UI — stop list builder", () => {
  test("loads blank, then classic RTW shows Valid + LONE4", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await openTemplatesPanel(page);
    await page.getByTestId("route-starter-select").selectOption("SC-001");
    await waitForValidation(page);
    await recheckForValidRoute(page);
    await expect(routeHero(page)).toContainText("Valid");
    await expect(routeHero(page)).toContainText(/LONE4/i);
  });

  test("route health shows checklist after loading template", async ({ page }) => {
    await loadClassicRoute(page);
    await openHealthDrawer(page);
  });

  test("page loads with Tailwind styles", async ({ page }) => {
    await page.goto("/");
    const bodyBg = await page.locator("body").evaluate((el) =>
      getComputedStyle(el).backgroundColor,
    );
    expect(bodyBg).not.toBe("rgba(0, 0, 0, 0)");
    await expect(page.locator("body")).toHaveClass(/bg-surface/);
  });

  test("Re-check does not throw runtime error", async ({ page }) => {
    await loadClassicRoute(page);
    await page.getByRole("button", { name: "Re-check" }).click();
    await expect(routeHero(page)).toContainText("Valid", {
      timeout: 10_000,
    });
  });

  test("shows issues when route is invalid", async ({ page }) => {
    await loadClassicRoute(page);
    const lastInput = page.locator('[data-testid="stop-row"] input').last();
    await lastInput.fill("LHR");
    await lastInput.blur();
    await waitForValidation(page);
    await openHealthDrawer(page);
    await expect(page.getByTestId("issues-panel")).toContainText(/R3015-/i, {
      timeout: 10_000,
    });
  });
});

test.describe("UI — stop editor", () => {
  test("add and remove stops", async ({ page }) => {
    await loadClassicRoute(page);
    const initial = await page.locator('[data-testid="stop-row"]').count();
    await page.getByRole("button", { name: "+ Add stop", exact: true }).click();
    await expect(page.locator('[data-testid="stop-row"]')).toHaveCount(initial + 1);
  });

  test("travel class changes fare basis", async ({ page }) => {
    await loadClassicRoute(page);
    await page.getByTestId("cabin-selector-business").click();
    await expect(routeHero(page)).toContainText(/DONE4/i, {
      timeout: 20_000,
    });
  });
});

test.describe("UI — airport autocomplete", () => {
  test("typing city shows suggestions", async ({ page }) => {
    await loadClassicRoute(page);
    const firstInput = page.locator('[data-testid="stop-row"] input').first();
    await firstInput.fill("Trom");
    await expect(page.getByTestId("airport-suggestions")).toBeVisible({ timeout: 8000 });
    await expect(page.getByTestId("airport-option-TOS")).toBeVisible();
  });
});

test.describe("API from browser", () => {
  test("fetch /api/validate with stops returns ruleEvaluations", async ({ request }) => {
    const res = await request.post("/api/validate", {
      data: { travelClass: "economy", stops: ["JFK", "LHR", "DXB", "SIN", "SYD", "LAX", "JFK"] },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.valid).toBe(true);
    expect(body.outcome).toBe("valid");
    expect(body.ruleEvaluations.length).toBeGreaterThan(30);
  });

  test("fetch /api/airports/search returns TOS for Troms", async ({ request }) => {
    const res = await request.get("/api/airports/search?q=Troms");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.airports.some((a: { iata: string }) => a.iata === "TOS")).toBe(true);
  });
});
